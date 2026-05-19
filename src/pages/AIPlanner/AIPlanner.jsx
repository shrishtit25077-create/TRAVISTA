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
    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * midPoint[0] + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * midPoint[1] + t * t * end[1];
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
    const parts = item?.display_name?.split(',') || [];
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
    <div className={`relative ${showDropdown ? 'z-[150]' : 'z-[110]'}`} ref={wrapperRef}>
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
              className={`relative flex items-center justify-center gap-1.5 px-2 py-2 h-10 rounded-xl transition-all select-none overflow-visible ${active
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
    <div style={{ position: 'absolute', inset: 0 }}>
      <MapContainer
        zoom={4}
        style={{ height: '100%', width: '100%', minHeight: 400 }}
        zoomControl={false}
        className="z-0"
      >
        {/* Dark premium CARTO tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapBoundsFitter geometry={routeData.geometry} />

        {routeData.markers.map((m, i) => (
          <Marker key={i} position={m.coords}>
            <Popup className="font-bold text-sm text-slate-800">{m.name}</Popup>
          </Marker>
        ))}

        {transport === 'flight' && routeData.geometry.length > 1 ? (
          routeData.geometry.slice(0, -1).map((start, i) => [
            <Polyline key={`glow-${i}`} positions={getCurvedPath(start, routeData.geometry[i + 1])} color="#34d399" weight={10} opacity={0.18} />,
            <Polyline key={`path-${i}`} positions={getCurvedPath(start, routeData.geometry[i + 1])} color="#10b981" weight={2.5} opacity={0.95} dashArray="10, 6" />,
          ])
        ) : (
          [
            <Polyline key="glow" positions={routeData.geometry} color="#34d399" weight={12} opacity={0.18} />,
            <Polyline key="path" positions={routeData.geometry} color="#10b981" weight={3.5} opacity={0.95} />,
          ]
        )}
      </MapContainer>
    </div>
  );
});

// ─── Main AI Planner Component ────────────────────────────────────────────────

export default function AIPlanner() {
  const { addItinerary } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
              const places = [storedTrip.startLocation || storedTrip.destination, ...(storedTrip.destination?.split(', ') || [])];
              const coords = await Promise.all(places.filter(Boolean).map(place => geocodePlace(place)));
              const route = await getRoute(coords, storedTrip.transport || 'flight');
              setRouteData(route);
            } catch (e) { }
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

      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1) || 3;

      toast.loading('🤖 AI is building your itinerary...', { id: 'planner' });
      const itinerary = await generateItinerary({
        origin: formData.startLocation,
        destinations: formData.destinations.filter(d => d),
        travelers: formData.travelers,
        style: formData.style,
        modeLabel: formData.transport,
        totalDays: totalDays
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

  const handleSave = async () => {
    if (!plan || isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await addItinerary({
        id: location.state?.tripId || Date.now(),
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
        routeData: routeData,
        savedAt: new Date().toISOString(),
      });
      setIsSaved(true);
    } catch (e) {
      // error toast already shown by addItinerary
    } finally {
      setIsSaving(false);
    }
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
    <div className="flex flex-col md:flex-row w-full bg-[#fafaf9]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      {/* ─── Left Sidebar: Input Form ─── */}
      <aside
        className="w-full md:w-[400px] shrink-0 bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 planner-sidebar"
      >
        {/* Inner padding wrapper */}
        <div className="flex flex-col p-6">
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
              onChange={v => setFormData({ ...formData, startLocation: v })}
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
                <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Travelers</label>
              <select value={formData.travelers} onChange={e => setFormData({ ...formData, travelers: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 appearance-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>

            <TransportSelector
              selected={formData.transport}
              onChange={v => setFormData({ ...formData, transport: v })}
              distance={routeData?.distance || 0}
            />

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Travel Style</label>
              <div className="flex flex-wrap gap-2.5">
                {['Adventure', 'Relaxing', 'Cultural', 'Food', 'Luxury', 'Budget'].map(style => (
                  <button
                    key={style}
                    onClick={() => setFormData({ ...formData, style })}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                      formData.style === style ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
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
            {loading || hydrating
              ? <Loader2 size={16} className="animate-spin" />
              : (location.state?.tripId ? 'Regenerate Itinerary' : 'Generate Itinerary')
            }
          </button>
        </div>
      </aside>

      {/* ─── Right Area: Results & Tabs ─── */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50 relative">
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
            {/* ── Static header: title, meta, actions ── */}
            <div className="bg-white px-4 md:px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
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
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-600 uppercase tracking-widest"><Calendar size={14} /> {formData.startDate || 'Any Date'}</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-600 uppercase tracking-widest"><Users size={14} /> {formData.travelers} Pax</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg text-xs font-black text-emerald-700 uppercase tracking-widest"><Activity size={14} /> {formData.style}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaved || isSaving}
                    className={`h-10 px-5 font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-sm relative overflow-hidden ${isSaved
                        ? 'bg-emerald-500 text-white border border-emerald-500 cursor-not-allowed shadow-emerald-500/20 shadow-md'
                        : isSaving
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-wait'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-600 hover:shadow-emerald-500/10 hover:shadow-md'
                      }`}
                  >
                    {isSaving ? (
                      <><Loader2 size={14} className="animate-spin" /> Saving…</>
                    ) : isSaved ? (
                      <motion.span
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <Save size={14} className="text-white" />
                        </motion.div>
                        Saved ✓
                      </motion.span>
                    ) : (
                      <><Save size={14} /> Save Trip</>
                    )}
                  </button>
                  <button onClick={handleDownloadPDF} className="h-10 px-4 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 flex items-center gap-2 transition-all shadow-md shadow-slate-900/10">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>
            </div>

            {/* ── Sticky tabs-only bar ── */}
            <div className="planner-tabs-bar px-4 md:px-6 py-0">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar touch-pan-x">
                {[
                  { id: 'map', label: 'Route Map', icon: MapIcon },
                  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                  { id: 'budget', label: 'Budget', icon: DollarSign },
                  { id: 'tips', label: 'Local Tips', icon: Lightbulb }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center whitespace-nowrap gap-2 px-5 py-3.5 font-black text-[10px] md:text-xs uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'}`}>
                    <tab.icon size={15} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-slate-50 relative" style={{ minHeight: activeTab === 'map' ? 'calc(100vh - 200px)' : 'auto' }}>

              {activeTab === 'map' && (
                routeData ? (
                  <div className="absolute inset-0 z-[1] min-h-[500px]">
                    <RouteMap routeData={routeData} transport={formData.transport} />
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-[1000] max-w-[calc(100vw-2rem)] md:max-w-sm pointer-events-none">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pointer-events-auto"
                        style={{
                          background: 'rgba(255,255,255,0.88)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.5)',
                          borderRadius: '24px',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(16,185,129,0.1)',
                          padding: '20px 24px',
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/25">
                            {formData.transport === 'flight' ? <Plane size={18} /> : formData.transport === 'train' ? <Train size={18} /> : <Car size={18} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-0.5">Route Summary</h4>
                            <p className="text-xs text-slate-500 font-bold truncate">
                              {formData.startLocation?.split(',')[0]} → {formData.destinations[formData.destinations.length - 1]?.split(',')[0]}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Distance</p>
                            <p className="text-base md:text-lg font-black text-slate-800">{Number(routeData.distance || 0).toLocaleString('en-IN')} <span className="text-xs text-slate-400">km</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Travel Time</p>
                            <p className="text-base md:text-lg font-black text-emerald-600">{routeData.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  /* ── Premium empty state when no trip generated yet ── */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-8 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)' }}
                  >
                    {/* Ambient glow orbs */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Animated globe icon */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                      className="w-28 h-28 rounded-full border border-emerald-500/20 flex items-center justify-center mb-6 relative"
                    >
                      <div className="absolute inset-2 rounded-full border border-emerald-500/10" />
                      <div className="absolute inset-5 rounded-full border border-emerald-500/10" />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                      >
                        <MapIcon size={28} className="text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Dotted world lines */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                      <svg width="600" height="300" viewBox="0 0 600 300">
                        <ellipse cx="300" cy="150" rx="280" ry="130" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" />
                        <ellipse cx="300" cy="150" rx="200" ry="130" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" />
                        <ellipse cx="300" cy="150" rx="100" ry="130" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" />
                        <line x1="20" y1="150" x2="580" y2="150" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" />
                        <line x1="300" y1="20" x2="300" y2="280" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight relative z-10">Your route will appear here</h3>
                    <p className="text-slate-400 font-medium text-sm text-center max-w-xs leading-relaxed relative z-10 mb-6">
                      Fill in your trip details and click <span className="text-emerald-400 font-bold">Generate Itinerary</span> to see an interactive AI-powered route map
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 justify-center relative z-10">
                      {['🗺️ Live Route', '✈️ Transport Mode', '📍 Distance & Time', '🌍 Dark Map Style'].map(f => (
                        <span key={f} className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">{f}</span>
                      ))}
                    </div>
                  </motion.div>
                )
              )}

              {/* TAB 2: ITINERARY */}
              {activeTab === 'itinerary' && (
                <div className="w-full px-4 md:px-6 pt-8 pb-24 space-y-6 relative">
                  <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-slate-200/50 hidden md:block"></div>
                  {plan.days.map((day, idx) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut", delay: Math.min(idx * 0.05, 0.3) }}
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

              {/* TAB 3: BUDGET — Premium AI Finance Dashboard */}
              {activeTab === 'budget' && (
                <div className="w-full px-4 md:px-6 py-6 pb-20 space-y-5">
                  {/* Hero total card */}
                  <motion.div
                    initial={{ scale: 0.97, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative overflow-hidden rounded-[2rem] text-white"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)' }}
                  >
                    <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
                    <div className="relative z-10 p-8 md:p-10">
                      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Sparkles size={12} /> AI Estimated Total Cost
                          </p>
                          <p className="text-5xl md:text-6xl font-black tracking-tight">{formatINR(plan.budget?.total)}</p>
                          <p className="text-xs text-slate-400 font-medium mt-2">for {formData.travelers} traveler{formData.travelers > 1 ? 's' : ''} · {formData.style} style</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Per Person</p>
                            <p className="text-lg font-black text-white">{formatINR(Math.round((parseInt(String(plan.budget?.total).replace(/[^0-9]/g, '')) || 0) / Math.max(formData.travelers, 1)))}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Day</p>
                            <p className="text-base font-black text-white">{formatINR(Math.round((parseInt(String(plan.budget?.total).replace(/[^0-9]/g, '')) || 0) / Math.max(plan.days?.length || 1, 1)))}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Breakdown cards with progress bars */}
                  {(() => {
                    const total = parseInt(String(plan.budget?.total).replace(/[^0-9]/g, '')) || 1;
                    const items = [
                      { label: 'Transport', key: 'transport', icon: Plane, color: 'blue', bar: 'bg-blue-500', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
                      { label: 'Accommodation', key: 'stay', icon: Bed, color: 'emerald', bar: 'bg-emerald-500', bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
                      { label: 'Food & Dining', key: 'food', icon: Utensils, color: 'orange', bar: 'bg-orange-500', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
                      { label: 'Activities', key: 'activities', icon: Activity, color: 'purple', bar: 'bg-purple-500', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
                    ];
                    return (
                      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
                        <div className="p-6 md:p-8 space-y-5">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Expense Breakdown</h3>
                          {items.map((item, idx) => {
                            const raw = parseInt(String(plan.budget?.[item.key]).replace(/[^0-9]/g, '')) || 0;
                            const pct = Math.min(Math.round((raw / total) * 100), 100);
                            return (
                              <motion.div
                                key={item.key}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.15 + idx * 0.07 }}
                                className="group"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                                      <item.icon size={16} className={item.iconColor} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-black text-slate-900 text-sm md:text-base">{formatINR(plan.budget?.[item.key])}</span>
                                    <span className="text-[10px] text-slate-400 font-bold ml-2">{pct}%</span>
                                  </div>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className={`h-full ${item.bar} rounded-full`}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* AI Savings Insight */}
                  <motion.div
                    initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                    className="relative overflow-hidden rounded-[2rem] border border-emerald-100 p-6"
                    style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">AI Savings Insight</p>
                        <p className="text-sm font-bold text-emerald-800 leading-relaxed">
                          Shifting your departure by 2 days could save up to ₹12,000–₹18,000 on transport. Booking accommodation 21+ days early typically saves 30–40%.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Luxury vs Budget comparison */}
                  <motion.div
                    initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden"
                  >
                    <div className="p-6 md:p-8">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Style Comparison</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-colors">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Budget Mode</p>
                          <p className="text-xl font-black text-slate-800">{formatINR(Math.round((parseInt(String(plan.budget?.total).replace(/[^0-9]/g, '')) || 0) * 0.65))}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">Hostels · Local food · Public transport</p>
                        </div>
                        <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 transition-colors">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Luxury Mode</p>
                          <p className="text-xl font-black text-slate-900">{formatINR(Math.round((parseInt(String(plan.budget?.total).replace(/[^0-9]/g, '')) || 0) * 1.8))}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">5-star hotels · Fine dining · Private transfers</p>
                        </div>
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
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0"><Lightbulb size={20} /></div>
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
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0"><AlertCircle size={20} /></div>
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
