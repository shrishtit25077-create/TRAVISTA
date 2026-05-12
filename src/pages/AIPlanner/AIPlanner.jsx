import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Download, Save, Map as MapIcon, Calendar, DollarSign, Lightbulb, Navigation, Users, Activity, Loader2, Plane, Train, Car, Bus, Ship, Footprints, MapPin, Bed, Utensils, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import L from 'leaflet';
import { useLocation } from 'react-router-dom';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Reusable Components ──────────────────────────────────────────────────────

const MapBoundsFitter = ({ geometry }) => {
  const map = useMap();
  useEffect(() => {
    if (geometry && geometry.length > 0) {
      const bounds = L.latLngBounds(geometry);
      // Ensure padding helps the markers stay visible
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8, animate: true, duration: 1.5 });
    }
  }, [geometry, map]);
  return null;
};

// Generates a curved path using a simple quadratic bezier approximation
const getCurvedPath = (start, end) => {
  const latlngs = [];
  const offsetX = (end[1] - start[1]) * 0.2;
  const offsetY = (end[0] - start[0]) * 0.2;
  const midPoint = [
    (start[0] + end[0]) / 2 - offsetY, // Create curve
    (start[1] + end[1]) / 2 + offsetX
  ];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const lat = (1-t)*(1-t)*start[0] + 2*(1-t)*t*midPoint[0] + t*t*end[0];
    const lng = (1-t)*(1-t)*start[1] + 2*(1-t)*t*midPoint[1] + t*t*end[1];
    latlngs.push([lat, lng]);
  }
  return latlngs;
};

const DestinationAutocomplete = ({ value, onChange, placeholder, label }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: query, format: 'json', limit: 5, featuretype: 'city' }
      });
      setSuggestions(res.data);
      setSelectedIndex(-1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleSelect = (item) => {
    // Keep just the primary name and first context (e.g. Paris, Ile-de-France)
    const parts = item.display_name.split(',');
    onChange(parts.slice(0, 2).join(','));
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative z-[110]" ref={wrapperRef}>
      {label && <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>}
      <input 
        type="text" 
        value={value} 
        onChange={handleInputChange} 
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm" 
        placeholder={placeholder} 
      />
      
      <AnimatePresence>
        {showDropdown && (suggestions.length > 0 || isSearching) && (
          <motion.div 
            initial={{ opacity: 0, y: -5, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden z-[200]"
          >
            {isSearching ? (
              <div className="p-4 flex items-center justify-center text-slate-400"><Loader2 size={16} className="animate-spin" /></div>
            ) : (
              <ul className="max-h-60 overflow-y-auto hide-scrollbar">
                {suggestions.map((s, i) => (
                  <li 
                    key={i} 
                    onClick={() => handleSelect(s)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 ${selectedIndex === i ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedIndex === i ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <MapPin size={14} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold line-clamp-1 ${selectedIndex === i ? 'text-emerald-900' : 'text-slate-800'}`}>{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{s.display_name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TRANSPORT_MODES = [
  { id: 'flight', label: 'Flight', icon: Plane, speed: 800 },
  { id: 'train', label: 'Bullet Train', icon: Train, speed: 250 },
  { id: 'car', label: 'Road Trip', icon: Car, speed: 80 },
  { id: 'bus', label: 'Bus Journey', icon: Bus, speed: 60 },
  { id: 'cruise', label: 'Cruise/Ferry', icon: Ship, speed: 40 },
  { id: 'walking', label: 'Walking Tour', icon: Footprints, speed: 5 },
];

const TransportSelector = ({ selected, onChange, distance }) => {
  // Smart logic rules
  const recommendFlight = distance > 1000;
  
  useEffect(() => {
    if (distance > 1500 && selected !== 'flight') {
      onChange('flight');
      import('react-hot-toast').then(toast => toast.default('Switched to Flight due to long distance.', { icon: '✈️', id: 'transport-auto' }));
    }
  }, [distance, selected, onChange]);

  return (
    <div>
      <div className="flex justify-between items-end mb-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Transport Mode</label>
        {distance > 0 && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{distance.toLocaleString('en-IN')} km</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-2.5">
        {TRANSPORT_MODES.map((mode) => {
          const isWalkingDisabled = mode.id === 'walking' && distance > 50;
          const isRoadDisabled = (mode.id === 'car' || mode.id === 'bus') && distance > 3000;
          const isTrainDisabled = mode.id === 'train' && distance > 5000;
          const isDisabled = isWalkingDisabled || isRoadDisabled || isTrainDisabled;
          
          const isRecommended = recommendFlight && mode.id === 'flight' || (!recommendFlight && mode.id === 'train' && distance > 50);
          const active = selected === mode.id;

          return (
            <button
              key={mode.id}
              disabled={isDisabled}
              onClick={() => onChange(mode.id)}
              className={`relative flex items-center justify-center gap-1.5 px-2 py-2 h-10 rounded-xl transition-all select-none overflow-visible ${
                active 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              } ${isDisabled ? 'opacity-30 cursor-not-allowed saturate-0' : ''}`}
            >
              {isRecommended && !isDisabled && (
                <span className="absolute -top-2 -right-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10 pointer-events-none">
                  Recommended
                </span>
              )}
              <mode.icon size={14} className="pointer-events-none shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-wider text-center pointer-events-none whitespace-nowrap truncate">
                {mode.label}
              </span>
              {isDisabled && (
                <span className="absolute -bottom-2 text-[7px] text-red-500 font-bold pointer-events-none bg-white px-1 rounded-sm shadow-sm">Too Far</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RouteMap = React.memo(({ routeData, transport }) => {
  return (
    <MapContainer zoom={4} style={{ height: '100%', width: '100%' }} zoomControl={false} className="z-0">
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <MapBoundsFitter geometry={routeData.geometry} />
      
      {routeData.markers.map((m, i) => (
        <Marker key={i} position={m.coords}>
          <Popup className="font-bold text-sm text-slate-800">{m.name}</Popup>
        </Marker>
      ))}

      {transport === 'flight' && routeData.geometry.length > 1 ? (
        routeData.geometry.slice(0, -1).map((start, i) => (
          <Polyline key={i} positions={getCurvedPath(start, routeData.geometry[i+1])} color="#10b981" weight={3} opacity={0.8} dashArray="8, 8" />
        ))
      ) : (
        <Polyline positions={routeData.geometry} color="#10b981" weight={4} opacity={0.8} />
      )}
    </MapContainer>
  );
});

// ─── Main AI Planner Component ────────────────────────────────────────────────

export default function AIPlanner() {
  const { addItinerary } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  
  const [formData, setFormData] = useState({
    startLocation: '',
    destinations: [''],
    startDate: '',
    endDate: '',
    travelers: 2,
    style: 'Relaxing',
    transport: 'flight',
  });

  const [plan, setPlan] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Restore state if navigated from Itinerary detail "Open Planner"
  useEffect(() => {
    const hydrateTrip = async () => {
      if (location.state?.tripId) {
        setHydrating(true);
        const data = JSON.parse(localStorage.getItem('travista_itineraries')) || [];
        const storedTrip = data.find(t => String(t.id) === String(location.state.tripId));
        
        if (storedTrip) {
          setFormData({
            startLocation: storedTrip.startLocation || 'Unknown Origin',
            destinations: storedTrip.destination ? storedTrip.destination.split(', ') : ['Unknown'],
            startDate: storedTrip.startDate || '',
            endDate: storedTrip.endDate || '',
            travelers: storedTrip.travelers || 2,
            style: storedTrip.style || 'Relaxing',
            transport: storedTrip.transport || 'flight',
          });

          setPlan({
            title: storedTrip.title || storedTrip.destination,
            days: storedTrip.days || [],
            budget: storedTrip.budget || null,
            tips: storedTrip.tips || { packing: [], local: [] }
          });

          if (storedTrip.routeData) {
            setRouteData(storedTrip.routeData);
          } else if (storedTrip.destination) {
            // Lazy geocode if map data was missing
            try {
              const { geocodePlace, getRoute } = await import('../../services/aiService');
              const places = [storedTrip.startLocation || storedTrip.destination, ...storedTrip.destination.split(', ')];
              const coords = await Promise.all(places.filter(Boolean).map(place => geocodePlace(place)));
              const route = await getRoute(coords, storedTrip.transport || 'flight');
              setRouteData(route);
            } catch(e) {}
          }
          setActiveTab('itinerary');
          toast.success("Itinerary fully restored", { icon: "✨" });
        }
        setHydrating(false);
      }
    };
    hydrateTrip();
  }, [location]);

  const handleAddDestination = () => {
    setFormData({ ...formData, destinations: [...formData.destinations, ''] });
  };

  const handleDestChange = (index, value) => {
    const newDests = [...formData.destinations];
    newDests[index] = value;
    setFormData({ ...formData, destinations: newDests });
  };

  // Recalculate route whenever transport changes, if locations exist
  useEffect(() => {
    if (!routeData || hydrating) return;
    const recalc = async () => {
      const { getRoute } = await import('../../services/aiService');
      const route = await getRoute(routeData.markers.map(m => m.coords), formData.transport);
      setRouteData(prev => ({ ...prev, distance: route.distance, time: route.time }));
    };
    recalc();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.transport]);

  const handleGenerate = async () => {
    if (!formData.startLocation || !formData.destinations.filter(d => d).length || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    setIsSaved(false); // Reset save state for new generations
    const { geocodePlace, getRoute, generateItinerary } = await import('../../services/aiService');
    
    try {
      toast.loading('📍 Geocoding locations...', { id: 'planner' });
      const allPlaces = [formData.startLocation, ...formData.destinations.filter(d => d)];
      const coords = await Promise.all(allPlaces.map(place => geocodePlace(place)));

      toast.loading('🗺️ Calculating optimal route...', { id: 'planner' });
      const route = await getRoute(coords, formData.transport);
      setRouteData(route);

      toast.loading('🤖 AI is building your itinerary...', { id: 'planner' });
      const itinerary = await generateItinerary({
        origin: formData.startLocation,
        destinations: formData.destinations.filter(d => d),
        travelers: formData.travelers,
        style: formData.style,
        modeLabel: formData.transport,
      });

      setPlan(itinerary);
      setActiveTab('itinerary');
      toast.success('Your premium trip is ready!', { id: 'planner' });
    } catch (error) {
      console.error("[AI Planner]", error);
      toast.error('AI service temporarily unavailable.', { id: 'planner' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!plan || isSaved) return;
    
    addItinerary({
      id: location.state?.tripId || Date.now(), // update existing if restoring, else create new
      title: plan.title,
      destination: formData.destinations.filter(d => d).join(', '),
      startLocation: formData.startLocation,
      startDate: formData.startDate,
      endDate: formData.endDate,
      travelers: formData.travelers,
      transport: formData.transport,
      style: formData.style,
      days: plan.days,
      budget: plan.budget,
      tips: plan.tips,
      routeData: routeData
    });
    setIsSaved(true);
  };

  const handleDownloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(plan.title, 20, 20);
    doc.save('travista-itinerary.pdf');
    toast.success('PDF downloaded!');
  };

  const formatINR = (amount) => {
    if (!amount) return '₹ 0';
    if (typeof amount === 'string') {
      const parsed = parseInt(amount.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed)) return `₹ ${parsed.toLocaleString('en-IN')}`;
    }
    if (typeof amount === 'number') return `₹ ${amount.toLocaleString('en-IN')}`;
    return amount;
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-56px)] bg-[#fafaf9] overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      {/* ─── Left Sidebar: Input Form ─── */}
      <aside className="w-full md:w-[400px] shrink-0 h-full overflow-y-auto bg-white border-r border-slate-100 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 flex flex-col">
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Navigation size={18} />
          </div>
          Trip Studio
        </h2>

        <div className="space-y-4 flex-1">
          <DestinationAutocomplete 
            label="Starting Location"
            value={formData.startLocation} 
            onChange={v => setFormData({...formData, startLocation: v})} 
            placeholder="E.g. New Delhi, India" 
          />

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Destinations</label>
            {formData.destinations.map((dest, i) => (
              <DestinationAutocomplete 
                key={i}
                value={dest} 
                onChange={v => handleDestChange(i, v)} 
                placeholder={`Destination ${i + 1}`} 
              />
            ))}
            <button onClick={handleAddDestination} className="text-emerald-600 text-[11px] font-black uppercase tracking-wider mt-1 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              + Add Stop
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Travelers</label>
            <select value={formData.travelers} onChange={e => setFormData({...formData, travelers: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 appearance-none">
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Person{n>1?'s':''}</option>)}
            </select>
          </div>

          <TransportSelector 
            selected={formData.transport} 
            onChange={v => setFormData({...formData, transport: v})} 
            distance={routeData?.distance || 0}
          />

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Travel Style</label>
            <div className="flex flex-wrap gap-2.5">
              {['Adventure', 'Relaxing', 'Cultural', 'Food', 'Luxury', 'Budget'].map(style => (
                <button 
                  key={style} 
                  onClick={() => setFormData({...formData, style})} 
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${formData.style === style ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading || hydrating} 
          className="w-full h-12 mt-4 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shrink-0"
        >
          {loading || hydrating ? <Loader2 size={16} className="animate-spin" /> : (location.state?.tripId ? 'Regenerate Itinerary' : 'Generate Itinerary')} 
        </button>
      </aside>

      {/* ─── Right Area: Results & Tabs ─── */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col bg-slate-50 relative">
        {!plan ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 min-h-[600px] text-center bg-transparent w-full">
            {hydrating ? (
               <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
            ) : (
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/5 border border-emerald-100"
              >
                <MapIcon size={48} className="text-emerald-500" />
              </motion.div>
            )}
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{hydrating ? 'Restoring your trip...' : 'Design your dream trip.'}</h3>
            <p className="max-w-md text-slate-500 font-medium leading-relaxed">Let Travista AI build a personalized itinerary, optimize your route, and estimate your budget in seconds.</p>
          </div>
        ) : (
          <>
            <div className="bg-white/90 backdrop-blur-xl px-4 md:px-6 pt-6 pb-4 border-b border-slate-200 shrink-0 sticky top-0 z-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  {plan.labels && plan.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.labels.map((label, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-md text-[10px] font-black text-emerald-700 uppercase tracking-wider shadow-sm">
                          <Sparkles size={10} className="text-emerald-500" /> {label}
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">{plan.title}</h1>
                  <div className="flex flex-wrap gap-2 md:gap-4">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-600 uppercase tracking-widest"><Calendar size={14}/> {formData.startDate || 'Any Date'}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-600 uppercase tracking-widest"><Users size={14}/> {formData.travelers} Pax</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg text-xs font-black text-emerald-700 uppercase tracking-widest"><Activity size={14}/> {formData.style}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={isSaved} className={`h-10 px-4 font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-sm ${isSaved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'}`}>
                    <Save size={16} /> {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={handleDownloadPDF} className="h-10 px-4 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 flex items-center gap-2 transition-all shadow-md shadow-slate-900/10">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto hide-scrollbar touch-pan-x">
                {[
                  { id: 'map', label: 'Route Map', icon: MapIcon },
                  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                  { id: 'budget', label: 'Budget', icon: DollarSign },
                  { id: 'tips', label: 'Local Tips', icon: Lightbulb }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center whitespace-nowrap gap-2 px-5 py-3 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-t-2xl transition-all ${activeTab === tab.id ? 'bg-slate-50 text-emerald-600 border-t border-x border-slate-200 shadow-[0_-4px_10px_rgb(0,0,0,0.02)]' : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}>
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-slate-50 relative">
              
              {/* TAB 1: MAP */}
              {activeTab === 'map' && routeData && (
                <div className="flex-1 w-full relative bg-[#f8fafc] z-0 overflow-hidden min-h-[500px]">
                  <RouteMap routeData={routeData} transport={formData.transport} />

                  {/* FIXED: Positioning the overlay safely within the map wrapper with a high z-index and safe padding */}
                  <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-[1000] max-w-[calc(100vw-2rem)] md:max-w-sm pointer-events-none">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-white/50 pointer-events-auto"
                    >
                      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          {formData.transport === 'flight' ? <Plane size={20}/> : formData.transport === 'train' ? <Train size={20}/> : <Car size={20}/>}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-0.5">Route Summary</h4>
                          <p className="text-xs text-slate-500 font-bold truncate">
                            {formData.startLocation.split(',')[0]} → {formData.destinations[formData.destinations.length-1].split(',')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Distance</p>
                          <p className="text-base md:text-lg font-black text-slate-800">{routeData.distance.toLocaleString('en-IN')} <span className="text-xs text-slate-400">km</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Travel Time</p>
                          <p className="text-base md:text-lg font-black text-emerald-600">{routeData.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* TAB 2: ITINERARY */}
              {activeTab === 'itinerary' && (
                <div className="w-full px-4 md:px-6 py-6 space-y-6 pb-20 relative">
                  <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-slate-200/50 hidden md:block"></div>
                  {plan.days.map((day, idx) => (
                    <motion.div 
                      key={day.day} 
                      initial={{opacity:0, y:10}} 
                      animate={{opacity:1, y:0}} 
                      transition={{ duration: 0.25, ease: "easeOut", delay: Math.min(idx*0.05, 0.3) }} 
                      className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-md relative z-10 hover:shadow-lg transition-shadow duration-300"
                      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                    >
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-8 flex items-center gap-4 border-b border-slate-100 pb-4">
                        <span className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 text-lg">D{day.day}</span>
                        {day.title || `Exploring Destination ${idx + 1}`}
                      </h3>
                      <div className="space-y-8">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 group relative">
                            <div className="w-24 shrink-0 pt-1">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1.5 bg-emerald-50 rounded-lg shadow-sm whitespace-nowrap">{act.time}</span>
                            </div>
                            <div className="flex-1 pb-8 border-b border-slate-50 group-last:border-0 group-last:pb-0 relative">
                              <h4 className="font-bold text-slate-800 text-base md:text-lg">{act.title}</h4>
                              <p className="text-slate-500 text-xs md:text-sm mt-2 leading-relaxed font-medium">{act.desc || act.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* TAB 3: BUDGET */}
              {activeTab === 'budget' && (
                <div className="w-full px-4 md:px-6 py-6 pb-20">
                  <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden w-full">
                    <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                      <div className="z-10">
                        <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={16}/> Estimated Total Cost</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tight">{formatINR(plan.budget?.total)}</p>
                      </div>
                      <div className="z-10 bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm w-fit">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-300">{formData.style} Range</span>
                      </div>
                    </div>
                    <div className="p-8 md:p-10 space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-4 group hover:bg-slate-50 transition-colors p-2 rounded-xl">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Plane size={18} className="text-blue-500"/></div><span className="font-bold text-slate-700 text-sm md:text-base">Transport</span></div>
                        <span className="font-black text-slate-900 text-base md:text-lg">{formatINR(plan.budget?.transport)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-4 group hover:bg-slate-50 transition-colors p-2 rounded-xl">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Bed size={18} className="text-emerald-500"/></div><span className="font-bold text-slate-700 text-sm md:text-base">Accommodation</span></div>
                        <span className="font-black text-slate-900 text-base md:text-lg">{formatINR(plan.budget?.stay)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-4 group hover:bg-slate-50 transition-colors p-2 rounded-xl">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0"><Utensils size={18} className="text-orange-500"/></div><span className="font-bold text-slate-700 text-sm md:text-base">Food & Dining</span></div>
                        <span className="font-black text-slate-900 text-base md:text-lg">{formatINR(plan.budget?.food)}</span>
                      </div>
                      <div className="flex justify-between items-center group hover:bg-slate-50 transition-colors p-2 rounded-xl">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0"><Activity size={18} className="text-purple-500"/></div><span className="font-bold text-slate-700 text-sm md:text-base">Activities</span></div>
                        <span className="font-black text-slate-900 text-base md:text-lg">{formatINR(plan.budget?.activities)}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* TAB 4: TIPS */}
              {activeTab === 'tips' && (
                <div className="w-full px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-20">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-5 md:p-6 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-100/50 hover:-translate-y-1 transition-transform">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0"><Lightbulb size={20}/></div>
                      <h3 className="text-lg md:text-xl font-black text-emerald-900 uppercase tracking-widest text-[10px] md:text-sm">Packing Checklist</h3>
                    </div>
                    <ul className="space-y-4">
                      {plan.tips?.packing?.map((tip, i) => (
                        <li key={i} className="flex items-start gap-4 text-emerald-800 font-bold text-xs md:text-sm bg-emerald-50/50 p-3 rounded-xl border border-emerald-50">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white mt-0.5 shadow-sm shadow-emerald-500/20">✓</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 md:p-8 rounded-[2rem] border border-amber-100 shadow-xl shadow-amber-100/50 hover:-translate-y-1 transition-transform">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0"><AlertCircle size={20}/></div>
                      <h3 className="text-lg md:text-xl font-black text-amber-900 uppercase tracking-widest text-[10px] md:text-sm">Local Insights</h3>
                    </div>
                    <ul className="space-y-4">
                      {plan.tips?.local?.map((tip, i) => (
                        <li key={i} className="flex items-start gap-4 text-amber-800 font-bold text-xs md:text-sm bg-amber-50/50 p-3 rounded-xl border border-amber-50">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white mt-0.5 shadow-sm shadow-amber-500/20">!</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              )}

            </div>
          </>
        )}
      </main>
    </div>
  );
}
