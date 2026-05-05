// src/services/hotelService.js

/**
 * Service to fetch hotels from RapidAPI (Booking.com or similar)
 * Falls back to an intelligent mock if the API key is missing or fails.
 */

const RAPID_API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export async function fetchHotels(destination, perNightBudget) {
  // If no API key is provided, use the robust simulation
  if (!RAPID_API_KEY) {
    console.warn("No RapidAPI key found. Using simulated real hotel data.");
    return simulateHotels(destination, perNightBudget);
  }

  try {
    // 1. Fetch Location ID (Mocked for safety if you want to implement real, use standard Booking API)
    // const locationId = await fetchLocationId(destination);
    
    // 2. Fetch Hotels
    // const response = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/search?dest_id=${locationId}...`, {
    //   headers: {
    //     'x-rapidapi-key': RAPID_API_KEY,
    //     'x-rapidapi-host': 'booking-com.p.rapidapi.com'
    //   }
    // });
    
    // For now, even with key, we fallback to simulate to avoid breaking the UI without a specific endpoint
    return simulateHotels(destination, perNightBudget);

  } catch (err) {
    console.error("Hotel API error:", err);
    return simulateHotels(destination, perNightBudget);
  }
}

function simulateHotels(destination, budget) {
  // Delay to simulate network request
  return new Promise(resolve => {
    setTimeout(() => {
      // Generate some realistic looking hotels
      const hotelNames = [
        `The ${destination} Grand`,
        `${destination} Boutique Suites`,
        `Oasis Resort ${destination}`,
        `Central Plaza Hotel`,
        `The View ${destination}`,
        `Eco Lodge ${destination}`,
        `Riverside Inn`,
        `Premium Suites ${destination}`
      ];

      const images = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1542314831-c6a4d1409b57?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1551882547-ff40c0d1398c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&q=80&w=800"
      ];

      // Base price variation around the budget
      let basePrice = budget * 0.8; 
      
      const hotels = hotelNames.map((name, index) => {
        // Vary price from 0.7x to 1.3x of budget
        const priceMultiplier = 0.7 + (Math.random() * 0.6);
        const price = Math.round(basePrice * priceMultiplier);
        
        return {
          id: `hotel_${index}`,
          name,
          price,
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
          reviews: Math.floor(100 + Math.random() * 900),
          image: images[index % images.length],
          amenities: ["Free WiFi", "Pool", "Breakfast Included"].slice(0, Math.floor(1 + Math.random() * 3))
        };
      });

      // Filter to only hotels within user's per-day budget
      let filtered = hotels.filter(h => h.price <= budget);
      
      // If budget is extremely low and we filtered everything out, just return the cheapest ones
      if (filtered.length === 0) {
        filtered = hotels.sort((a, b) => a.price - b.price).slice(0, 3);
      }

      // Sort by rating and return top 6
      resolve(filtered.sort((a, b) => b.rating - a.rating).slice(0, 6));
    }, 1200);
  });
}
