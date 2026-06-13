export default async function handler(req, res) {
  // ✅ CORS (safe for portfolio)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const username = 'YOUR_GITHUB_USERNAME';
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'Missing GitHub token' });
    }

    const query = {
      query: `
        query {
          user(login: "${username}") {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `
    };

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    const data = await response.json();

    if (data.errors) {
      console.error(data.errors);
      return res.status(500).json({ error: 'GitHub API error' });
    }

    const days =
      data.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        week => week.contributionDays
      );

    res.status(200).json(days);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
