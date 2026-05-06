import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, X, Star, Compass, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { destinations } from '../../data/destinations';

// Component to handle map zooming with flyTo
const MapController = ({ focusDest }) => {
  const map = useMap();
  useEffect(() => {
    if (focusDest) {
      map.flyTo(focusDest.coords, 10, {
        animate: true,
        duration: 2.5,
        easeLinearity: 0.25
      });
    }
  }, [focusDest, map]);
  return null;
};

const MapPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Focus from Explore Page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusId = params.get('focus');
    if (focusId && destinations.some(d => d.id === focusId)) {
      setSelectedId(focusId);
    }
  }, [location]);

  // Inject Leaflet CSS
  useEffect(() => {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container { background: transparent !important; height: 100% !important; width: 100% !important; }
      .leaflet-popup-content-wrapper { border-radius: 20px; padding: 0; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); background: rgba(255,255,255,0.9); }
      .leaflet-popup-content { margin: 0; }
      .leaflet-popup-tip-container { display: none; }
      .leaflet-bar { border: none !important; box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; border-radius: 12px !important; overflow: hidden; }
      .leaflet-bar a { background: white !important; color: #1f6f63 !important; border: 1px solid #f1f5f9 !important; }
      
      .marker-pin {
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #1f6f63;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -15px 0 0 -15px;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }
      .marker-pin::after {
        content: '';
        width: 14px;
        height: 14px;
        margin: 8px 0 0 8px;
        background: white;
        position: absolute;
        border-radius: 50%;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const filteredDestinations = useMemo(() => 
    destinations.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const activeDest = useMemo(() => 
    destinations.find(d => d.id === selectedId),
    [selectedId]
  );

  return (
    <div className="h-full w-full bg-white overflow-hidden flex flex-col relative font-sans">
      
      {/* Immersive Full Screen Map */}
      <div className="flex-1 w-full h-full relative z-0">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-50 uppercase tracking-widest">Loading World Map...</div>}>
          <MapContainer 
            center={[20, 10]} 
            zoom={3} 
            zoomControl={false} 
            className="w-full h-full"
            whenReady={() => setMapLoaded(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {mapLoaded && filteredDestinations.map((dest) => {
              const customIcon = L.divIcon({
                className: 'custom-pin',
                html: `<div class="marker-pin ${selectedId === dest.id ? 'scale-125' : ''}"></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
              });

              return (
                <Marker 
                  key={dest.id} 
                  position={dest.coords} 
                  icon={customIcon}
                  eventHandlers={{ click: () => setSelectedId(dest.id) }}
                >
                  <Popup offset={[0, -20]}>
                    <div className="w-48 overflow-hidden bg-white/90">
                      <div className="h-24 relative overflow-hidden">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/95 rounded-lg flex items-center gap-1 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-black text-slate-800">{dest.rating}</span>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <h4 className="font-bold text-slate-900 text-xs leading-tight">{dest.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-[#1f6f63] uppercase tracking-wider">{dest.category}</span>
                          <span className="text-[10px] font-bold text-slate-900">{dest.price}</span>
                        </div>
                        <button 
                          onClick={() => navigate('/ai-generator')}
                          className="w-full py-2 bg-[#1f6f63] text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Plan Journey
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            <MapController focusDest={activeDest} />
          </MapContainer>
        </Suspense>

        {/* Floating Controls Overlay */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-8 z-[1000]">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#1f6f63]/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.08)] px-6 py-4 flex items-center gap-4 transition-all">
              <Search className="w-5 h-5 text-[#1f6f63]/40" />
              <input 
                type="text" 
                placeholder="Search map destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-300 font-bold text-sm"
              />
              <div className="w-px h-6 bg-slate-100" />
              <button onClick={() => setSelectedId(null)} className="p-1 rounded-full hover:bg-slate-50 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Map UI Elements */}
        <div className="absolute right-8 bottom-8 flex flex-col gap-3 z-[1000]">
          <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-lg flex items-center justify-center text-[#1f6f63] hover:bg-slate-50 transition-all">
            <Compass className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-lg flex items-center justify-center text-slate-400 hover:text-[#1f6f63] transition-all">
            <MapIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Branding Overlay */}
        <div className="absolute left-8 bottom-8 z-[1000] pointer-events-none">
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-full px-4 py-2 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1f6f63] animate-pulse" />
            <span className="text-[10px] font-black text-[#1f6f63] uppercase tracking-[0.2em]">Live Explorer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
