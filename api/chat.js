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

    const systemPrompt = `
    You are an AI assistant for Clarence Kyle Flores' portfolio website.
    Your role:
    - Help visitors learn about Clarence
    - Answer questions about his skills, projects, and experience
    - Guide recruiters or clients professionally
    
    About Clarence:
    - A web developer focused on modern, clean, and responsive design
    - Skilled in JavaScript, HTML, CSS, and building interactive web apps
    - Passionate about creating smooth user experiences
    
    Personality:
    - Friendly but professional
    - Confident, not robotic
    - Clear and concise
    
    Rules:
    - Stay focused on Clarence and his work
    - Be helpful and direct
    `;

    const userPrompt = messages.map(m => m.content).join('\n');
    
    const fullPrompt = systemPrompt + "\n\nUser:\n" + userPrompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({
        error: data.error?.message || 'Gemini request failed'
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
}