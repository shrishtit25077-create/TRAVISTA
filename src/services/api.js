// src/services/api.js
// ─────────────────────────────────────────────
// Central API service for Travista
// Handles: Unsplash, Google Places, OpenWeatherMap
// ─────────────────────────────────────────────

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export function checkApiKeys() {
  const keys = {
    Gemini: import.meta.env.VITE_GEMINI_API_KEY,
    Unsplash: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
    OpenWeather: import.meta.env.VITE_OPENWEATHER_API_KEY,
  };
  Object.entries(keys).forEach(([name, val]) => {
    if (!val || val.includes('your_') || val.includes('HERE')) {
      console.warn(`⚠️ ${name} API key is missing or placeholder in .env`);
    } else {
      console.log(`✅ ${name} key loaded: ${val.slice(0,8)}...`);
    }
  });
}

// ─── UNSPLASH ────────────────────────────────

if (!UNSPLASH_KEY) {
  console.warn('⚠️ Unsplash Access Key is missing in .env');
}

/**
 * Search photos from Unsplash
 * @param {string} query - e.g. "Goa beach sunset"
 * @param {number} count - number of photos (default 6)
 * @returns {Promise<Array>} Array of photo objects
 */
export async function searchPhotos(query, count = 6) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform to cleaner format for your components
    return data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,           // Good balance of quality/size
      thumb: photo.urls.thumb,
      full: photo.urls.full,
      alt: photo.alt_description || photo.description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      credit: photo.user.name,
      creditLink: photo.user.links.html,
      downloadLocation: photo.links.download_location, // Important!
    }));

  } catch (error) {
    console.error('Unsplash search failed:', error);
    return []; // Let your component handle fallback
  }
}

/**
 * Get a single hero photo for a destination
 */
export async function getHeroPhoto(destination) {
  const photos = await searchPhotos(`${destination} travel landscape`, 1);
  return photos[0] || null;
}

// ─── GOOGLE PLACES REMOVED (Replaced by Free Alternative) ───────────────

// ─── OPENWEATHERMAP ──────────────────────────

/**
 * Get current weather for a city
 * @param {string} city  e.g. "Paris"
 * @returns {Promise<Object>} weather data
 */
export async function getWeather(query) {
  if (!WEATHER_KEY || WEATHER_KEY.includes('your_')) return null;
  let url = '';
  if (typeof query === 'string') {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${WEATHER_KEY}&units=metric`;
  } else if (query && query.lat !== undefined && query.lon !== undefined) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${WEATHER_KEY}&units=metric`;
  } else {
    throw new Error('Invalid query for getWeather');
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather error: ${res.status}`);
  const data = await res.json();

  const formatTime = (timestamp, offsetSeconds) => {
    const d = new Date((timestamp + offsetSeconds) * 1000 + new Date().getTimezoneOffset() * 60000);
    return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  };

  const localTimeStr = formatTime(Math.floor(Date.now() / 1000), data.timezone);
  const sunriseStr = formatTime(data.sys.sunrise, data.timezone);
  const sunsetStr = formatTime(data.sys.sunset, data.timezone);

  const nowUtcSeconds = Math.floor(Date.now() / 1000);
  const isDay = nowUtcSeconds >= data.sys.sunrise && nowUtcSeconds <= data.sys.sunset;

  return {
    city: data.name,
    country: data.sys.country,
    temp: Math.round(data.main.temp),           // °C
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,               // %
    description: data.weather[0].description,
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    wind: Math.round(data.wind.speed * 3.6),    // km/h
    visibility: Math.round((data.visibility || 0) / 1000), // km
    condition: data.weather[0].main,            // "Clear", "Rain", etc.
    timezone: data.timezone,
    localTime: localTimeStr,
    sunrise: sunriseStr,
    sunset: sunsetStr,
    isDay: isDay
  };
}

/**
 * Get 5-day weather forecast for a city
 * @param {string} city
 * @returns {Promise<Array>} array of daily forecasts
 */
export async function getWeatherForecast(city) {
  if (!WEATHER_KEY || WEATHER_KEY.includes('your_')) return [];
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )}&appid=${WEATHER_KEY}&units=metric&cnt=40`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast error: ${res.status}`);
  const data = await res.json();

  // Group by day and take one reading per day (midday)
  const days = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date] || item.dt_txt.includes("12:00:00")) {
      days[date] = {
        date,
        temp: Math.round(item.main.temp),
        min: Math.round(item.main.temp_min),
        max: Math.round(item.main.temp_max),
        description: item.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        condition: item.weather[0].main,
      };
    }
  });

  return Object.values(days).slice(0, 5);
}

import { destinations as fallbackDestinations } from '../data/destinations';

function generatePrice() {
  const prices = ["₹25k", "₹80k", "₹1.2L", "₹2L", "₹45k", "₹95k", "₹1.5L"];
  return prices[Math.floor(Math.random() * prices.length)];
}

function getRandomTag() {
  const tags = ["Beach", "Adventure", "Culture", "Food", "Weekend", "Hill", "Spiritual", "Budget"];
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
