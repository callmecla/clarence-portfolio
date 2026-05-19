export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const messages = body.messages || [];
    const system = body.system || '';
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing API key' });
    }

    // Call Anthropic API
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: Math.min(Number(body.max_tokens) || 300, 1024),
        system: system,
        messages: messages
      })
    });

    let data;

    try {
      data = await upstream.json();
    } catch (err) {
      console.error('Invalid JSON from Anthropic:', err);
      return res.status(502).json({ error: 'Invalid response from AI provider' });
    }

    // Handle API errors
    if (!upstream.ok) {
      const msg =
        (data.error && (data.error.message || data.error.type)) ||
        'Anthropic request failed';

      return res.status(upstream.status).json({ error: msg });
    }

    // Extract reply
    const text =
      data.content &&
      data.content[0] &&
      data.content[0].text;

    return res.status(200).json({
      reply: text || ''
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}