const axios = require('axios');
const unsplash = require('./unsplash.provider');

class DecisionEngine {
  async generateTripPlan(inputs, preferences) {
    console.log(`Generating AI plan for ${inputs.destination} with budget: ${inputs.budget}`);
    
    // 1. Fetch real images for the destination to combine with the AI plan
    const images = await unsplash.getImages(inputs.destination, 3);

    // 2. Setup OpenRouter
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not defined in the server/.env file. Please add your key to proceed.");
    }

    // 3. Define the precise JSON Schema required by the Itinerary Model
    const responseSchema = {
      type: "object",
      properties: {
        bestOption: {
          type: "object",
          properties: {
            flights: { type: "array", items: { type: "object", properties: { carrier: { type: "string" }, price: { type: "number" }, duration: { type: "string" } } } },
            stays: { type: "array", items: { type: "object", properties: { name: { type: "string" }, price: { type: "number" }, rating: { type: "number" } } } },
            activities: { type: "array", items: { type: "object", properties: { day: { type: "number" }, name: { type: "string" }, type: { type: "string" }, description: { type: "string" }, cost: { type: "number" } } } },
            score: { type: "number" },
            totalBudget: { type: "number" }
          },
          required: ["flights", "stays", "activities", "score", "totalBudget"]
        },
        alternatives: {
          type: "array",
          items: {
            type: "object",
            properties: {
              flights: { type: "array", items: { type: "object", properties: { carrier: { type: "string" }, price: { type: "number" }, duration: { type: "string" } } } },
              stays: { type: "array", items: { type: "object", properties: { name: { type: "string" }, price: { type: "number" }, rating: { type: "number" } } } },
              activities: { type: "array", items: { type: "object", properties: { day: { type: "number" }, name: { type: "string" }, type: { type: "string" }, description: { type: "string" }, cost: { type: "number" } } } },
              score: { type: "number" },
              totalBudget: { type: "number" }
            },
            required: ["flights", "stays", "activities", "score", "totalBudget"]
          }
        }
      },
      required: ["bestOption", "alternatives"]
    };

    const prompt = `
You are an expert travel planner AI. 
The user wants to travel to: ${inputs.destination}
Their overall budget is roughly: ${inputs.budget}
Their travel style/preferences are: ${preferences ? JSON.stringify(preferences) : 'None specified'}

Generate a realistic, highly specific travel itinerary.
- **CURRENCY**: ALL prices and costs MUST be strictly in Indian Rupees (INR) to match the user's local currency. Do not use USD.
- **DURATION**: If the destination input implies a number of days (e.g. "5 days trip to Goa"), you MUST generate an itinerary spanning that many days. Assign the correct 'day' number (1, 2, 3...) to each activity. Generate at least 2-3 activities per day.
- Provide 1 'bestOption' and 2 'alternatives'.
- Flights: invent realistic carriers and prices in INR based on the budget.
- Stays: invent realistic hotel names (e.g. boutique, luxury, or hostels depending on budget), prices in INR, and ratings.
- Activities: suggest hyper-specific, real-world activities to do in ${inputs.destination} with estimated costs in INR.
- The 'totalBudget' should be the sum of flights + stays + activities.
- Keep output STRICTLY to the requested JSON schema below:
${JSON.stringify(responseSchema, null, 2)}
- You MUST return ONLY valid JSON.
    `;

    // 4. Generate JSON via OpenRouter
    let response;
    try {
      response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'google/gemini-2.5-flash', // Match previous Gemini flash model
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5001',
          'X-Title': 'TRAVISTA',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      if (error.response) {
        console.error("OpenRouter Error Data:", error.response.data);
        throw new Error(`OpenRouter API failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }

    let cleanText = response.data.choices[0].message.content;
    cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let plan;
    try {
      plan = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", cleanText);
      throw new Error("AI returned invalid JSON.");
    }

    // Defensive check
    if (!plan.bestOption) {
       console.error("Missing bestOption in plan:", plan);
       plan.bestOption = {}; // fallback
    }

    // 5. Inject the images into the bestOption so the UI can display them
    plan.bestOption.images = images;
    if (!plan.alternatives) plan.alternatives = [];

    return plan;
  }
}

module.exports = new DecisionEngine();
