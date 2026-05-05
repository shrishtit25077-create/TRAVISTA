import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWeather, useDestinationPhotos, useForecast } from '../../hooks/useTravista';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { ArrowRight, MapPin, Star, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix default marker icons for webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom teal dot icon
const createTealIcon = (active = false) => L.divIcon({
  className: '',
  html: `<div style="
    width: ${active ? 18 : 14}px;
    height: ${active ? 18 : 14}px;
    background: ${active ? '#0f7d5e' : '#1D9E75'};
    border: 2.5px solid white;
    border-radius: 50%;
    box-shadow: 0 0 ${active ? 10 : 6}px rgba(29,158,117,0.7);
    transition: all 0.2s;
  "></div>`,
  iconSize: [active ? 18 : 14, active ? 18 : 14],
  iconAnchor: [active ? 9 : 7, active ? 9 : 7],
  popupAnchor: [0, -10],
});

// Fly to helper
const FlyTo = ({ position }) => {
  const map = useMap();
  if (position) map.flyTo(position, 8, { duration: 1.2 });
  return null;
};

// Popup card
const PopupCard = ({ dest, onPlanTrip }) => {
  const navigate = useNavigate();
  const { photoUrl, loading: photoLoading } = useDestinationPhoto(dest.name);
  const { weather } = useWeather(dest.name);
  return (
    <div className="w-48">
      {photoLoading ? (
        <div className="w-full h-24 shimmer rounded-t-lg" />
      ) : (
        <img 
          src={photoUrl} 
          alt={dest.name} 
          className="w-full h-24 object-cover rounded-t-lg" 
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${encodeURIComponent(dest.name)}/400/300`;
          }}
        />
      )}
      <div className="p-2 space-y-1">
        <h4 className="font-bold text-slate-900 text-sm">{dest.name}, {dest.country}</h4>
        {weather && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <img src={weather.icon} alt="" className="w-4 h-4" />
            <span>{weather.temp}°C · {weather.description}</span>
          </div>
        )}
        <p className="text-xs font-bold text-emerald-600">{dest.price} / person</p>
        <button
          onClick={() => {
            if (onPlanTrip) onPlanTrip(dest);
            else navigate(`/destination/${dest.id}`, { state: dest });
          }}
          className="w-full mt-1 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1"
        >
          Plan Trip <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// Sidebar forecast strip
const ForecastStrip = ({ city }) => {
  const { forecast, loading } = useForecast(city);
  if (loading) return <div className="h-16 bg-white/10 animate-pulse rounded-lg" />;
  if (!forecast?.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {forecast.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2 shrink-0">
          <span className="text-[10px] text-white/60 font-bold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <img src={day.icon} alt="" className="w-7 h-7" />
          <span className="text-white text-xs font-bold">{day.temp}°</span>
        </div>
      ))}
    </div>
  );
};

// Sidebar list item
const SidebarItem = ({ dest, active, onClick }) => {
  const { weather } = useWeather(dest.name);
  return (
    <button
      onClick={() => onClick(dest)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
        active ? 'bg-[#1D9E75]/20 border border-[#1D9E75]/40' : 'hover:bg-white/10'
      }`}
    >
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${active ? 'bg-[#1D9E75]' : 'bg-white/30'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{dest.name} {dest.flag}</p>
        <p className="text-white/50 text-xs">{dest.country}</p>
      </div>
      {weather && (
        <span className="text-[#1D9E75] text-xs font-bold shrink-0">{weather.temp}°C</span>
      )}
    </button>
  );
};

const MapView = ({ destinations, onPlanTrip }) => {
  const [selected, setSelected] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSidebarClick = (dest) => {
    setSelected(dest);
    setFlyTo([dest.lat, dest.lon]);
  };

  return (
    <div className="flex h-full w-full relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      {/* Left sidebar */}
      <div className="w-[260px] shrink-0 bg-[#0f1629] flex flex-col h-full z-10">
        <div className="p-3 border-b border-white/10">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search destinations..."
            className="w-full bg-white/10 text-white placeholder-white/40 text-sm px-3 py-2 rounded-xl outline-none border border-white/10 focus:border-[#1D9E75]/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {filtered.map(dest => (
            <SidebarItem
              key={dest.id}
              dest={dest}
              active={selected?.id === dest.id}
              onClick={handleSidebarClick}
            />
          ))}
        </div>

        {selected && (
          <div className="p-3 border-t border-white/10 space-y-2">
            <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider">5-Day Forecast — {selected.name}</p>
            <ForecastStrip city={selected.name} />
          </div>
        )}

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
            <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Live Explorer</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {flyTo && <FlyTo position={flyTo} />}
          {filtered.map(dest => (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lon]}
              icon={createTealIcon(selected?.id === dest.id)}
              eventHandlers={{ click: () => setSelected(dest) }}
            >
              <Popup maxWidth={200} className="custom-popup">
                <PopupCard dest={dest} onPlanTrip={onPlanTrip} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
