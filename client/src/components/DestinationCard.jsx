// src/components/DestinationCard.jsx
// ─────────────────────────────────────────────
// Drop-in components using real API data
// ─────────────────────────────────────────────

import React, { useState } from "react";
import { useDestinationPhotos, useWeather, useDestinationSearch } from "../hooks/useTravista";

// ── WeatherBadge ─────────────────────────────
// Small weather chip — great for destination cards
// Usage: <WeatherBadge city="Paris" />
export function WeatherBadge({ city }) {
  const { weather, loading } = useWeather(city);

  if (loading) return <span className="weather-badge loading">—°C</span>;
  if (!weather) return null;

  return (
    <span className="weather-badge">
      <img src={weather.icon} alt={weather.condition} width={24} height={24} />
      {weather.temp}°C · {weather.description}
    </span>
  );
}

// ── WeatherCard ──────────────────────────────
// Full weather card for a destination detail page
// Usage: <WeatherCard city="Tokyo" />
export function WeatherCard({ city }) {
  const { weather, loading, error } = useWeather(city);

  if (loading) return <div className="weather-card skeleton">Loading weather…</div>;
  if (error) return <div className="weather-card error">Weather unavailable</div>;
  if (!weather) return null;

  return (
    <div className="weather-card">
      <div className="weather-card__header">
        <img src={weather.icon} alt={weather.condition} width={48} />
        <div>
          <h3>{weather.city}, {weather.country}</h3>
          <p>{weather.description}</p>
        </div>
      </div>
      <div className="weather-card__stats">
        <div><span>🌡️</span><strong>{weather.temp}°C</strong><small>Feels {weather.feelsLike}°C</small></div>
        <div><span>💧</span><strong>{weather.humidity}%</strong><small>Humidity</small></div>
        <div><span>💨</span><strong>{weather.wind} km/h</strong><small>Wind</small></div>
        <div><span>👁️</span><strong>{weather.visibility} km</strong><small>Visibility</small></div>
      </div>
    </div>
  );
}

// ── DestinationPhotoGrid ─────────────────────
// Photo grid using real Unsplash images
// Usage: <DestinationPhotoGrid destination="Bali" count={6} />
export function DestinationPhotoGrid({ destination, count = 6 }) {
  const { photos, loading, error } = useDestinationPhotos(destination, count);

  if (loading) {
    return (
      <div className="photo-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="photo-grid__item skeleton" />
        ))}
      </div>
    );
  }

  if (error) return <p>Could not load photos.</p>;

  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <div key={photo.id} className="photo-grid__item">
          <img
            src={photo.url}
            alt={photo.alt}
            loading="lazy"
          />
          <a
            href={photo.creditLink}
            target="_blank"
            rel="noopener noreferrer"
            className="photo-grid__credit"
          >
            📷 {photo.credit}
          </a>
        </div>
      ))}
    </div>
  );
}

// ── SearchBar ────────────────────────────────
// Replaces your existing hero search bar
// Fetches photos + place info + weather on search
// Usage: <SearchBar onResult={(results) => console.log(results)} />
export function SearchBar({ onResult, placeholder = "Try: Santorini..." }) {
  const [query, setQuery] = useState("");
  const { search, loading } = useDestinationSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    const results = await search(query);
    if (onResult && results) onResult(results);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="search-bar__input"
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="search-bar__btn"
      >
        {loading ? "Searching…" : "Generate Trip ✦"}
      </button>
    </div>
  );
}

// ── DestinationResultCard ────────────────────
// Shows combined result: photo + place info + weather
// Pass the `results` object from useDestinationSearch
export function DestinationResultCard({ results }) {
  if (!results) return null;

  const { destination, photos, place, weather } = results;
  const heroPhoto = photos[0];

  return (
    <div className="destination-result-card bg-white rounded-2xl shadow-xl overflow-hidden mt-8 max-w-4xl mx-auto">
      {/* Hero Photo */}
      {heroPhoto && (
        <div className="destination-result-card__hero relative h-64 sm:h-80 w-full">
          <img src={heroPhoto.url} alt={heroPhoto.alt} className="w-full h-full object-cover" />
          <div className="destination-result-card__overlay absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">{destination}</h2>
          </div>
        </div>
      )}

      <div className="destination-result-card__body p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Place Info */}
        <div className="md:col-span-2 space-y-4">
          {place && (
            <div className="place-info">
              <h3 className="text-2xl font-semibold text-gray-800">{place.name}</h3>
              <p className="text-gray-600 mt-1 flex items-start gap-2">
                 <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 {place.address}
              </p>
              {place.rating && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex items-center text-yellow-500">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </span>
                  <span className="font-semibold text-gray-700">{place.rating}</span>
                  <span className="text-gray-500 text-sm">({place.totalRatings?.toLocaleString()} reviews)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weather Detail */}
        <div className="md:col-span-1">
          {weather && (
            <div className="weather-mini bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 uppercase tracking-wider">Current Weather</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-medium text-gray-900 capitalize">{weather.description}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Humidity</span>
                    <span className="font-medium text-gray-900">{weather.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Wind</span>
                    <span className="font-medium text-gray-900">{weather.wind} km/h</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photo Grid */}
        {photos && photos.length > 1 && (
          <div className="md:col-span-3 mt-4">
             <h4 className="text-lg font-semibold text-gray-800 mb-3">More Photos</h4>
             <div className="photo-strip grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(Array.isArray(photos) ? photos : []).slice(1, 5).map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                     <img src={photo.thumb} alt={photo.alt} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     <a href={photo.creditLink} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity truncate">
                        📷 {photo.credit}
                     </a>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
