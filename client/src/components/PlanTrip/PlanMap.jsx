import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const SetMapBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, points]);
  return null;
};

const PlanMap = ({ itinerary }) => {
  const points = useMemo(() => {
    return itinerary.flatMap(day => 
      day.activities.map(a => [a.lat, a.lng])
    ).filter(p => p[0] && p[1]);
  }, [itinerary]);

  if (points.length === 0) return null;

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative z-0 border border-slate-100 shadow-inner">
      <MapContainer 
        center={points[0]} 
        zoom={13} 
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {itinerary.map((day) => (
          day.activities.map((act, i) => (
            <Marker 
              key={`${day.day}-${i}`} 
              position={[act.lat, act.lng]} 
              icon={DefaultIcon}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <p className="text-[10px] font-black uppercase text-[#1f6f63] tracking-widest">Day {day.day} • {act.time}</p>
                  <p className="text-sm font-bold text-slate-800">{act.title}</p>
                </div>
              </Popup>
            </Marker>
          ))
        ))}

        <Polyline 
          positions={points} 
          color="#1f6f63" 
          weight={4} 
          opacity={0.6} 
          dashArray="10, 10"
        />
        
        <SetMapBounds points={points} />
      </MapContainer>
    </div>
  );
};

export default PlanMap;
