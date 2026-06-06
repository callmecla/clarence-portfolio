/**
 * /api/github.js
 * Vercel Serverless Function — GitHub Contribution Graph
 *
 * Fetches the last 52 weeks of contribution data for a GitHub user
 * using the GitHub GraphQL API and a Personal Access Token stored
 * securely as a Vercel environment variable.
 *
 * Environment variable required:
 *   GITHUB_TOKEN  →  a GitHub PAT with scope: read:user
 *
 * Response shape (mirrors the old deno API so the frontend needs minimal changes):
 *   { contributions: [ { date: "YYYY-MM-DD", count: number, level: 0-4 }, … ] }
 */

const GITHUB_USERNAME = 'callmecla'; // ← change if your username ever changes

// GitHub's contributionLevel enum → numeric level (0-4)
const LEVEL_MAP = {
  NONE:           0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE:2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE:4,
};

export default async function handler(req, res) {
  // ── CORS: allow your own domain + localhost dev ──
  const origin = req.headers.origin || '';
  const allowed = [
    'https://clarence-portfolio-rho.vercel.app/',
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

  // ── Cache: tell Vercel Edge + browsers to cache for 6 hours ──
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN env var is not set' });
  }

  // ── GitHub GraphQL query ──
  // contributionsCollection defaults to the last 52 weeks from today.
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
    const ghRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // GitHub requires a User-Agent
        'User-Agent': 'clarence-portfolio/1.0',
      },
      body: JSON.stringify({ query, variables: { login: GITHUB_USERNAME } }),
    });

    if (!ghRes.ok) {
      const text = await ghRes.text();
      console.error('[github.js] GitHub API HTTP error:', ghRes.status, text);
      return res.status(502).json({ error: 'GitHub API request failed', status: ghRes.status });
    }

    const data = await ghRes.json();

    // GraphQL errors come back as 200 with an `errors` field
    if (data.errors) {
      console.error('[github.js] GraphQL errors:', data.errors);
      return res.status(502).json({ error: data.errors[0]?.message || 'GraphQL error' });
    }

    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      return res.status(404).json({ error: 'User not found or no contribution data' });
    }

    // ── Flatten weeks → flat array of day objects ──
    const contributions = calendar.weeks.flatMap(week =>
      week.contributionDays.map(day => ({
        date:  day.date,
        count: day.contributionCount,
        level: LEVEL_MAP[day.contributionLevel] ?? 0,
      }))
    );

    return res.status(200).json({ contributions });

  } catch (err) {
    console.error('[github.js] Unexpected error:', err);
    return res.status(500).json({ error: err.message });
  }
}
