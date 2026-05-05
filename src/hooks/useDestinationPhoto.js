import { useState, useEffect } from "react";
import { destinationQueries } from "../data/destinationPhotos";

const cache = {}; // in-memory cache so same destination doesn't re-fetch

export function useDestinationPhoto(destinationName) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destinationName) return;
    
    // Normalize name for cache (e.g. "Paris, France" -> "Paris")
    const cleanName = destinationName.split(',')[0].trim();
    
    if (cache[cleanName]) {
      setPhotoUrl(cache[cleanName]);
      setLoading(false);
      return;
    }

    const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    if (!key || key.includes('YOUR_') || key.includes('HERE')) {
      // Use picsum fallback — no key needed
      setPhotoUrl(`https://picsum.photos/seed/${encodeURIComponent(cleanName)}/800/600`);
      setLoading(false);
      return;
    }

    const query = destinationQueries[cleanName] || `${cleanName} travel landmark`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${key}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const photo = data.results?.[0]?.urls?.regular;
        if (photo) {
          cache[cleanName] = photo;
          setPhotoUrl(photo);
        } else {
          // fallback to picsum with a consistent seed
          setPhotoUrl(`https://picsum.photos/seed/${encodeURIComponent(cleanName)}/800/600`);
        }
      })
      .catch(() => {
        setPhotoUrl(`https://picsum.photos/seed/${encodeURIComponent(cleanName)}/800/600`);
      })
      .finally(() => setLoading(false));
  }, [destinationName]);

  return { photoUrl, loading };
}
