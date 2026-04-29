import { destinations as fallbackDestinations } from '../data/destinations';

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

function generatePrice() {
  const prices = ["₹25k", "₹80k", "₹1.2L", "₹2L", "₹45k", "₹95k", "₹1.5L"];
  return prices[Math.floor(Math.random() * prices.length)];
}

function getRandomTag() {
  const tags = ["Beach", "Mountains", "Culture", "Luxury", "Adventure", "Food", "City"];
  return tags[Math.floor(Math.random() * tags.length)];
}

export async function fetchDestinations(page = 1) {
  // Check if key is placeholder or missing
  if (!UNSPLASH_KEY || UNSPLASH_KEY.includes('YOUR_UNSPLASH_ACCESS_KEY')) {
    console.warn("Unsplash API Key missing. Falling back to local data library.");
    // Return a shuffled slice of fallback data to simulate an API response
    return [...fallbackDestinations].sort(() => 0.5 - Math.random()).slice(0, 20);
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=${page}&query=travel destinations architecture landscape&per_page=20&orientation=squarish`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error("API Limit reached or Invalid Key");

    const data = await res.json();

    return data.results.map((item) => ({
      id: item.id,
      name: item.alt_description ? item.alt_description.split(' ').slice(0, 3).join(' ') : "Beautiful Destination",
      image: item.urls.regular,
      location: item.user.location || "Global",
      rating: (4 + Math.random()).toFixed(1),
      price: generatePrice(),
      category: getRandomTag(),
      coords: [20 + Math.random() * 20, 10 + Math.random() * 20] // Mock coords for map compatibility
    }));
  } catch (err) {
    console.error("Discovery Engine Error:", err);
    // Silent fallback to keep the experience seamless
    return [...fallbackDestinations].sort(() => 0.5 - Math.random()).slice(0, 20);
  }
}
