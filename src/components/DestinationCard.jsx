import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Star, Bell, X, ArrowRight, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDestinationPhoto } from '../hooks/useDestinationPhoto';
import { useWeather } from '../hooks/useTravista';
import { track } from '../services/trackingService';
import toast from 'react-hot-toast';

// ─── Weather Badge ───────────────────────────────────────────────────────────
export function WeatherBadge({ city }) {
  const { weather, loading } = useWeather(city);
  if (loading || !weather) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full shadow-lg"
    >
      <img src={weather.icon} alt="" className="w-3.5 h-3.5" />
      <span className="text-white text-[10px] font-black tracking-tight">{weather.temp}°C</span>
    </motion.div>
  );
}

// ─── Price Alert Modal ───────────────────────────────────────────────────────
function PriceAlertModal({ item, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success(`Alert set for ${item.name}! We'll notify you if it drops below ₹${Math.floor(item.price * 0.9).toLocaleString('en-IN')}`);
      onClose();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl shadow-black/40"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-32">
          <img src={item.image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900 mb-2">Track {item.name}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
              Our AI monitors flight & hotel prices 24/7. Get a ping the moment it drops below your budget.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Where should we send alerts?"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? "Activating..." : "Set Price Alert"}
              {!loading && <Bell size={14} />}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Destination Card ───────────────────────────────────────────────────
export function DestinationCard({ item, reasonChip, onPlanTrip }) {
  const navigate = useNavigate();
  const { savedPlaces, toggleSave } = useAuth() || { savedPlaces: [], toggleSave: () => {} };
  const { photoUrl, loading: photoLoading } = useDestinationPhoto(item?.name);
  const [showAlertModal, setShowAlertModal] = useState(false);

  if (!item) return null;

  const isSaved = savedPlaces?.some(p => p.id === item.id);
  const imageToUse = photoUrl || item.image;

  const formatPrice = (price) => {
    if (typeof price === 'string' && (price.includes('k') || price.includes('L'))) return price;
    const num = Number(price);
    if (isNaN(num)) return price;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${Math.round(num / 1000)}k`;
    return `₹${num}`;
  };

  const handlePlanClick = (e) => {
    e.stopPropagation();
    track.itinerary(item.name);
    if (onPlanTrip) onPlanTrip(item);
    else navigate('/planner', { state: { destInput: item.name } });
  };

  const handleCardClick = () => {
    track.viewed(item.name);
    navigate(`/destination/${item.id}`, { state: { destination: item } });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative h-[180px] w-full rounded-[1.2rem] overflow-hidden cursor-pointer bg-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-500"
        onClick={handleCardClick}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-200">
          <img
            src={imageToUse}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-90 group-hover:opacity-100"
          />
        </div>

        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <div className="flex flex-col gap-1">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
            >
              {item.category?.split(' ')[0] || "Top"}
            </motion.span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); toggleSave(item); }}
              className={`w-7 h-7 rounded-lg backdrop-blur-xl flex items-center justify-center transition-all ${
                isSaved ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/20 text-white hover:bg-white hover:text-rose-500'
              }`}
            >
              <Heart size={12} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-emerald-400 text-[8px] font-black uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
              <MapPin size={8} /> {item.country || item.location}
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-black text-white tracking-tighter drop-shadow-md leading-none">
                {item.name}
              </h3>
              <p className="text-sm font-black text-white drop-shadow-md pb-0.5">
                {formatPrice(item.price)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAlertModal && (
          <PriceAlertModal item={item} onClose={() => setShowAlertModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Destination Skeleton ────────────────────────────────────────────────────
export function DestinationSkeleton() {
  return (
    <div className="h-[440px] w-full rounded-[2.5rem] bg-slate-100 animate-pulse flex flex-col justify-end p-8 space-y-4">
      <div className="w-24 h-4 bg-slate-200 rounded-full" />
      <div className="w-48 h-8 bg-slate-200 rounded-full" />
      <div className="w-full h-12 bg-slate-200 rounded-2xl mt-4" />
    </div>
  );
}

// ─── Search Result Card ──────────────────────────────────────────────────────
export function DestinationResultCard({ results }) {
  const navigate = useNavigate();
  if (!results) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row"
    >
      <div className="md:w-1/2 h-64 md:h-auto relative">
        <img src={results.photos?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"} className="w-full h-full object-cover" alt="" />
        <div className="absolute top-4 left-4">
          <WeatherBadge city={results.destination} />
        </div>
      </div>
      <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Search Result</span>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{results.destination}</h3>
          </div>
          
          <div className="flex items-center gap-6 py-4 border-y border-slate-100">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Temperature</p>
              <p className="text-xl font-black text-slate-900">{results.weather?.temp || "--"}°C</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Condition</p>
              <p className="text-xl font-black text-slate-900 capitalize">{results.weather?.condition || "Sunny"}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/planner', { state: { destInput: results.destination } })}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/20"
          >
            Generate AI Itinerary 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default DestinationCard;

