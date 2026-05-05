// src/services/plannerService.js

import { calculateRealisticTripCost } from './pricingEngine';

function safeParseJSON(text) {
  try {
    const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found');
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    console.error('JSON parse failed:', err, 'Text was:', text);
    throw err;
  }
}

export async function generateTripPlan({ destination, budget, duration, travellerType, preferences = "" }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is missing");

  // Calculate realistic costs using the pricing engine
  const pricing = calculateRealisticTripCost({
    destinations: destination,
    totalDays: duration,
    travelers: travellerType === 'Solo' ? 1 : travellerType === 'Couple' ? 2 : travellerType === 'Family' ? 4 : 4,
    userBudget: budget
  });

  const prompt = `You are a professional budget travel expert. 
Design a complete ${duration}-day trip to ${destination} for ${travellerType}.
Preferences: ${preferences || "Balanced"}

Budget Tier: ${pricing.tier}
User's Stated Total Budget: ₹${budget}
Calculated Realistic Minimum Budget: ₹${pricing.minFeasibleBudget}

IMPORTANT RULES:
- If the user's budget is lower than the realistic minimum, plan a "Shoestring/Survival" trip, emphasizing hostels, street food, and free walking tours.
- If the budget is sufficient, distribute it according to the ${pricing.tier} lifestyle.
- Return ONLY valid JSON, no markdown, no backticks.
- Max ${Math.min(duration, 7)} days in the array.

JSON structure exactly as follows:
{
  "tier": "${pricing.tier}",
  "tierEmoji": "🎒",
  "summary": "2-sentence overview",
  "warning": ${pricing.warnings ? `"${pricing.warnings}"` : "null"},
  "totalCostBreakdown": {
    "transport": ${pricing.breakdown.transport}, 
    "accommodation": ${pricing.breakdown.accommodation}, 
    "food": ${pricing.breakdown.food}, 
    "activities": ${pricing.breakdown.activities}, 
    "misc": ${pricing.breakdown.misc}
  },
  "accommodation": {"type": "string", "name": "string", "pricePerNight": number, "area": "string"},
  "transport": {"toDestination": "string", "localTransport": "string"},
  "foodPlan": {"style": "string", "avgMealCost": number, "mustTry": ["string"]},
  "days": [{"day": number, "title": "string", "morning": {"activity": "string", "cost": number, "tip": "string"}, "afternoon": {"activity": "string", "cost": number, "tip": "string"}, "evening": {"activity": "string", "cost": number, "tip": "string"}, "dayTotal": number}],
  "budgetTips": ["string", "string", "string"],
  "freeTips": ["string", "string"],
  "bookingLinks": {"flights": "string", "hotels": "string"}
}`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5 },
    }),
  });

  if (response.status === 429) {
    throw new Error('quota');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Invalid API response structure');

  const parsedPlan = safeParseJSON(text);
  
  // Enforce pricing engine breakdown if AI gets creative
  if (!parsedPlan.totalCostBreakdown || Object.keys(parsedPlan.totalCostBreakdown).length === 0) {
      parsedPlan.totalCostBreakdown = pricing.breakdown;
  }
  
  return parsedPlan;
}

/**
 * Generates a multi-city trip plan using Gemini
 */
export async function generateMultiCityPlan({ cities, totalBudget, totalDays, travelers, startCity, preferences }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is missing");

  // Calculate realistic costs using the pricing engine
  const pricing = calculateRealisticTripCost({
    destinations: cities,
    totalDays,
    travelers,
    userBudget: totalBudget
  });

  const prompt = `You are a professional travel routing expert.
Design a connected multi-city trip across: ${cities.join(', ')}.
Total Duration: ${totalDays} days.
Travelers: ${travelers}
Budget Tier: ${pricing.tier} (User Budget: ₹${totalBudget})

Start City: ${startCity || cities[0]}
Preferences: ${preferences || 'Balanced mix of culture, food, and relaxation'}

IMPORTANT RULES:
- Optimize the route to minimize backtracking.
- Suggest realistic travel legs between cities (e.g., flight, fast train, bus).
- Allocate days intelligently (e.g., more days in major cities, fewer in small ones).
- Return ONLY valid JSON, no markdown, no backticks.

JSON structure exactly as follows:
{
  "tier": "${pricing.tier}",
  "route": ["City A", "City B", "City C"],
  "summary": "2-sentence overview of this multi-city journey",
  "warning": ${pricing.warnings ? `"${pricing.warnings}"` : "null"},
  "totalCostBreakdown": {
    "transport": ${pricing.breakdown.transport}, 
    "accommodation": ${pricing.breakdown.accommodation}, 
    "food": ${pricing.breakdown.food}, 
    "activities": ${pricing.breakdown.activities}, 
    "misc": ${pricing.breakdown.misc}
  },
  "legs": [
    {
      "from": "City A",
      "to": "City B",
      "mode": "Flight | Train | Bus",
      "duration": "2 hours",
      "estimatedCost": number
    }
  ],
  "cityPlans": [
    {
      "city": "City A",
      "daysAllocated": number,
      "accommodation": {"type": "string", "area": "string", "pricePerNight": number},
      "highlights": ["string", "string"],
      "foodStyle": "string"
    }
  ],
  "budgetTips": ["string", "string"]
}`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5 },
    }),
  });

  if (response.status === 429) {
    throw new Error('quota');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Invalid API response structure');

  const parsedPlan = safeParseJSON(text);
  
  if (!parsedPlan.totalCostBreakdown) {
      parsedPlan.totalCostBreakdown = pricing.breakdown;
  }

  return parsedPlan;
}
