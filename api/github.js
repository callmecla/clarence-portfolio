/**
 * /api/github.js
 * Vercel Serverless Function — GitHub Contribution Graph
 *
 * Improvements over original:
 *  1. Security headers on every response.
 *  2. Explicit timeout on the GitHub fetch (8s) — prevents Vercel function
 *     from hanging for 10s on slow GitHub responses, which looks like a broken graph.
 *  3. Cleaner error logging — distinguishes auth errors from other failures
 *     so you can spot a expired token in Vercel logs immediately.
 *  4. Consistent error response shape matching chat.js.
 *
 * Environment variable required:
 *   GITHUB_TOKEN  →  GitHub PAT with scope: read:user
 */

const GITHUB_USERNAME = 'callmecla';

const LEVEL_MAP = {
  NONE:            0,
  FIRST_QUARTILE:  1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE:  3,
  FOURTH_QUARTILE: 4,
};

// ── Security headers applied to every response ──
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options',         'DENY');
  res.setHeader('Referrer-Policy',         'strict-origin-when-cross-origin');
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  // ── CORS — same-origin portfolio + localhost dev ──
  const origin  = req.headers.origin || '';
  const allowed = [
    'https://clarence-portfolio-rho.vercel.app',
    'https://clarenceflores.dev',
    'https://www.clarenceflores.dev',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  // ── Cache: Vercel Edge caches for 6 hrs, serves stale for 24 hrs ──
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('[github.js] GITHUB_TOKEN env var is not set');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    // ── Explicit 8-second timeout via AbortController ──
    const controller = new AbortController();
    const timeout    = setTimeout(function () { controller.abort(); }, 8000);

    let ghRes;
    try {
      ghRes = await fetch('https://api.github.com/graphql', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
          'User-Agent':    'clarence-portfolio/1.0',
        },
        body:   JSON.stringify({ query, variables: { login: GITHUB_USERNAME } }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!ghRes.ok) {
      const text = await ghRes.text().catch(function () { return ''; });

      // Distinguish auth errors (expired token) from other failures in logs
      if (ghRes.status === 401) {
        console.error('[github.js] Auth error — GITHUB_TOKEN may be expired or invalid');
      } else {
        console.error('[github.js] GitHub API HTTP error:', ghRes.status, text.slice(0, 200));
      }

      return res.status(502).json({ error: 'Could not fetch contribution data.' });
    }

    const data = await ghRes.json();

    if (data.errors) {
      console.error('[github.js] GraphQL errors:', JSON.stringify(data.errors).slice(0, 300));
      return res.status(502).json({ error: 'Could not fetch contribution data.' });
    }

    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      console.error('[github.js] Unexpected response shape — user or calendar missing');
      return res.status(404).json({ error: 'User not found or no contribution data.' });
    }

    const contributions = calendar.weeks.flatMap(function (week) {
      return week.contributionDays.map(function (day) {
        return {
          date:  day.date,
          count: day.contributionCount,
          level: LEVEL_MAP[day.contributionLevel] ?? 0,
        };
      });
    });

    return res.status(200).json({ contributions });

  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[github.js] GitHub API request timed out after 8s');
      return res.status(504).json({ error: 'Request timed out. Please try again.' });
    }
    console.error('[github.js] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Something went wrong fetching contribution data.' });
  }
}
