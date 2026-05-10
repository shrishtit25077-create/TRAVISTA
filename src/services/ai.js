/**
 * Travista AI Engine (Production Grade)
 * Optimized for real-time itinerary generation with multi-model redundancy.
 */

// Use VITE_OPENROUTER_KEY from .env
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_KEY;

const MODELS = [
  "meta-llama/llama-3-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "openchat/openchat-7b:free"
];

const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 20000; // 20 seconds

/**
 * Exponential backoff delay
 */
const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Local Fallback Generator
 * Used when all API models fail to ensure the user always gets a premium itinerary.
 */
function generateLocalFallback(prompt) {
  console.log(`[AI Engine] 🛡️ Triggering Local Fallback for: ${prompt}`);
  
  // Extract destination from prompt if possible
  const destMatch = prompt.match(/to (.*?) with/i) || prompt.match(/in (.*?) /i) || [null, "your dream destination"];
  const dest = destMatch[1] || "your selected destination";

  return {
    title: `Ultimate Discovery: ${dest}`,
    summary: `A meticulously crafted journey through the heart of ${dest}, balancing iconic landmarks with exclusive local secrets.`,
    bestSeason: "Spring & Autumn (Recommended)",
    budget: "Tailored Luxury / Mid-range",
    days: [
      {
        day: 1,
        title: "Arrival & City Immersion",
        morning: `Arrival in ${dest} and private transfer to your boutique stay. Morning walk through the historic district.`,
        afternoon: `A curated guided tour of the city's most iconic landmarks and architectural wonders.`,
        evening: `Welcome dinner at a hand-picked rooftop restaurant with panoramic views of ${dest}.`,
        stay: "Premium Boutique Hotel",
        food: "Local Signature Tasting Menu"
      },
      {
        day: 2,
        title: "Hidden Gems & Local Rhythms",
        morning: `Venture off the beaten path to discover secret artisan markets and quiet residential squares.`,
        afternoon: `Experience ${dest}'s vibrant culture through a private workshop with a local master craftsman.`,
        evening: `Enjoy a live performance or a quiet stroll along the city's illuminated waterfront.`,
        stay: "Premium Boutique Hotel",
        food: "Traditional Street Food Delights"
      },
      {
        day: 3,
        title: "Final Serenity & Departure",
        morning: `Early morning meditation or a quiet café breakfast as the city wakes up.`,
        afternoon: `Last-minute discovery or souvenir shopping in the artisanal quarter.`,
        evening: `Transfer to the airport for your journey home, carrying the spirit of ${dest}.`,
        stay: "Departure",
        food: "Riverside Farewell Lunch"
      }
    ],
    tips: [
      "Always carry a reusable water bottle to stay hydrated.",
      "Learn a few basic local phrases; it goes a long way.",
      "Use local transport for an authentic experience."
    ],
    weather: "Pleasant with clear skies expected.",
    hiddenGems: [
      "The quiet garden behind the main library",
      "A small family-run bakery on the east side"
    ]
  };
}

/**
 * Fetch wrapper with timeout support
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = REQUEST_TIMEOUT } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

/**
 * Generates a structured travel itinerary.
 * Cycles through models on failure and retries up to MAX_RETRIES.
 * Guaranteed to return a valid itinerary (local fallback as last resort).
 */
export async function generateNewTrip(prompt, retryCount = 0) {
  if (!OPENROUTER_API_KEY) {
    console.error("[AI Engine] Missing API Key. Using local fallback.");
    return generateLocalFallback(prompt);
  }

  const modelIndex = retryCount % MODELS.length;
  const currentModel = MODELS[modelIndex];

  console.group(`[AI Engine] Attempt ${retryCount + 1}`);
  console.log(`Model: ${currentModel}`);

  try {
    const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Travista AI Architect",
      },
      body: JSON.stringify({
        model: currentModel,
        messages: [
          {
            role: "system",
            content: `You are the Travista AI Trip Architect. Return ONLY a valid JSON object. No Markdown. No text before/after.
            {
              "title": "...", "summary": "...", "bestSeason": "...", "budget": "...",
              "days": [{ "day": 1, "title": "...", "morning": "...", "afternoon": "...", "evening": "...", "stay": "...", "food": "..." }],
              "tips": ["...", "..."], "weather": "...", "hiddenGems": ["...", "..."]
            }`
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.75,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsedData = JSON.parse(content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
    console.groupEnd();
    return parsedData;

  } catch (err) {
    console.warn(`[AI Engine] Attempt ${retryCount + 1} failed:`, err.message);
    console.groupEnd();

    if (retryCount < MAX_RETRIES) {
      const backoffDelay = Math.pow(2, retryCount) * 1000;
      console.log(`[AI Engine] Retrying in ${backoffDelay}ms...`);
      await delay(backoffDelay);
      return generateNewTrip(prompt, retryCount + 1);
    }

    // Ultimate Safety Net
    console.error("[AI Engine] All API attempts failed. Returning premium local fallback.");
    return generateLocalFallback(prompt);
  }
}

/** Legacy support */
export async function generateAITrip(params) {
  const prompt = `A ${params.days}-day trip to ${params.destination} with a ${params.type} style and ${params.budget} budget.`;
  return generateNewTrip(prompt);
}

export async function generateTrip(params) {
  return generateAITrip(params);
}

/** Navbar search integration stub */
export async function smartSearch(term) {
  return [];
}

/** Caption generation stub */
export async function generateCaptions(destination) {
  return ["Discover " + destination, "Adventure in " + destination];
}
