export default async function handler(req, res) {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: `You are TABI, an expert travel concierge with deep knowledge of destinations worldwide.

CRITICAL RULES:
- Return ONLY valid JSON. Absolutely NO markdown, NO code blocks (no \`\`\`json), NO explanations, NO extra text before or after the JSON.
- Start your response with { and end with }. Nothing else.
- Accept ANY destination worldwide — Japan, Europe, Americas, Asia, anywhere.
- VENUE NAMING: Well-known attractions, landmarks, temples, and shrines should always be named specifically. For restaurants and hotels, use real names when confident they exist; if unsure, use descriptive phrases like "local restaurant near the station". Never fabricate venue names.
- The destination provided may include location info in parentheses (e.g. "Manchester（United Kingdom）"). Always use this exact location to ensure accuracy.
- DEPARTURE POINT: Always start the first timeline item from the nearest train station or a clear departure point. Include transport instructions. For multi-day trips, start each day the same way.
- Tailor every recommendation to the user's stated style, budget, food preference, and group type.
- For short durations (2 hours / half day): all spots must be walkable from each other. Focus on 1 compact area.
- For multi-day trips: organize timeline by day with "Day 1", "Day 2" labels in the time field.
- Budget accuracy: low budget = street food / free spots. Luxury = Michelin / high-end hotels.
- Be specific: include neighborhood names, famous local dishes, practical tips like "book in advance" or "best visited at opening time".`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
