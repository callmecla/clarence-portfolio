/**
 * /api/chat.js
 * Vercel Serverless Function — Gemini AI Chat
 *
 * Improvements over original:
 *  1. Rate limiting — 15 requests per IP per hour (in-memory, resets on cold start)
 *     Protects against Gemini quota exhaustion from bots or spam.
 *  2. Input validation & sanitization — rejects oversized payloads and
 *     trims/truncates message content before forwarding to Gemini.
 *  3. Conversation history cap — max 10 turns kept, prevents token bloat.
 *  4. Consistent error responses — never leaks internal error details to client.
 *  5. Security headers on every response.
 */

// ── In-memory rate limit store ──
// Keyed by IP. Resets naturally on Vercel cold starts (every ~5 min on free tier).
// Good enough for a portfolio — not suitable for high-traffic production apps.
const RATE_STORE = new Map();
const RATE_LIMIT  = 15;   // max requests
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function isRateLimited(ip) {
  const now  = Date.now();
  const entry = RATE_STORE.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW) {
    // First request or window expired — reset
    RATE_STORE.set(ip, { count: 1, start: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

// ── Input limits ──
const MAX_MESSAGE_LENGTH  = 500;   // chars per message
const MAX_HISTORY_TURNS   = 10;    // max user+assistant pairs kept
const MAX_MESSAGES_TOTAL  = MAX_HISTORY_TURNS * 2;

// ── Security headers applied to every response ──
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options',  'nosniff');
  res.setHeader('X-Frame-Options',          'DENY');
  res.setHeader('Referrer-Policy',          'strict-origin-when-cross-origin');
}

// ── Sanitize a single message string ──
// Trims whitespace and hard-caps length to prevent token bloat / prompt injection.
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, MAX_MESSAGE_LENGTH);
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Rate limiting ──
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
          || req.socket?.remoteAddress
          || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a while before trying again.'
    });
  }

  // ── Validate request body ──
  const body = req.body || {};
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body.' });
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];

  // ── Sanitize and cap conversation history ──
  const messages = rawMessages
    .filter(function (m) {
      return m && (m.role === 'user' || m.role === 'assistant') && m.content;
    })
    .slice(-MAX_MESSAGES_TOTAL)          // keep only recent turns
    .map(function (m) {
      return { role: m.role, content: sanitizeText(m.content) };
    })
    .filter(function (m) { return m.content.length > 0; }); // drop empty after trim

  if (!messages.length || messages[0].role !== 'user') {
    return res.status(400).json({ error: 'Conversation must start with a user message.' });
  }

  // ── API key ──
  const apiKey = process.env.Gemini_API_Key;
  if (!apiKey) {
    console.error('[chat.js] Gemini_API_Key env var is not set');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // ── Build Gemini request ──
  const systemInstruction = {
    parts: [{
      text: `
You are an AI assistant embedded in Clarence Kyle Flores' personal portfolio website.
Your only purpose is to answer questions about Clarence and his work.

About Clarence:
- IT Student at Quezon City University (B.S. Information Technology, GPA 1.75, Dean's List)
- Previously at Our Lady of Fatima University (STEM strand, Dean's List, Honors)
- Completed a UX Design Bootcamp at Design Academy Online (Summer 2022)

Experience:
- Senior Frontend Engineer at TechCorp (Jan 2024 – Present): SaaS dashboard redesign, 62% load time reduction, mentored 3 junior devs, built component library across 5 products. Stack: React, TypeScript, GraphQL, Figma.
- Full-Stack Developer at StartupXYZ (Jun 2022 – Dec 2023): Built fintech app from scratch, 3 payment APIs, WebSocket notifications. Stack: Next.js, Node.js, PostgreSQL, AWS.
- Junior Web Developer at Agency Co. (Sep 2021 – May 2022): 12+ client websites, CI/CD pipelines. Stack: HTML/CSS, JavaScript, WordPress.

Projects: LaunchPad (no-code builder, 1200+ users), MindMap AI, DataPulse, Pixel Studio, VaultPass, EcoTrack (hackathon winner).
Skills: React/Next.js, TypeScript, Node.js, Python/FastAPI, PostgreSQL, Redis, AWS/GCP, Docker, Figma.
Certifications: AWS Solutions Architect, Google Cloud Developer, Meta Frontend, CompTIA Security+, Python for Data Science, MongoDB.
Contact: flores.clarencekyle.manrique@gmail.com | linkedin.com/in/clarenceflores8 | github.com/callmecla

Rules:
- Be friendly, confident, and concise — not robotic.
- Only answer questions about Clarence and his professional work.
- If asked something unrelated (e.g. write code, general knowledge), politely decline and redirect.
- Keep answers to 2–4 sentences unless a detailed breakdown is requested.
- Never make up information not listed above. If unsure, suggest contacting Clarence directly.
      `.trim()
    }]
  };

  const contents = messages.map(function (m) {
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    };
  });

  // ── Call Gemini ──
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction,
          contents,
          generationConfig: {
            maxOutputTokens: 512,
            temperature:     0.7,
          }
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      // Log the real error server-side, return a safe message to client
      console.error('[chat.js] Gemini API error:', geminiRes.status, JSON.stringify(data));
      return res.status(502).json({ error: 'AI service is temporarily unavailable. Please try again shortly.' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      console.error('[chat.js] Unexpected Gemini response shape:', JSON.stringify(data));
      return res.status(502).json({ error: 'Received an unexpected response from the AI. Please try again.' });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    // Network error or JSON parse failure — log internally, return safe message
    console.error('[chat.js] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again or email Clarence directly.' });
  }
}
