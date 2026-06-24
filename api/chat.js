/**
 * Vercel Serverless Function — proxies portfolio chat to Google Gemini.
 * Set GEMINI_API_KEY in Vercel → Project Settings → Environment Variables.
 * Optional: GEMINI_MODEL (defaults to gemini-2.0-flash).
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const system = body.system;
    const messages = body.messages;

    if (!system || typeof system !== 'string') {
      return res.status(400).json({ error: 'Missing system prompt' });
    }
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'No messages provided' });
    }
    if (messages.length > 20) {
      return res.status(400).json({ error: 'Too many messages' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const maxTokens = Math.min(Number(body.max_tokens) || 300, 1024);

    const contents = messages
      .filter(function (m) {
        return m && (m.role === 'user' || m.role === 'assistant') && m.content;
      })
      .map(function (m) {
        return {
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content).slice(0, 4000) }]
        };
      });

    if (!contents.length) {
      return res.status(400).json({ error: 'No valid messages provided' });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: contents,
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
        })
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      return res.status(502).json({ error: 'Invalid response from Gemini' });
    }

    if (!response.ok) {
      const msg =
        (data.error && (data.error.message || data.error.status)) ||
        'Gemini request failed';
      return res.status(response.status >= 400 && response.status < 600 ? response.status : 502).json({ error: msg });
    }

    const candidate = data.candidates && data.candidates[0];
    const reply =
      candidate &&
      candidate.content &&
      candidate.content.parts &&
      candidate.content.parts[0] &&
      candidate.content.parts[0].text;

    if (!reply) {
      const blocked = candidate && candidate.finishReason === 'SAFETY';
      return res.status(200).json({
        reply: blocked
          ? 'Sorry, I could not answer that. Try asking about Clarence\'s skills, projects, or experience.'
          : 'No response from AI'
      });
    }

    return res.status(200).json({ reply: reply });
  } catch (err) {
    console.error('[api/chat]', err);
    return res.status(500).json({ error: 'AI service unavailable' });
  }
}