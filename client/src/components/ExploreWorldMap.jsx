import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Lazy-load Leaflet components to avoid blocking initial render
const MapContainer  = lazy(() => import('react-leaflet').then(m => ({ default: m.MapContainer })));
const TileLayer     = lazy(() => import('react-leaflet').then(m => ({ default: m.TileLayer })));
const Marker        = lazy(() => import('react-leaflet').then(m => ({ default: m.Marker })));
const Popup         = lazy(() => import('react-leaflet').then(m => ({ default: m.Popup })));

// Destinations data
const destinations = [
  {
    id: 'goa',
    name: 'Goa, India',
    tag: 'Beach & Nightlife',
    tagColor: '#4F7C6A',
    coords: [15.2993, 74.1240],
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=400',
    description: 'Sun-kissed beaches, vibrant shacks, and a blend of Indian and Portuguese culture.',
    budget: '₹15,000 – ₹40,000',
    bestTime: 'Nov – Feb',
  },
  {
    id: 'manali',
    name: 'Manali, India',
    tag: 'Mountains & Snow',
    tagColor: '#4F7C6A',
    coords: [32.2432, 77.1892],
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=400',
    description: 'Snow-capped peaks, pine forests, and adventure sports in the Himalayas.',
    budget: '₹12,000 – ₹35,000',
    bestTime: 'Dec – Feb & Jun – Sep',
  },
  {
    id: 'jaipur',
    name: 'Jaipur, India',
    tag: 'Heritage & Culture',
    tagColor: '#C47A3A',
    coords: [26.9124, 75.7873],
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=400',
    description: 'The Pink City — royal palaces, bustling bazaars, and Rajputana grandeur.',
    budget: '₹10,000 – ₹30,000',
    bestTime: 'Oct – Mar',
  },
  {
    id: 'bali',
    name: 'Bali, Indonesia',
    tag: 'Island Paradise',
    tagColor: '#4F7C6A',
    coords: [-8.3405, 115.0920],
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=400',
    description: 'Terraced rice fields, ancient temples, and pristine beaches in paradise.',
    budget: '₹40,000 – ₹80,000',
    bestTime: 'Apr – Oct',
  },
  {
    id: 'paris',
    name: 'Paris, France',
    tag: 'Art & Romance',
    tagColor: '#7C5C8A',
    coords: [48.8566, 2.3522],
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=400',
    description: 'The City of Light — Eiffel Tower, world-class cuisine, and timeless art.',
    budget: '₹1,20,000 – ₹2,50,000',
    bestTime: 'Apr – Jun',
  },
  {
    id: 'swiss',
    name: 'Switzerland',
    tag: 'Alpine Beauty',
    tagColor: '#4F7C6A',
    coords: [46.8182, 8.2275],
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=400',
    description: 'Pristine alpine lakes, chocolate-box villages, and world-class skiing.',
    budget: '₹2,00,000 – ₹4,00,000',
    bestTime: 'Jun – Sep',
  },
];

// Custom marker using DivIcon — no default Leaflet pin
function createCustomIcon(color = '#4F7C6A', isActive = false) {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${isActive ? 44 : 36}px;
        height:${isActive ? 44 : 36}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 16px rgba(0,0,0,0.25);
        transition:all 0.2s ease;
      ">
        <div style="
          width:10px;height:10px;
          background:white;border-radius:50%;
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
        "></div>
      </div>`,
    iconSize:   [isActive ? 44 : 36, isActive ? 44 : 36],
    iconAnchor: [isActive ? 22 : 18, isActive ? 44 : 36],
    popupAnchor:[0, -40],
  });
}

// Inner map component (only rendered after Leaflet is loaded)
function MapContent({ onSelect, selectedId }) {
  const [L, setL] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    import('leaflet').then(leaflet => {
      // Fix default icon paths for Vite
      delete leaflet.Icon.Default.prototype._getIconUrl;
      setL(leaflet);
    });
  }, []);

  if (!L) return null;

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {destinations.map(dest => (
        <Marker
          key={dest.id}
          position={dest.coords}
          icon={createCustomIcon(dest.tagColor, selectedId === dest.id)}
          eventHandlers={{
            click: () => onSelect(dest.id === selectedId ? null : dest.id),
            mouseover: () => setHoveredId(dest.id),
            mouseout: () => setHoveredId(null),
          }}
        >
          <Popup className="custom-popup">
            <div className="w-52 font-sans">
              <img src={dest.image} alt={dest.name} className="w-full h-28 object-cover rounded-lg mb-2" />
              <p className="font-bold text-[#111827] text-sm">{dest.name}</p>
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mt-1"
                style={{ background: dest.tagColor }}
              >{dest.tag}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Side panel for selected destination
function DestPanel({ dest, onClose }) {
  const navigate = useNavigate();
  if (!dest) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={dest.id}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-4 right-4 bottom-4 w-72 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] z-[1000] flex flex-col overflow-hidden border border-[#E5E7EB]"
      >
        {/* Image */}
        <div className="relative h-44 shrink-0">
          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#111827] hover:bg-white transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4">
            <p className="text-white font-bold text-base leading-tight">{dest.name}</p>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mt-1"
              style={{ background: dest.tagColor }}
            >{dest.tag}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-[#4B5563] text-sm leading-relaxed mb-4">{dest.description}</p>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF] font-medium">Est. Budget</span>
              <span className="font-semibold text-[#111827]">{dest.budget}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF] font-medium">Best Time</span>
              <span className="font-semibold text-[#111827]">{dest.bestTime}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/ai-generator')}
            className="w-full py-3 bg-[#3F6F5A] text-white rounded-xl font-bold text-sm shadow-[0_4px_16px_rgba(63,111,90,0.30)] flex items-center justify-center gap-2 hover:bg-[#355e4c] transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Plan This Trip
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ExploreWorldMap() {
  const [selectedId, setSelectedId]   = useState(null);
  const [mapLoaded, setMapLoaded]     = useState(false);
  const [mapStyle, setMapStyle]       = useState('light'); // 'light' | 'satellite'
  const sectionRef = useRef(null);
  const isInView   = useInView(sectionRef, { once: true, margin: '-100px' });

  const selectedDest = destinations.find(d => d.id === selectedId) ?? null;

  // Inject Leaflet CSS once
  useEffect(() => {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id   = 'leaflet-css';
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Custom popup style
    const style = document.createElement('style');
    style.textContent = `.leaflet-popup-content-wrapper{border-radius:12px;padding:0;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.14);border:1px solid #E5E7EB}.leaflet-popup-content{margin:0}.leaflet-popup-tip-container{display:none}`;
    document.head.appendChild(style);
  }, []);

  const tileUrls = {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 md:px-12 mt-16 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-accent-sage font-semibold tracking-[0.18em] uppercase text-xs mb-3 block"
          >
            Interactive Explorer
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.22, duration: 0.6 }}
            className="text-3xl font-bold text-[#111827] tracking-tight"
          >
            Explore the world visually
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[#6B7280] mt-2 font-light"
          >
            Discover destinations through an interactive map — click a pin to explore.
          </motion.p>
        </div>

        {/* Map style toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-full border border-[#E5E7EB] self-start md:self-auto"
        >
          {(['light', 'satellite']).map(style => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 capitalize ${
                mapStyle === style
                  ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]'
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              {style === 'light' ? '☀️ Light' : '🛰️ Satellite'}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Map Container */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-[480px] md:h-[560px] rounded-3xl overflow-hidden border border-[#E5E7EB] shadow-[0_8px_40px_rgba(0,0,0,0.10)]"
      >
        <Suspense
          fallback={
            <div className="w-full h-full bg-[#F9FAFB] flex items-center justify-center gap-3">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-accent-sage"
              />
              <span className="text-[#6B7280] text-sm font-medium">Loading map…</span>
            </div>
          }
        >
          <MapContainer
            center={[20, 20]}
            zoom={2}
            minZoom={2}
            maxZoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            whenReady={() => setMapLoaded(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={tileUrls[mapStyle]}
            />
            {destinations.map(dest => {
              let L;
              try { L = require('leaflet'); } catch { return null; }
              const icon = L.divIcon({
                className: '',
                html: `<div style="position:relative;width:${selectedId === dest.id ? 44 : 36}px;height:${selectedId === dest.id ? 44 : 36}px">
                  <div style="width:100%;height:100%;background:${dest.tagColor};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.25);transition:all 0.2s ease;"></div>
                  <div style="width:10px;height:10px;background:white;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-54%);"></div>
                </div>`,
                iconSize:   [selectedId === dest.id ? 44 : 36, selectedId === dest.id ? 44 : 36],
                iconAnchor: [selectedId === dest.id ? 22 : 18, selectedId === dest.id ? 44 : 36],
                popupAnchor: [0, -42],
              });

              return (
                <Marker
                  key={dest.id}
                  position={dest.coords}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedId(prev => prev === dest.id ? null : dest.id),
                  }}
                >
                  <Popup>
                    <div className="w-48 font-sans p-1">
                      <img src={dest.image} alt={dest.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                      <p className="font-bold text-[#111827] text-sm">{dest.name}</p>
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mt-1"
                        style={{ background: dest.tagColor }}
                      >{dest.tag}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </Suspense>

        {/* Destination count badge */}
        <div className="absolute top-4 left-4 z-[999] bg-white rounded-full px-3 py-1.5 shadow-md border border-[#E5E7EB] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-accent-sage" />
          <span className="text-xs font-semibold text-[#374151]">{destinations.length} destinations</span>
        </div>

        {/* Side Panel */}
        <DestPanel dest={selectedDest} onClose={() => setSelectedId(null)} />

        {/* Instruction hint */}
        <AnimatePresence>
          {mapLoaded && !selectedId && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] bg-white/95 rounded-full px-4 py-2 shadow-md border border-[#E5E7EB] text-xs text-[#6B7280] font-medium pointer-events-none"
            >
              📍 Click a pin to explore the destination
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick-pick destination pills below map */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="flex flex-wrap gap-2 mt-5"
      >
        {destinations.map(dest => (
          <button
            key={dest.id}
            onClick={() => setSelectedId(prev => prev === dest.id ? null : dest.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
              selectedId === dest.id
                ? 'bg-[#3F6F5A] text-white border-[#3F6F5A] shadow-md'
                : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-accent-sage/50 hover:text-accent-sage'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: selectedId === dest.id ? 'white' : dest.tagColor }}
            />
            {dest.name}
          </button>
        ))}
      </motion.div>
    </motion.section>
  );
}
