// src/services/ai.js
// ─────────────────────────────────────────────
// Travista AI — trip generation via OpenRouter
// ─────────────────────────────────────────────

const FALLBACK_MODELS = [
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.1-8b-instruct',
  'mistralai/mistral-7b-instruct',
  'google/gemma-7b-it'
];

const SYSTEM_PROMPT = `You are Travista AI, a world-class travel planner specialised in crafting vivid, actionable itineraries.

When given a travel request, respond ONLY with a valid JSON object — no markdown, no backticks, no explanation. Use this exact schema:

{
  "title": "Short evocative trip title (e.g. '7 Days in Tokyo')",
  "budget": "Budget label matching the user's request (e.g. 'Budget', 'Mid-Range', 'Luxury', 'Tailored Luxury / Mid-Range')",
  "flightEst": "Round-trip flight cost estimate in Indian Rupees (e.g. '₹28,500+', '₹1.1L+')",
  "hotelEst": "Hotel nightly rate estimate in Indian Rupees (e.g. '₹6,200/nt', '₹18,000/nt')",
  "days": [
    {
      "day": 1,
      "title": "Evocative day title (e.g. 'Arrival & Old Town Wander')",
      "morning": "Specific, vivid morning activity with place names and tips",
      "afternoon": "Specific, vivid afternoon activity with place names and tips",
      "evening": "Specific, vivid evening activity with place names and tips",
      "food": "Specific restaurant or market name + dish recommendation",
      "stay": "Specific hotel or neighbourhood recommendation",
      "attractions": "Top nearby attractions to consider",
      "transport": "Best way to get around today"
    }
  ]
}

Rules:
- Match the number of days to whatever the user requested (e.g. "3 days" → 3 items in days array).
- All text must be specific and grounded — real place names, real dishes, real neighbourhoods.
- Keep each activity description concise and actionable.
- Include specific hotel suggestions, budget estimates, nearby attractions, food, and transport.
- Return ONLY the JSON object. Nothing else.`;

async function fetchWithFallback(prompt, systemPrompt = SYSTEM_PROMPT) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': window.location.origin, // Required for OpenRouter
    'X-Title': 'Travista AI', // Required for OpenRouter
    'Content-Type': 'application/json'
  };

  let lastError = null;

  for (const model of FALLBACK_MODELS) {
    console.log(`[AI Service] Attempting request with model: ${model}`);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 2500
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.warn(`[AI Service] Model ${model} failed:`, errorBody);
        lastError = new Error(errorBody?.error?.message || `API error ${response.status}`);
        continue; // Try next model
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || '';
      if (!raw) {
        console.warn(`[AI Service] Model ${model} returned empty response.`);
        lastError = new Error('The AI returned an empty response.');
        continue; // Try next model
      }

      console.log(`[AI Service] Success with model: ${model}`);
      
      const clean = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      console.warn(`[AI Service] Exception with model ${model}:`, err);
      lastError = err;
    }
  }

  console.error('[AI Service] All fallback models failed.', lastError);
  throw new Error('Our AI agents are currently overwhelmed. Please try again in a moment.');
}

/**
 * Generate a full trip itinerary from a natural-language request.
 */
export async function generateNewTrip(userRequest) {
  if (!userRequest?.trim()) throw new Error('Travel request cannot be empty.');
  return await fetchWithFallback(userRequest.trim());
}

/**
 * Regenerate just one day within an existing plan.
 */
export async function regenerateDay(plan, dayIndex) {
  const day = plan.days[dayIndex];
  if (!day) throw new Error(`Day ${dayIndex + 1} does not exist in the plan.`);

  const prompt = `I have a ${plan.days.length}-day trip called "${plan.title}" with a ${plan.budget} budget.
Regenerate only Day ${day.day} ("${day.title}") with fresh ideas.
Return ONLY a JSON object for that single day using this schema:
{"day":${day.day},"title":"...","morning":"...","afternoon":"...","evening":"...","food":"...","stay":"...","attractions":"...","transport":"..."}`;

  return await fetchWithFallback(prompt, 'You are Travista AI. Return ONLY a valid JSON object.');
}

/**
 * Generate Instagram captions for a destination.
 */
export async function generateCaptions(destination) {
  const prompt = `Write 3 catchy, premium Instagram captions for a trip to ${destination}. 
Include relevant hashtags. Return ONLY a JSON array of 3 strings.`;

  try {
    const parsed = await fetchWithFallback(prompt, 'You are a creative travel copywriter. Return ONLY a valid JSON array of strings.');
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    return [`Exploring ${destination}! ✈️`, `Lost in ${destination}...`, `${destination} vibes.`];
  }
}

/** Stub for navbar search */
export async function smartSearch(term) {
  return [];
}
