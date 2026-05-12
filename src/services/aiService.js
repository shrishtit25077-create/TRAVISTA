/**
 * AI Trip Generation Service
 */
import axios from 'axios';
import { auth } from './firebase';

export async function geocodePlace(placeName) {
  // Fallback map coordinates for demo purposes
  const mockCoords = {
    "Paris": [48.8566, 2.3522],
    "London": [51.5074, -0.1278],
    "New York": [40.7128, -74.0060],
    "Tokyo": [35.6762, 139.6503],
    "Bali": [-8.4095, 115.1889]
  };
  
  if (mockCoords[placeName]) return mockCoords[placeName];
  
  // Random coordinates for unknown places to prevent crash
  return [20 + Math.random() * 20, 70 + Math.random() * 20];
}

export async function getRoute(coords, transport) {
  // Mock route calculation
  return {
    geometry: coords,
    markers: coords.map((c, i) => ({ coords: c, name: `Stop ${i+1}` })),
    distance: "340",
    time: "4h 20m"
  };
}

export async function generateTrip(prompt) {
  try {
    const token = await auth?.currentUser?.getIdToken();
    
    // We send the 'prompt' (which is the destination input from the user) and a budget to our new backend
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/trips/generate`, {
      destination: prompt,
      budget: 'Medium (Comfortable)' // Default or pass it through from context
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.data.success) throw new Error("Backend failed to generate trip");

    return res.data.itinerary.structuredPlan;
  } catch (error) {
    console.error("Generate trip error:", error);
    throw error;
  }
}

export async function generateItinerary(params) {
  // Map the new structured UI params to the generateTrip string prompt
  const prompt = `From ${params.origin} to ${params.destinations.join(', ')} for ${params.travelers} people. Style: ${params.style}. Transport: ${params.modeLabel}.`;
  
  try {
    // Attempt the user's provided backend function first
    return await generateTrip(prompt);
  } catch (e) {
    console.warn("Backend failed, using local mock fallback.", e);
    
    // Fallback Mock data to keep the UI working
    return {
      title: `Epic Journey to ${params.destinations[0] || 'Unknown'}`,
      budget: { total: 2450, transport: 400, stay: 1200, food: 550, activities: 300 },
      days: [
        {
          day: 1,
          activities: [
            { time: "Morning", title: "Arrival & Check-in", desc: "Settle into your accommodation." },
            { time: "Afternoon", title: "City Tour", desc: "Explore the downtown area." },
            { time: "Evening", title: "Welcome Dinner", desc: "Enjoy local cuisine." }
          ]
        }
      ],
      tips: {
        packing: ["Comfortable shoes", "Camera", "Light jacket", "Universal adapter"],
        local: ["Tipping is 15-20%", "Public transport is reliable", "Tap water is safe"]
      }
    };
  }
}


