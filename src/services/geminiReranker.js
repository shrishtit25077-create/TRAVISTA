export async function reRankWithGemini(topMatches, userSignals) {
  const likedDests = Object.keys(userSignals.saved || {})
    .concat(Object.keys(userSignals.itinerary || {}));
  const likedCategories = Object.keys(userSignals.category || {});
  const currentMonth = new Date().getMonth() + 1;

  const prompt = `You are a travel recommendation AI.
User profile:
- Destinations they loved: ${likedDests.join(', ') || 'none yet'}
- Favourite categories: ${likedCategories.join(', ') || 'unknown'}
- Current month: ${currentMonth}

Top similarity matches (already scored):
${topMatches.map(m => `${m.destination}: ${m.score.toFixed(2)}`).join('\n')}

Re-rank these destinations for this user considering seasonality and their preferences.
For each, write a short "reason" (under 8 words, personal and specific, e.g. "Because you loved Bali's beaches").
Return ONLY a JSON array: [{"destination":"...","score":0.0,"reason":"..."}]
No markdown, no explanation, just the JSON array.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
    }
  );
  const data = await res.json();
  
  if (!data.candidates || !data.candidates[0].content.parts[0].text) {
    throw new Error('Gemini API failed');
  }

  const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}
