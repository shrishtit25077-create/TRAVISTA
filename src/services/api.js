// src/services/api.js
// ─────────────────────────────────────────────
// Central API service for Travista
// Handles: Unsplash, Google Places, OpenWeatherMap
// ─────────────────────────────────────────────

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export function checkApiKeys() {
  const keys = {
    OpenRouter: import.meta.env.VITE_OPENROUTER_KEY,
    Unsplash: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
    OpenWeather: import.meta.env.VITE_OPENWEATHER_API_KEY,
  };
  Object.entries(keys).forEach(([name, val]) => {
    if (!val || val.includes('your_') || val.includes('HERE')) {
      console.warn(`⚠️ ${name} API key is missing or placeholder in .env`);
    } else {
      console.log(`✅ ${name} key loaded: ${val.slice(0, 8)}...`);
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
    return data.results.map((img) => img.urls.regular);
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    // Return high-quality fallbacks if API fails
    return [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99',
    ];
  }
}

/**
 * Get a single high-quality hero photo
 * @param {string} query
 * @returns {Promise<string>} photo URL
 */
export async function getHeroPhoto(query) {
  const photos = await searchPhotos(query, 1);
  return photos[0];
}

// ─── WEATHER ─────────────────────────────────

/**
 * Get current weather for a city
 * @param {string} city
 * @returns {Promise<Object>} weather data object
 */
export async function getWeather(city) {
  if (!WEATHER_KEY || WEATHER_KEY.includes('your_')) {
    // Return mock data for development if key is missing
    return {
      temp: 24,
      condition: 'Sunny',
      icon: 'https://openweathermap.org/img/wn/01d@2x.png',
      description: 'clear sky'
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_KEY}`;

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

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
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
  const prices = [25000, 80000, 120000, 200000, 45000, 95000, 150000];
  return prices[Math.floor(Math.random() * prices.length)];
}

function getRandomTag() {
  const tags = ["Beach Escape", "Adventure", "Cultural", "Luxury", "Hidden Gem", "Mountain Retreat", "Romantic", "Food & Nightlife"];
  return tags[Math.floor(Math.random() * tags.length)];
}

export async function fetchDestinations(query = "travel") {
  // Check if key is placeholder or missing
  if (!UNSPLASH_KEY || UNSPLASH_KEY.includes('YOUR_UNSPLASH_ACCESS_KEY')) {
    console.warn("Unsplash API Key missing. Falling back to local data library.");
    return [...fallbackDestinations].sort(() => 0.5 - Math.random()).slice(0, 20);
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error("API Limit reached or Invalid Key");

    const data = await res.json();
    
    const curatedNames = [
      "Paris", "Kyoto", "Bali", "Santorini", "Dubai", "Swiss Alps", "Banff", "Amalfi Coast", 
      "Reykjavik", "Venice", "Seoul", "Tokyo", "Maldives", "Barcelona", "Prague", "Vienna",
      "Petra", "Marrakech", "Cappadocia", "Sydney", "Singapore", "Phuket", "Bora Bora", "Zermatt"
    ];

    return data.results.map((item, idx) => ({
      id: item.id,
      name: curatedNames[idx % curatedNames.length],
      image: item.urls.regular,
      location: item.user.location || "Global",
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      price: generatePrice(),
      category: getRandomTag(),
      coords: [20 + Math.random() * 20, 10 + Math.random() * 20]
    }));
  } catch (err) {
    console.error("Discovery Engine Error:", err);
    return [...fallbackDestinations].sort(() => 0.5 - Math.random()).slice(0, 20);
  }
}
