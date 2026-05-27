export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages = [] } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing Gemini API key' });
    }

    // ── System prompt with full info about Clarence ──
    const systemInstruction = {
      parts: [
        {
          text: `
You are an AI assistant embedded in Clarence Kyle Flores' portfolio website.

About Clarence:
- IT Student at Quezon City University (B.S. Information Technology, GPA 1.75, Dean's List)
- Previously at Our Lady of Fatima University (STEM strand, Dean's List, Honors)
- Completed a UX Design Bootcamp at Design Academy Online (Summer 2022)

Experience:
- Senior Frontend Engineer at TechCorp (Jan 2024 – Present): Led flagship SaaS dashboard redesign, cut load time by 62%, mentored 3 junior devs, built component library used across 5 products. Stack: React, TypeScript, GraphQL, Figma.
- Full-Stack Developer at StartupXYZ (Jun 2022 – Dec 2023): Built customer-facing fintech app from scratch, integrated 3 payment APIs, added real-time WebSocket notifications. Stack: Next.js, Node.js, PostgreSQL, AWS.
- Junior Web Developer at Agency Co. (Sep 2021 – May 2022): Built 12+ responsive client websites, set up CI/CD pipelines. Stack: HTML/CSS, JavaScript, WordPress.

Projects:
- LaunchPad: No-code landing page builder with drag-and-drop, live preview, Vercel deploy. 1,200+ beta users. (React, Node, Vercel)
- MindMap AI: AI-powered knowledge graph using embeddings and force-directed graph UI. (Python, D3.js, OpenAI)
- DataPulse: Real-time analytics dashboard ingesting 50k+ events/sec via Kafka, custom WebGL charts. (Kafka, WebGL, Go)
- Pixel Studio: Collaborative real-time pixel art editor via WebRTC. Featured on Product Hunt. (WebRTC, Canvas, OT)
- VaultPass: E2E encrypted password manager, zero-knowledge architecture, TOTP, browser extension. (Crypto, Rust)
- EcoTrack: Carbon footprint tracker with gamification. Won 1st place at a climate-tech hackathon. (Vue, Firebase, Maps)

Skills:
- Frontend: React/Next.js (3 yrs, 8 projects), TypeScript (2 yrs), CSS/Tailwind (3 yrs), Three.js/WebGL
- Backend: Node.js (2 yrs), Python/FastAPI (2 yrs), PostgreSQL (2 yrs), Redis
- DevOps & Tools: AWS/GCP, Docker/K8s, Git/CI/CD, Figma

Certifications:
- AWS Solutions Architect – Associate (Mar 2024)
- Google Professional Cloud Developer (Nov 2023)
- Meta Frontend Developer Professional (Jun 2023)
- CompTIA Security+ (Jan 2023)
- Python for Data Science – IBM/Coursera (Aug 2022)
- MongoDB Developer Certification (Apr 2022)

Contact:
- Email: flores.clarencekyle.manrique@gmail.com
- LinkedIn: linkedin.com/in/clarenceflores8
- GitHub: github.com/callmecla
- Facebook: facebook.com/clarenceflores.midzydive

Personality & rules:
- Be friendly, confident, and concise — not robotic
- Stay focused on Clarence and his work
- If asked something outside your knowledge about Clarence, suggest contacting him directly
- Keep answers short (2–4 sentences unless a detailed breakdown is asked for)
          `.trim()
        }
      ]
    };

    // ── Convert { role, content } history to Gemini's `contents` format ──
    // Gemini uses 'user' and 'model' (not 'assistant')
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Gemini requires the conversation to start with a 'user' turn
    if (!contents.length || contents[0].role !== 'user') {
      return res.status(400).json({ error: 'Conversation must start with a user message.' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction, // ← proper Gemini system prompt field
          contents,          // ← full multi-turn conversation history
          generationConfig: {
            maxOutputTokens: 512,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(500).json({
        error: data.error?.message || 'Gemini request failed'
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
