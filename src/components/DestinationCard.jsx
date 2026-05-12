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

  const getOptimizedImage = (url) => {
    if (!url) return '';
    if (url.includes('unsplash.com')) {
      // If it already has query params, modify them, else just append
      if (url.includes('?')) {
        return url.replace(/w=\d+/, 'w=600').replace(/q=\d+/, 'q=80');
      }
      return `${url}?auto=format&fit=crop&w=600&q=80`;
    }
    return url;
  };

  const optimizedImage = getOptimizedImage(imageToUse);

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
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="group relative h-[320px] w-full rounded-3xl overflow-hidden cursor-pointer bg-slate-100 shadow-md hover:shadow-xl transition-shadow duration-300"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        onClick={handleCardClick}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-200">
          <img
            src={optimizedImage}
            loading="lazy"
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100 aspect-[3/4] min-h-0"
          />
        </div>

        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10" />
        
        {/* Save Button (Top Right) */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); toggleSave(item); }}
            className={`w-8 h-8 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              isSaved ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-black/20 border border-white/20 text-white hover:bg-white hover:text-rose-500 hover:border-transparent'
            }`}
          >
            <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
        
        {/* Bottom Content Area */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Category */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-[4px] text-white text-[8px] font-black uppercase tracking-widest border border-white/10">
                  {item.category?.split(' ')[0] || "Top Rated"}
                </span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-amber-300">
                  <Star size={9} className="fill-amber-300" />
                  {item.rating || "4.8"}
                </div>
              </div>
              
              {/* Name */}
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter drop-shadow-md leading-none truncate mb-1">
                {item.name}
              </h3>
              
              {/* Price */}
              <p className="text-white/90 font-black text-xs drop-shadow-sm">
                {formatPrice(item.price)} <span className="text-white/60 text-[9px] font-medium lowercase tracking-wide">/person</span>
              </p>
            </div>

            {/* CTA Button */}
            <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-emerald-400 hover:text-white shadow-xl shadow-black/20">
              <ArrowRight size={16} />
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
    <div className="h-[320px] w-full rounded-3xl bg-slate-100 animate-pulse flex flex-col justify-end p-6 space-y-3">
      <div className="w-20 h-3 bg-slate-200 rounded-full" />
      <div className="w-32 h-6 bg-slate-200 rounded-full" />
      <div className="w-full h-10 bg-slate-200 rounded-xl mt-2" />
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

