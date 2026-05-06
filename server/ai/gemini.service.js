/**
 * server/ai/gemini.service.js
 * Gemini 1.5 Flash trip generation — backend only, key never exposed to client
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildTripPrompt({ destination, budget, days, type }) {
  return `You are Travista's expert AI travel concierge. Generate a rich, realistic travel itinerary.

Trip Details:
- Destination: ${destination}
- Total Budget: ₹${budget} INR
- Duration: ${days} days
- Traveller Type: ${type}

Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "summary": "2-sentence trip overview",
  "tier": "Budget | Standard | Premium | Luxury",
  "tags": ["Food", "Culture", "Adventure"],
  "bestSeason": "Month range",
  "crowdLevel": "Low | Moderate | High",
  "safetyScore": "High | Moderate | Low",
  "accommodation": {
    "type": "Hotel type name",
    "costPerNight": 2500
  },
  "transport": {
    "mode": "Primary transport mode",
    "note": "Brief transport tip"
  },
  "food": {
    "style": "Dining style",
    "avgMeal": 300
  },
  "totalBreakdown": {
    "stay": 12500,
    "food": 8000,
    "transport": 6000,
    "activities": 5000
  },
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "cost": 3000
    }
  ]
}

Make it realistic for ${destination} with accurate local costs in INR. Generate exactly ${days} day objects.`;
}

function safeParseJSON(text) {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Find first { and last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');

  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generateTripWithGemini(params) {
  const { destination, budget, days, type } = params;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured on server');
  }

  console.log('[Gemini] Request:', { destination, budget, days, type });

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const prompt = buildTripPrompt({ destination, budget, days, type });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  console.log('[Gemini] Raw response length:', text.length);

  const plan = safeParseJSON(text);
  console.log('[Gemini] Parsed plan keys:', Object.keys(plan));

  // Validate critical fields
  if (!Array.isArray(plan.days) || plan.days.length === 0) {
    throw new Error('Gemini returned plan without days array');
  }

  return plan;
}

module.exports = { generateTripWithGemini };
