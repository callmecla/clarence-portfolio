/**
 * Vercel Serverless Function — GitHub contribution graph for callmecla.
 * Optional: GITHUB_TOKEN for GraphQL (higher rate limits).
 * Falls back to a public contributions API when no token is set.
 */
const USERNAME = 'callmecla';

function toLevel(count) {
  if (!count) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

function normalizeDays(days) {
  return days.map(function (d) {
    const count = d.count != null ? d.count : (d.contributionCount || 0);
    return {
      date: d.date,
      count: count,
      level: d.level != null ? d.level : toLevel(count)
    };
  });
}

async function fetchViaGraphQL(token) {
  const query = {
    query: [
      'query($login: String!) {',
      '  user(login: $login) {',
      '    contributionsCollection {',
      '      contributionCalendar {',
      '        weeks {',
      '          contributionDays { date contributionCount }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}'
    ].join(' ')
  };

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: query.query, variables: { login: USERNAME } })
  });

  const data = await response.json();
  if (!response.ok || data.errors) {
    throw new Error((data.errors && data.errors[0] && data.errors[0].message) || 'GitHub GraphQL error');
  }

  const weeks =
    data.data &&
    data.data.user &&
    data.data.user.contributionsCollection &&
    data.data.user.contributionsCollection.contributionCalendar &&
    data.data.user.contributionsCollection.contributionCalendar.weeks;

  if (!weeks) throw new Error('No contribution data');

  return normalizeDays(
    weeks.flatMap(function (week) {
      return week.contributionDays || [];
    })
  );
}

async function fetchViaPublicApi() {
  const response = await fetch(
    'https://github-contributions-api.jogruber.de/v4/' + USERNAME + '?y=last'
  );
  if (!response.ok) throw new Error('Public GitHub API HTTP ' + response.status);

  const data = await response.json();
  const contributions = data.contributions || data;
  if (!Array.isArray(contributions)) throw new Error('Unexpected public API shape');

  return normalizeDays(contributions);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const contributions = token
      ? await fetchViaGraphQL(token)
      : await fetchViaPublicApi();

    return res.status(200).json({ contributions: contributions });
  } catch (err) {
    console.error('[api/github]', err);
    return res.status(502).json({ error: 'Could not load GitHub contributions' });
  }
}
