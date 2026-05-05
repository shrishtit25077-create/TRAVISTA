export async function searchLocation(query) {
  if (!query) return null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
    const data = await res.json();
    
    if (!data || data.length === 0) return null;
    
    const place = data[0];
    return {
      name: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon)
    };
  } catch (error) {
    console.error("Nominatim search error:", error);
    return null;
  }
}
