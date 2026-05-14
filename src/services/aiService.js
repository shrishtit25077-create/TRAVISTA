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

// Realistic Pricing Engine Configuration
const destinationPricing = {
  paris: { base: 120000, hotelMultiplier: 1.8, foodMultiplier: 1.5, activityMultiplier: 1.6 },
  newyork: { base: 150000, hotelMultiplier: 2.2, foodMultiplier: 1.8, activityMultiplier: 1.7 },
  london: { base: 130000, hotelMultiplier: 2.0, foodMultiplier: 1.7, activityMultiplier: 1.6 },
  tokyo: { base: 140000, hotelMultiplier: 1.9, foodMultiplier: 1.6, activityMultiplier: 1.5 },
  switzerland: { base: 180000, hotelMultiplier: 2.5, foodMultiplier: 2.0, activityMultiplier: 1.8 },
  dubai: { base: 90000, hotelMultiplier: 1.6, foodMultiplier: 1.4, activityMultiplier: 1.5 },
  singapore: { base: 85000, hotelMultiplier: 1.5, foodMultiplier: 1.3, activityMultiplier: 1.4 },
  bali: { base: 50000, hotelMultiplier: 0.8, foodMultiplier: 0.7, activityMultiplier: 0.9 },
  thailand: { base: 45000, hotelMultiplier: 0.7, foodMultiplier: 0.6, activityMultiplier: 0.8 },
  vietnam: { base: 35000, hotelMultiplier: 0.5, foodMultiplier: 0.5, activityMultiplier: 0.6 },
  nepal: { base: 25000, hotelMultiplier: 0.4, foodMultiplier: 0.4, activityMultiplier: 0.5 },
  goa: { base: 30000, hotelMultiplier: 0.6, foodMultiplier: 0.5, activityMultiplier: 0.6 },
  manali: { base: 20000, hotelMultiplier: 0.4, foodMultiplier: 0.4, activityMultiplier: 0.5 },
  default: { base: 80000, hotelMultiplier: 1.0, foodMultiplier: 1.0, activityMultiplier: 1.0 }
};

export function calculateSmartBudget(destinations, totalDaysRaw, travelersRaw, style) {
  const travelers = Number(travelersRaw) || 1;
  const totalDays = Number(totalDaysRaw) || 3;
  const destName = ((destinations && destinations[0]) || '').toLowerCase().replace(/\s+/g, '');
  const pricing = destinationPricing[destName] || 
                 Object.keys(destinationPricing).find(k => destName.includes(k)) ? 
                 destinationPricing[Object.keys(destinationPricing).find(k => destName.includes(k))] : 
                 destinationPricing.default;

  // Base daily costs per person in INR
  const baseDailyHotel = 4000 * pricing.hotelMultiplier;
  const baseDailyFood = 2000 * pricing.foodMultiplier;
  const baseDailyActivity = 1500 * pricing.activityMultiplier;
  
  // Style multipliers
  const styleMultiplier = style === 'Luxury' ? 2.5 : style === 'Comfort' ? 1.5 : 0.8;
  
  // Travelers multiplier (slight discount per person for groups)
  const groupDiscount = Math.max(0.7, 1 - ((travelers - 1) * 0.05));
  
  // Calculate breakdown
  // Hotel is per room, assume 2 people per room
  const roomsNeeded = Math.ceil(travelers / 2);
  const stayCost = Math.round(baseDailyHotel * styleMultiplier * totalDays * roomsNeeded);
  
  const foodCost = Math.round(baseDailyFood * styleMultiplier * totalDays * travelers * groupDiscount);
  const activitiesCost = Math.round(baseDailyActivity * styleMultiplier * totalDays * travelers * groupDiscount);
  
  // Transport (Intercity + Local)
  // We assume flights are booked separately, so transport is local trains/cabs + minor intercity
  const baseLocalTransport = 1500 * pricing.hotelMultiplier * styleMultiplier * totalDays * travelers * groupDiscount;
  let intercityCost = 2000;
  if (['paris', 'newyork', 'london', 'tokyo', 'switzerland'].some(k => destName.includes(k))) intercityCost = 10000;
  else if (['dubai', 'singapore', 'bali', 'thailand', 'vietnam'].some(k => destName.includes(k))) intercityCost = 4000;
  
  intercityCost = intercityCost * travelers * (style === 'Luxury' ? 2 : style === 'Comfort' ? 1.3 : 1);
  const transportCost = Math.round(baseLocalTransport + intercityCost);
  
  const total = stayCost + foodCost + activitiesCost + transportCost;

  return { total, stay: stayCost, food: foodCost, transport: transportCost, activities: activitiesCost };
}

export async function generateItinerary(params) {
  const prompt = `From ${params.origin} to ${params.destinations.join(', ')} for ${params.travelers} people. Style: ${params.style}. Transport: ${params.modeLabel}.`;
  
  let itinerary;
  try {
    itinerary = await generateTrip(prompt);
  } catch (e) {
    const dest = params.destinations[0] || 'Unknown';
    const destLower = dest.toLowerCase();
    
    let activities = [];
    let localTips = ["Tipping is usually 10%", "Public transport is reliable", "Tap water is safe"];
    
    if (destLower.includes('goa')) {
      activities = [
        { time: "Morning", title: "Baga Beach Relaxation", desc: "Enjoy the sun and water sports at Baga Beach." },
        { time: "Afternoon", title: "Portuguese Heritage Tour", desc: "Visit the Basilica of Bom Jesus and Old Goa." },
        { time: "Evening", title: "Sunset Cruise & Tito's Lane", desc: "Experience a sunset cruise followed by nightlife at Tito's." }
      ];
      localTips = ["Rent a scooter for easy travel", "Try the Goan fish curry", "Bargain at flea markets"];
    } else if (destLower.includes('paris')) {
      activities = [
        { time: "Morning", title: "Louvre Museum", desc: "See the Mona Lisa and classical art masterpieces." },
        { time: "Afternoon", title: "Montmartre Cafes", desc: "Enjoy coffee and pastries in the artistic district." },
        { time: "Evening", title: "Seine River Cruise", desc: "See the Eiffel Tower sparkling from the water." }
      ];
      localTips = ["Learn 'Bonjour' and 'Merci'", "Beware of pickpockets near tourist sites", "Book Eiffel tower tickets months ahead"];
    } else {
      activities = [
        { time: "Morning", title: `Explore Central ${dest}`, desc: `Walk around the main squares and landmarks of ${dest}.` },
        { time: "Afternoon", title: "Local Culinary Tour", desc: "Taste the best street food and local delicacies." },
        { time: "Evening", title: "City Viewpoint", desc: "Watch the sunset from the highest point in the city." }
      ];
    }
    
    const dynamicLabels = [
      `Optimized for ${params.style.toLowerCase()}`,
      Math.random() > 0.5 ? "Best weather week" : "Low crowd timing",
      params.travelers === 1 ? "Popular among solo travelers" : `Perfect for ${params.travelers} people`
    ];

    itinerary = {
      title: `Epic Journey to ${dest}`,
      labels: dynamicLabels,
      days: Array.from({ length: params.totalDays || 3 }).map((_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} in ${dest}`,
        activities: activities
      })),
      tips: {
        packing: ["Comfortable walking shoes", "Camera and spare batteries", "Weather-appropriate clothing", "Universal power adapter"],
        local: localTips
      }
    };
  }

  // OVERRIDE BUDGET WITH SMART DESTINATION PRICING
  itinerary.budget = calculateSmartBudget(params.destinations, params.totalDays || itinerary.days?.length || 3, params.travelers, params.style);
  
  return itinerary;
}


