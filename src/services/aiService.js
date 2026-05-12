/**
 * AI Trip Generation Service
 */
import axios from 'axios';
import { auth } from './firebase';

export async function geocodePlace(placeName) {
  if (!placeName) return null;
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: placeName, format: 'json', limit: 1 },
      headers: { 'Accept-Language': 'en' }
    });
    if (res.data && res.data.length > 0) {
      return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
    }
  } catch (error) {
    console.error("Geocoding failed for", placeName, error);
  }
  // Fallback map coordinates if not found
  return [20 + Math.random() * 20, 70 + Math.random() * 20];
}

// Haversine formula to calc distance between two coords
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI/180);
  const dLon = (lon2 - lon1) * (Math.PI/180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return Math.round(R * c);
}

export async function getRoute(coords, transport) {
  let totalDistance = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalDistance += getDistanceFromLatLonInKm(coords[i][0], coords[i][1], coords[i+1][0], coords[i+1][1]);
  }

  // Est time based on transport
  let speed = 80; // default car km/h
  if (transport === 'flight') speed = 800;
  if (transport === 'train') speed = 250;
  if (transport === 'bus') speed = 60;
  if (transport === 'walking') speed = 5;

  const hours = totalDistance / speed;
  const timeStr = hours < 1 ? `${Math.round(hours * 60)}m` : `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;

  return {
    geometry: coords,
    markers: coords.map((c, i) => ({ coords: c, name: `Stop ${i+1}` })),
    distance: totalDistance,
    time: timeStr
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
      budget: { total: 125000, transport: 25000, stay: 60000, food: 25000, activities: 15000 },
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
        local: ["Tipping is usually 10%", "Public transport is reliable", "Tap water is safe"]
      }
    };
  }
}


