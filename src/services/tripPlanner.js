// src/services/tripPlanner.js
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

/**
 * Generates a complete trip plan using AI (Gemini or OpenRouter based on keys).
 * Incorporates real pricing data and intelligent budget constraints.
 */
export async function generateTripPlan({ destination, totalBudget, days, travelers, tripType, preferences = "" }) {
  // Use Gemini strictly
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!geminiKey) {
    throw new Error("No Gemini API key found.");
  }

  // 1. Calculate realistic costs using the intelligent pricing engine
  const pricing = calculateRealisticTripCost({
    destinations: destination,
    totalDays: days,
    travelers: travelers || (tripType === 'solo' ? 1 : tripType === 'couple' ? 2 : 4),
    userBudget: totalBudget
  });

  // 2. Build the prompt with strict constraints
  const prompt = `You are an elite travel planner. Design a complete ${days}-day trip to ${destination} for a ${tripType} group (${travelers} travelers).
Preferences: ${preferences || "Balanced mix of culture and relaxation"}

BUDGET CONSTRAINTS:
- User's Stated Total Budget: ₹${totalBudget}
- Calculated Minimum Realistic Budget: ₹${pricing.minFeasibleBudget}
- Allowed Tier: ${pricing.tier}

CRITICAL RULES:
- If the User's Stated Budget is lower than the Minimum Realistic Budget, you MUST plan the absolute cheapest possible survival/shoestring trip (hostels, street food, public transit).
- Include an honest warning if the budget is dangerously low.
- Distribute the daily costs to match the exact tier lifestyle.
- Return ONLY valid JSON, no markdown blocks.

JSON structure:
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
  "budgetTips": ["string", "string"],
  "freeTips": ["string", "string"]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5 },
    }),
  });

  if (response.status === 429) throw new Error('quota');
  if (!response.ok) throw new Error(`API Error: ${response.status}`);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Invalid API response structure');

  const parsedPlan = safeParseJSON(text);
  
  // Ensure the breakdown accurately reflects the pricing engine calculations
  if (!parsedPlan.totalCostBreakdown || Object.keys(parsedPlan.totalCostBreakdown).length === 0) {
      parsedPlan.totalCostBreakdown = pricing.breakdown;
  }
  
  return parsedPlan;
}
