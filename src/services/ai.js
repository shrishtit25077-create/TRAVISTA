/**
 * src/services/ai.js
 * All AI calls go through the Express backend — API key never exposed to browser.
 */

const AI_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

/**
 * Generate a full AI trip plan via Gemini (proxied through backend).
 * Returns structured plan object or null on failure.
 */
export async function generateAITrip({ destination, budget, days, type }) {
  const payload = { destination, budget: Number(budget), days: Number(days), type };
  console.log('[AI] Sending trip request:', payload);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${AI_BASE}/ai/generate-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await res.json();
    console.log('[AI] Response status:', res.status, '| Success:', data.success);

    if (!res.ok || !data.success) {
      console.warn('[AI] Backend error:', data.error, data.message);
      return null;
    }

    return data.plan;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[AI] Request timed out after 30s');
    } else {
      console.error('[AI] Fetch failed:', err.message);
    }
    return null;
  }
}

/**
 * Conversational AI — proxied through backend.
 */
export async function generateTrip(prompt) {
  try {
    const res = await fetch(`${AI_BASE}/ai/generate-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: prompt, budget: 50000, days: 5, type: 'Solo' }),
    });
    if (!res.ok) throw new Error('AI service error');
    const data = await res.json();
    return data.plan?.summary || 'Here is your AI-generated itinerary.';
  } catch (err) {
    console.error('[AI] generateTrip error:', err.message);
    throw err;
  }
}

/** Smart search — handled client-side with local data */
export async function smartSearch() {
  return [];
}

/** Captions — lightweight local stub */
export async function generateCaptions(destination) {
  return [
    `Wandering through the streets of ${destination} 🌍✨`,
    `${destination} stole my heart and I'm not getting it back 💙`,
    `Lost in the beauty of ${destination} — loving every moment 🗺️`,
  ];
}
