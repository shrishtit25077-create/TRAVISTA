import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, MapPin, Star, CloudSun, Clock, Globe, Shield, Wifi, Calendar, Wallet, Navigation, Camera, Utensils, Music, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { track } from '../../services/trackingService';

export default function DestinationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { savedPlaces, toggleSave } = useAuth();
  
  // Accept state passed via router, or fallback to undefined
  const data = location.state;
  const { photoUrl, loading: photoLoading } = useDestinationPhoto(data?.name);

  useEffect(() => {
    if (data) {
      const start = Date.now();
      return () => track.timeSpent(data.name, Math.floor((Date.now() - start) / 1000));
    }
  }, [data]);

  // Safe fallback if accessed directly without state
  if (!data) {
    return (
      <div className="min-h-screen bg-[#fafaf9] dark:bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/20 dark:shadow-none">
          <MapPin className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Destination Not Found</h1>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">We couldn't load the details for this destination. Let's find somewhere else to explore.</p>
        <button 
          onClick={() => navigate('/explore')}
          className="px-8 py-4 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white rounded-full font-black uppercase tracking-widest text-[11px] transition-all"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  const isSaved = savedPlaces?.some(p => p.id === data.id);
  const cityName = data.name?.split(',')[0] || "This destination";
  const countryName = data.country || data.name?.split(',')[1]?.trim() || "";

  // Mock data for the immersive sections based on destination
  const attractions = [
    { title: "Historic Old Town", desc: "Wander through centuries of history.", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80", rating: 4.8 },
    { title: "Coastal Views", desc: "Breathtaking panoramic sunset spots.", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80", rating: 4.9 },
    { title: "Cultural Museum", desc: "Discover ancient artifacts and art.", img: "https://images.unsplash.com/photo-1518998053401-b4391cb169cd?w=800&q=80", rating: 4.6 }
  ];

  const gallery = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    "https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?w=800&q=80",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80"
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950 font-sans selection:bg-emerald-500/30">
      
      {/* ─── SECTION 1: CINEMATIC HERO ────────────────────────────────────── */}
      <div className="relative h-[85vh] w-full overflow-hidden group">
        <div className="absolute inset-0 bg-slate-900">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={photoUrl || data.image} 
            className="w-full h-full object-cover opacity-80"
            alt={data.name}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-20">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => toggleSave(data)} className={`w-12 h-12 rounded-full backdrop-blur-md border transition-colors flex items-center justify-center ${isSaved ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-rose-500 hover:border-white'}`}>
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 z-20 flex flex-col justify-end h-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {data.category || "Premium Destination"}
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-300" /> {data.rating || 4.8}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-4">
              {cityName}
            </h1>
            {countryName && (
              <p className="text-xl md:text-2xl font-light text-white/80 tracking-wide mb-8 italic">
                {data.tagline || `Experience the magic of ${countryName}.`}
              </p>
            )}

            {/* Floating Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-4 pt-8 border-t border-white/20">
              <div className="text-white">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">Avg Budget</p>
                <p className="text-lg md:text-xl font-black">{data.price || "₹80k"}</p>
              </div>
              <div className="text-white">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">Ideal Duration</p>
                <p className="text-lg md:text-xl font-black">5 - 7 Days</p>
              </div>
              <div className="text-white">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">Best Season</p>
                <p className="text-lg md:text-xl font-black">{data.weather || "Autumn"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24 space-y-24 md:space-y-32">
        
        {/* ─── SECTION 2: DESTINATION OVERVIEW ──────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              A journey unlike any other.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {data.description || `${cityName} offers an unparalleled blend of vibrant culture, stunning landscapes, and unforgettable experiences. Whether you are seeking profound spiritual calm or heart-racing adventure, this destination promises to captivate your soul and leave you breathless.`}
            </p>
            <div className="flex flex-wrap gap-2 pt-4">
              {(data.tags || ["luxury", "culture", "scenic"]).map(tag => (
                <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <img src={gallery[0]} className="w-full h-64 object-cover rounded-[2rem] rounded-tr-none shadow-xl" alt="" />
            <img src={gallery[1]} className="w-full h-64 object-cover rounded-[2rem] rounded-bl-none shadow-xl mt-8" alt="" />
          </div>
        </section>

        {/* ─── SECTION 3: QUICK TRAVEL INFO ─────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Globe, label: "Language", value: "English, Local" },
              { icon: Wallet, label: "Currency", value: data.currency || "USD" },
              { icon: CloudSun, label: "Weather", value: "24°C Average" },
              { icon: Shield, label: "Safety", value: "High Rating" },
              { icon: Wifi, label: "Internet", value: "Fast & Available" },
              { icon: Clock, label: "Time Zone", value: "GMT+5:30" },
              { icon: Calendar, label: "Best Time", value: "Oct - March" },
              { icon: Map, label: "Visa", value: "On Arrival" }
            ].map((info, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] flex flex-col gap-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                  <info.icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{info.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 4: TOP ATTRACTIONS ───────────────────────────────────── */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Must-Visit Spots</h2>
              <p className="text-slate-500 font-medium mt-2">Curated highlights you simply cannot miss.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {attractions.map((attr, i) => (
              <div key={i} className="group relative h-96 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                <img src={attr.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-1 mb-2 bg-black/40 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-white/20">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-white">{attr.rating}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{attr.title}</h3>
                  <p className="text-sm text-white/80 font-medium line-clamp-2">{attr.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 5 & 6: EXPERIENCES & FOOD ─────────────────────────────── */}
        <section className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <Camera size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Curated Experiences</h2>
              <p className="text-slate-400 leading-relaxed font-medium">From sunset cruises to hidden mountain trails, we've cataloged the most breathtaking activities to elevate your trip from ordinary to unforgettable.</p>
              <ul className="space-y-4">
                {['Local Guided Tours', 'Sunset Viewpoints', 'Historic Walks', 'Nightlife & Bars'].map(item => (
                  <li key={item} className="flex items-center gap-3 font-bold text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
                <Utensils size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Food & Culture</h2>
              <p className="text-slate-400 leading-relaxed font-medium">Taste the soul of {cityName}. Discover bustling street food markets, hidden local cafes, and Michelin-starred dining experiences that define the regional palette.</p>
              <ul className="space-y-4">
                {['Authentic Street Food', 'Fine Dining', 'Local Cafes', 'Traditional Markets'].map(item => (
                  <li key={item} className="flex items-center gap-3 font-bold text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── SECTION 8: PHOTO GALLERY ─────────────────────────────────────── */}
        <section className="space-y-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight text-center">Visual Story</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
            <div className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden group relative">
              <img src={gallery[2]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="rounded-[2rem] overflow-hidden group relative">
              <img src={gallery[3]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
            <div className="rounded-[2rem] overflow-hidden group relative">
              <img src={gallery[4]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
            <div className="col-span-2 rounded-[2rem] overflow-hidden group relative">
              <img src={gallery[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
          </div>
        </section>

        {/* ─── SECTION 10: AI TRIP PLANNER CTA ──────────────────────────────── */}
        <section className="pt-12">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/20">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/30 shadow-xl">
                <Navigation size={28} className="transform -rotate-45" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Ready to experience {cityName} your way?
              </h2>
              
              <p className="text-lg text-emerald-50 font-medium">
                Let Travista AI instantly design a personalized, day-by-day itinerary perfectly matched to your budget, travel style, and duration.
              </p>
              
              <button 
                onClick={() => navigate('/planner', { state: { destInput: data.name } })}
                className="mt-4 px-10 py-5 bg-slate-900 hover:bg-black text-white rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-2xl flex items-center gap-3 group active:scale-[0.98]"
              >
                Design My AI Trip
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
