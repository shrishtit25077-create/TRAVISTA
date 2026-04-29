/**
 * AI Trip Generation Service
 * Interface for backend GPT integration with a robust simulation fallback
 */

const API_BASE = "http://localhost:5000/api";

export async function generateTripPlan(destination, days = 5, interests = [], budget = "mid") {
  // Try real API first
  try {
    const response = await fetch(`${API_BASE}/generate-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, days, interests, budget }),
    });

    if (response.ok) {
      const data = await response.json();
      return parseAIPlan(data.plan, destination);
    }
  } catch (err) {
    console.warn("AI Backend not reached. Switching to Discovery Engine Simulation...");
  }

  // Robust Simulation Fallback
  return simulateAIPlan(destination, days);
}

/**
 * Parses raw text from GPT into structured itinerary data
 */
function parseAIPlan(planText, destination) {
  // In a real app, you'd use structured output (JSON mode) from GPT
  // For now, we'll return a structured mock that matches the expected UI
  return simulateAIPlan(destination, 5); 
}

/**
 * High-quality simulation for immediate demo impact
 */
function simulateAIPlan(dest, days) {
  const images = {
    "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
    "Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
  };

  const coords = {
    "Bali": [[-8.829, 115.084], [-8.690, 115.156], [-8.409, 115.188]],
    "Paris": [[48.8584, 2.2945], [48.8606, 2.3376], [48.8529, 2.3501]],
    "Kyoto": [[34.9949, 135.7850], [35.0272, 135.7580], [35.0394, 135.7292]],
  };

  const baseCoords = coords[dest] || [[20, 0], [21, 1], [22, 2]];
  
  return {
    title: `Dream Escape to ${dest}`,
    image: images[dest] || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800",
    duration: `${days} Days`,
    cost: budgetLabel(dest),
    days: Array.from({ length: days }).map((_, i) => ({
      day: i + 1,
      title: getDayTitle(i),
      act: getDayActivity(dest, i),
      coords: baseCoords[i % baseCoords.length]
    }))
  };
}

function budgetLabel(dest) {
  const labels = ["₹80k", "₹1.5L", "₹2.2L", "₹45k"];
  return labels[Math.floor(Math.random() * labels.length)];
}

function getDayTitle(i) {
  const titles = ["Arrival & Immersion", "Heritage Exploration", "Nature's Embrace", "Local Life & Flavors", "Final Serenity"];
  return titles[i] || "Continued Adventure";
}

function getDayActivity(dest, i) {
  const activities = [
    `Arrive in ${dest} and check into your boutique stay. Enjoy a sunset walk.`,
    `Visit the most iconic temple and learn about local traditions.`,
    `Explore hidden waterfalls and a lush forest trek.`,
    `Join a local cooking class followed by a vibrant street food tour.`,
    `Early morning yoga and relaxation before your departure.`
  ];
  return activities[i] || "Explore more hidden gems around the city.";
}

/**
 * Generates a structured, detailed itinerary for the Planning Studio
 */
export async function generateDetailedItinerary({ destination, days = 3, budget, interests, travelers }) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1500));

  // In a real app, this would be a fetch to your Node/GPT backend
  // For the demo, we generate high-quality structured data with geographic context
  const baseCoords = {
    lat: 20 + Math.random() * 5,
    lng: 70 + Math.random() * 5
  };

  return Array.from({ length: days }).map((_, i) => ({
    day: i + 1,
    title: getDayTitle(i),
    activities: [
      { 
        time: "Morning", 
        title: `Heritage Walk in ${destination}`, 
        description: "Explore the historic center and visit the local market.",
        lat: baseCoords.lat + (Math.random() * 0.05),
        lng: baseCoords.lng + (Math.random() * 0.05)
      },
      { 
        time: "Afternoon", 
        title: `${interests[0] || 'Culture'} Experience`, 
        description: `A curated session focused on ${interests[0] || 'the local vibe'}.`,
        lat: baseCoords.lat + (Math.random() * 0.05),
        lng: baseCoords.lng + (Math.random() * 0.05)
      },
      { 
        time: "Evening", 
        title: "Gourmet Dinner", 
        description: "Enjoy a hand-picked culinary experience at a top-rated local spot.",
        lat: baseCoords.lat + (Math.random() * 0.05),
        lng: baseCoords.lng + (Math.random() * 0.05)
      }
    ]
  }));
}


