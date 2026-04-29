const API_KEY = import.meta.env.VITE_AMADEUS_KEY;
const API_SECRET = import.meta.env.VITE_AMADEUS_SECRET;

let cachedToken = null;
let tokenExpiry = null;

/**
 * Fetches or returns a cached Amadeus OAuth2 Access Token
 */
export async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!API_KEY || !API_SECRET || API_KEY.includes('YOUR_')) {
    console.warn("Amadeus API Keys missing. Travel data (flights/hotels) will be simulated.");
    return null;
  }

  try {
    const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}`,
    });

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    return cachedToken;
  } catch (err) {
    console.error("Amadeus Auth Error:", err);
    return null;
  }
}

/**
 * Fetches real flight offers between origin and destination
 */
export async function fetchFlights(origin = "DEL", destinationCode = "PAR", date = "2026-05-10") {
  const token = await getAccessToken();
  if (!token) return generateMockFlights(destinationCode);

  try {
    const res = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destinationCode}&departureDate=${date}&adults=1&max=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("Flight Fetch Error:", err);
    return generateMockFlights(destinationCode);
  }
}

/**
 * Fetches hotel recommendations for a specific city
 */
export async function fetchHotels(cityCode = "PAR") {
  const token = await getAccessToken();
  if (!token) return generateMockHotels(cityCode);

  try {
    const res = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("Hotel Fetch Error:", err);
    return generateMockHotels(cityCode);
  }
}

// --- Simulation Utilities (Fallback) ---

function generateMockFlights(dest) {
  return [
    { id: 1, airline: "Indigo", price: "₹45,000", duration: "8h 30m", type: "Direct" },
    { id: 2, airline: "Air India", price: "₹52,000", duration: "11h 15m", type: "1 Stop" }
  ];
}

function generateMockHotels(city) {
  return [
    { id: 1, name: "Grand Hyatt " + city, rating: "4.5", price: "₹12,000/night" },
    { id: 2, name: "Marriott Discovery", rating: "4.8", price: "₹18,000/night" }
  ];
}
