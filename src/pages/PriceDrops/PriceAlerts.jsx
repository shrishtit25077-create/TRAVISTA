import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, TrendingUp, Bell, BellRing, Sparkles, Plane,
  Hotel, ArrowRight, Zap, Clock, Globe, Tag, DollarSign, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ─── Sparkline ─────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = '#10b981' }) => {
  const h = 40, w = 90;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-24 h-10 overflow-visible shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Data ──────────────────────────────────────────────────────────────────
const DROPS = [
  { id: 'd1', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop', type: 'Flight', tag: 'Budget', oldPrice: 165000, newPrice: 119000, dropPct: 28, trend: [165,160,152,140,132,125,119], rising: false, ai: 'Cheapest month: September. Book in next 3 days.', bestWindow: 'Sep 3–10' },
  { id: 'd2', name: 'Swiss Alps', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop', type: 'Hotel', tag: 'Luxury', oldPrice: 245000, newPrice: 198000, dropPct: 19, trend: [245,242,238,228,215,205,198], rising: false, ai: 'Ski season prices 19% below forecast.', bestWindow: 'Dec 8–22' },
  { id: 'd3', name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop', type: 'Flight', tag: 'International', oldPrice: 210000, newPrice: 174000, dropPct: 17, trend: [210,205,200,192,185,180,174], rising: false, ai: 'Flights drop on Tuesdays. Best: Book Tue AM.', bestWindow: 'Oct 12–19' },
  { id: 'd4', name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop', type: 'Flight', tag: 'International', oldPrice: 145000, newPrice: 112000, dropPct: 22, trend: [145,141,138,132,128,119,112], rising: false, ai: '22% below 30-day avg. Best booking window open.', bestWindow: 'Nov 1–8' },
  { id: 'd5', name: 'Maldives', country: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop', type: 'Hotel', tag: 'Luxury', oldPrice: 320000, newPrice: 249000, dropPct: 22, trend: [320,315,305,290,272,260,249], rising: false, ai: 'Limited overwater villas. Drop may reverse soon.', bestWindow: 'Jan 5–15' },
  { id: 'd6', name: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop', type: 'Flight', tag: 'Budget', oldPrice: 72000, newPrice: 54000, dropPct: 25, trend: [72,70,68,65,62,58,54], rising: false, ai: 'Shoulder season deal. Prices historically low.', bestWindow: 'Oct 20–28' },
  { id: 'd7', name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop', type: 'Hotel', tag: 'Luxury', oldPrice: 180000, newPrice: 210000, dropPct: -17, trend: [180,183,188,194,200,206,210], rising: true, ai: 'Expo season surge detected. Book urgently.', bestWindow: 'N/A' },
  { id: 'd8', name: 'Goa', country: 'India', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop', type: 'Flight', tag: 'Weekend', oldPrice: 18000, newPrice: 12000, dropPct: 33, trend: [18,17,16,15,14,13,12], rising: false, ai: 'Lowest domestic fare in 3 months. Peak soon.', bestWindow: 'This Weekend' },
];

const AI_INSIGHTS = [
  { icon: TrendingDown, text: 'Prices to Europe may rise 15% after Oct 15.', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Clock, text: 'Best time to book flights: Tuesday mornings.', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Globe, text: 'September is 23% cheaper for Southeast Asia.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Sparkles, text: 'AI detects a flash sale window for Maldives.', color: 'text-violet-500', bg: 'bg-violet-50' },
  { icon: Calendar, text: 'Long weekends in Dec: book now or pay 30% more.', color: 'text-rose-500', bg: 'bg-rose-50' },
  { icon: Zap, text: 'Price confidence HIGH for Bali in next 48 hrs.', color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

const FILTERS = [
  { label: 'All', key: 'all', icon: Globe },
  { label: 'Flights', key: 'Flight', icon: Plane },
  { label: 'Hotels', key: 'Hotel', icon: Hotel },
  { label: 'Luxury', key: 'Luxury', icon: Tag },
  { label: 'Budget', key: 'Budget', icon: DollarSign },
  { label: 'Weekend', key: 'Weekend', icon: Calendar },
  { label: 'International', key: 'International', icon: Globe },
];

// ─── Price Alert Card ───────────────────────────────────────────────────────
const AlertCard = ({ drop }) => {
  const [tracked, setTracked] = useState(false);
  const isRising = drop.rising;
  const color = isRising ? '#f59e0b' : '#10b981';

  const handleTrack = (e) => {
    e.stopPropagation();
    setTracked(t => !t);
    toast.custom(() => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold"
      >
        <BellRing size={16} className="text-emerald-400 shrink-0" />
        AI is now tracking {drop.name} prices
      </motion.div>
    ), { duration: 3000 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className="relative h-[340px] bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-300/40 transition-all duration-500 group"
    >
      {/* Image */}
      <div className="absolute inset-0">
        <img src={drop.image} alt={drop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent opacity-90" />
      </div>

      {/* Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1">
          {drop.type === 'Flight' ? <Plane size={9} /> : <Hotel size={9} />} {drop.type}
        </span>
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg ${isRising ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {isRising ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {isRising ? '+' : '↓'}{Math.abs(drop.dropPct)}%
        </span>
      </div>

      {/* Body Overlaid */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 space-y-3">
        <div>
          <p className="text-white font-black text-2xl tracking-tighter leading-none">{drop.name}</p>
          <p className="text-white/60 text-[10px] font-medium mt-0.5 tracking-wide uppercase">{drop.country}</p>
        </div>
        {/* Price + sparkline */}
        <div className="flex items-end justify-between pt-3 border-t border-white/10">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-white/50 mb-0.5">Price Evolution</p>
            <div className="flex items-center gap-1.5">
              <span className="text-white/40 line-through text-[10px] font-semibold">₹{(drop.oldPrice/1000).toFixed(0)}k</span>
              <span className={`text-lg font-black text-white`}>₹{(drop.newPrice/1000).toFixed(0)}k</span>
            </div>
          </div>
          <Sparkline data={drop.trend} color={color} />
        </div>

        {/* Track button */}
        <button
          onClick={handleTrack}
          className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
            tracked
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white text-slate-900 hover:bg-emerald-500 hover:text-white'
          }`}
        >
          <Bell size={10} className={tracked ? 'fill-white' : ''} />
          {tracked ? 'Tracking Active' : 'Track Deal'}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const PriceAlerts = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return DROPS;
    return DROPS.filter(d => d.type === activeFilter || d.tag === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-4 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">AI Monitoring Active</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-2">
                Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Price Alerts</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium max-w-xl">
                Travista AI continuously monitors fares, hotels, and destination trends to help you book at the perfect time.
              </p>
            </div>

            {/* Live stats */}
            <div className="flex gap-3 shrink-0">
              {[
                { label: 'Deals Tracked', value: '2,847' },
                { label: 'Avg Saving', value: '₹31k' },
                { label: 'Alerts Sent', value: '1,204' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-slate-100 rounded-2xl px-4 py-3 text-center shadow-sm">
                  <p className="text-xl font-black text-slate-900">{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-6 touch-pan-x">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${
                activeFilter === f.key
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <f.icon size={11} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Cards Grid */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map(drop => <AlertCard key={drop.id} drop={drop} />)}
              </div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
                <TrendingDown size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-lg font-black text-slate-700 mb-1">No alerts in this category</p>
                <p className="text-sm text-slate-400">Try a different filter or check back soon.</p>
              </motion.div>
            )}
          </div>

          {/* AI Insights Sidebar */}
          <aside className="xl:w-72 shrink-0 space-y-4">
            {/* Insights panel */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-emerald-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700">AI Travel Insights</h3>
              </div>
              <div className="space-y-2.5">
                {AI_INSIGHTS.map((ins, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl ${ins.bg}`}
                  >
                    <ins.icon size={13} className={`${ins.color} shrink-0 mt-0.5`} />
                    <p className="text-[11px] text-slate-600 font-medium leading-snug">{ins.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Fare Prediction Card */}
            <div className="bg-slate-900 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-emerald-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Fare Prediction</p>
              </div>
              <p className="text-white font-black text-base mb-1 leading-snug">Tokyo flights likely to rise 18% by Oct 15.</p>
              <p className="text-slate-400 text-[11px] font-medium mb-4">Based on historical trends and seat availability data.</p>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: '72%' }} />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Price Confidence</span><span className="text-emerald-400">72%</span>
              </div>
              <button
                onClick={() => navigate('/planner', { state: { destInput: 'Tokyo' } })}
                className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
              >
                Plan Now <ArrowRight size={12} />
              </button>
            </div>

            {/* Notification preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Plane size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Latest Alert</p>
                <p className="text-xs font-semibold text-slate-800">Flights to Bali dropped 28% — lowest in 90 days.</p>
                <p className="text-[9px] text-slate-400 mt-1">Travista AI · 4 minutes ago</p>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PriceAlerts;
