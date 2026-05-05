// src/hooks/useTravista.js
// ─────────────────────────────────────────────
// Custom React hooks wrapping all three APIs
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  searchPhotos,
  getHeroPhoto,
  getWeather,
  getWeatherForecast,
} from "../services/api";

// ─── PHOTOS ──────────────────────────────────

/**
 * Fetch photos for a destination
 * Usage: const { photos, loading, error } = useDestinationPhotos("Bali")
 */
export function useDestinationPhotos(destination, count = 6) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!destination) return;
    setLoading(true);
    setError(null);

    searchPhotos(destination, count)
      .then(setPhotos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [destination, count]);

  return { photos, loading, error };
}

/**
 * Fetch a single hero photo for a destination
 * Usage: const { photo, loading } = useHeroPhoto("Santorini")
 */
export function useHeroPhoto(destination) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!destination) return;
    setLoading(true);
    setError(null);

    getHeroPhoto(destination)
      .then(setPhoto)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [destination]);

  return { photo, loading, error };
}

import { searchLocation } from '../services/freeLocation';

// ─── WEATHER ─────────────────────────────────

/**
 * Get current weather for a city
 * Usage: const { weather, loading } = useWeather("Tokyo")
 */
export function useWeather(city) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setError(null);

    getWeather(city)
      .then(setWeather)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [city]);

  return { weather, loading, error };
}

/**
 * Get 5-day forecast for a city
 * Usage: const { forecast, loading } = useForecast("London")
 */
export function useForecast(city) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setError(null);

    getWeatherForecast(city)
      .then(setForecast)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [city]);

  return { forecast, loading, error };
}

// ─── SEARCH (combined) ────────────────────────

/**
 * Combined search hook — fetches photos + location + weather in parallel
 * Perfect for your "Generate Trip" button or search bar
 *
 * Usage:
 *   const { results, loading, search } = useDestinationSearch()
 *   search("Santorini")  // triggers all three APIs at once
 */
export function useDestinationSearch() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (destination) => {
    if (!destination) return;
    setLoading(true);
    setError(null);

    try {
      const [photos, location, weather] = await Promise.allSettled([
        searchPhotos(destination, 6),
        searchLocation(destination),
        getWeather(destination),
      ]);

      const searchResults = {
        destination,
        photos: photos.status === "fulfilled" ? photos.value : [],
        location: location.status === "fulfilled" ? location.value : null,
        weather: weather.status === "fulfilled" ? weather.value : null,
      };

      setResults(searchResults);
      return searchResults;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
