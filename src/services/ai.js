const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;

export async function generateAITrip({ destination, budget, days, type }) {
  const prompt = `
Create a detailed travel plan.

Destination: ${destination}
Budget: ₹${budget}
Days: ${days}
Traveler Type: ${type}

Return STRICT JSON in this format:
{
  "summary": "",
  "hotels": [{ "name": "", "price": 0 }],
  "itinerary": [
    { "day": 1, "plan": ["", "", ""] }
  ],
  "tips": []
}
`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    
    // Parse the JSON block safely in case mistral adds markdown ticks
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    
    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error("OpenRouter AI failed:", err);
    return null; // fallback trigger
  }
}

export async function generateTrip(prompt) {
  if (!API_KEY) throw new Error("OpenRouter API key missing");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: `You are Travista's AI Co-Pilot. 
If the user asks for a specific trip, generate a detailed itinerary with duration, budget, and activities.
If the user asks for destination recommendations (e.g., based on weather, budget, or group size), return the top 5 matching destinations with weather data, prices, and reasons why they match. 
Use clear markdown formatting, emojis, and a highly engaging tone.\n\nUser: ${prompt}` }],
    }),
  });

  if (!res.ok) throw new Error("AI failed");

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI returned no text");

  return text;
}

export async function smartSearch(query) {
  if (!API_KEY) throw new Error("OpenRouter API key missing");

  const prompt = `You are an AI travel search engine. The user searched for: "${query}".
Return a JSON array of up to 5 matching destinations. 
ONLY return valid JSON. Do not use markdown blocks.
Format exactly like this:
[
  { "name": "Goa", "flag": "🇮🇳", "hierarchy": "India" },
  { "name": "Maldives", "flag": "🇲🇻", "hierarchy": "South Asia" }
]`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
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
  if (!API_KEY) throw new Error("OpenRouter API key missing");

  const prompt = `You are a social media expert. Write 3 distinct Instagram captions for a beautiful photo taken in ${destination}.
Return ONLY a valid JSON array of strings, no markdown blocks. 
Example: ["Witty caption...", "Poetic caption...", "Informative caption..."]`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error("AI failed");

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI returned no text");

  try {
    const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Captions Parse Error", e);
    return [];
  }
}
