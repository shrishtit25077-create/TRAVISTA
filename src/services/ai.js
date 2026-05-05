export async function generateTrip(prompt) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!geminiKey) throw new Error("Gemini API key missing");

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `You are Travista's AI Co-Pilot. 
If the user asks for a specific trip, generate a detailed itinerary with duration, budget, and activities.
If the user asks for destination recommendations (e.g., based on weather, budget, or group size), return the top 5 matching destinations with weather data, prices, and reasons why they match. 
Use clear markdown formatting, emojis, and a highly engaging tone.\n\nUser: ${prompt}` }] }],
      generationConfig: { temperature: 0.5 },
    }),
  });

  if (!res.ok) throw new Error("AI failed");

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI returned no text");

  return text;
}

export async function smartSearch(query) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!geminiKey) throw new Error("Gemini API key missing");

  const prompt = `You are an AI travel search engine. The user searched for: "${query}".
Return a JSON array of up to 5 matching destinations. 
ONLY return valid JSON. Do not use markdown blocks.
Format exactly like this:
[
  { "name": "Goa", "flag": "🇮🇳", "hierarchy": "India" },
  { "name": "Maldives", "flag": "🇲🇻", "hierarchy": "South Asia" }
]`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3 },
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];

  try {
    const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Search Parse Error", e);
    return [];
  }
}

export async function generateCaptions(destination) {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!geminiKey) throw new Error("Gemini API key missing");

  const prompt = `You are a social media expert. Write 3 distinct Instagram captions for a beautiful photo taken in ${destination}.
Return ONLY a valid JSON array of strings, no markdown blocks. 
Example: ["Witty caption...", "Poetic caption...", "Informative caption..."]`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error("AI failed");

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI returned no text");

  try {
    const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Captions Parse Error", e);
    return [];
  }
}
