import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, MapPin, Star, CloudSun, Clock, Globe, Shield, Wifi, Calendar, Wallet, Navigation, Camera, Utensils, Map as MapIcon } from 'lucide-react';
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Destination Not Found</h1>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">We couldn't load the details for this destination. Let's find somewhere else to explore.</p>
        <button 
          onClick={() => navigate('/explore')}
          className="px-8 py-3.5 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-md"
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 font-sans selection:bg-emerald-500/30">
      
      {/* ─── SECTION 1: CINEMATIC HERO ────────────────────────────────────── */}
      {/* Reduced height from h-[85vh] to a tighter, cinematic banner height */}
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] w-full overflow-hidden group">
        <div className="absolute inset-0 bg-slate-900">
          <motion.img 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={photoUrl || data.image} 
            className="w-full h-full object-cover opacity-90"
            alt={data.name}
          />
        </div>
        {/* Softer gradient for better text readability and premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => toggleSave(data)} className={`w-10 h-10 rounded-full backdrop-blur-md border transition-colors flex items-center justify-center ${isSaved ? 'bg-rose-500 border-rose-500 text-white' : 'bg-black/20 border-white/20 text-white hover:bg-white hover:text-rose-500 hover:border-white'}`}>
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hero Content - Tighter padding and margins */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 flex flex-col justify-end">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                  {data.category || "Premium"}
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-bold text-sm bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-300" /> {data.rating || 4.8}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1] mb-2">
                {cityName}
              </h1>
              {countryName && (
                <p className="text-lg md:text-xl font-medium text-white/90 tracking-wide">
                  {data.tagline || `Experience the magic of ${countryName}.`}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Container - Tighter width and section gaps */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-16 space-y-16 md:space-y-20">
        
        {/* ─── SECTION 2: DESTINATION OVERVIEW ──────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-5 space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              A journey unlike any other.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {data.description || `${cityName} offers an unparalleled blend of vibrant culture, stunning landscapes, and unforgettable experiences. Whether you are seeking profound spiritual calm or heart-racing adventure, this destination promises to captivate your soul and leave you breathless.`}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {(data.tags || ["luxury", "culture", "scenic"]).map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-semibold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <img src={gallery[0]} className="w-full h-56 md:h-64 object-cover rounded-2xl rounded-tr-none shadow-sm" alt="" />
            <img src={gallery[1]} className="w-full h-56 md:h-64 object-cover rounded-2xl rounded-bl-none shadow-sm mt-6 md:mt-8" alt="" />
          </div>
        </section>

        {/* ─── SECTION 3: QUICK TRAVEL INFO ─────────────────────────────────── */}
        <section>
          {/* Tighter grid gap and crisp, high-contrast cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Globe, label: "Language", value: "English, Local" },
              { icon: Wallet, label: "Currency", value: data.currency || "USD" },
              { icon: CloudSun, label: "Weather", value: "24°C Average" },
              { icon: Shield, label: "Safety", value: "High Rating" },
              { icon: Wifi, label: "Internet", value: "Fast & Available" },
              { icon: Clock, label: "Time Zone", value: "GMT+5:30" },
              { icon: Calendar, label: "Best Time", value: "Oct - March" },
              { icon: MapIcon, label: "Visa", value: "On Arrival" }
            ].map((info, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <info.icon size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{info.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 4: TOP ATTRACTIONS ───────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Must-Visit Spots</h2>
            <p className="text-slate-500 font-normal text-sm mt-1">Curated highlights you simply cannot miss.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {attractions.map((attr, i) => (
              <div key={i} className="group relative h-72 md:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
                <img src={attr.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                {/* Improved overlay contrast for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 mb-2 bg-black/30 backdrop-blur-md w-fit px-2.5 py-1 rounded-full border border-white/20">
                    <Star size={10} className="fill-white text-white" />
                    <span className="text-[11px] font-bold text-white">{attr.rating}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1.5 leading-tight">{attr.title}</h3>
                  <p className="text-xs text-white/80 font-normal line-clamp-2">{attr.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 5 & 6: EXPERIENCES & FOOD ─────────────────────────────── */}
        {/* Tighter padding, smaller border-radius, more balanced scale */}
        <section className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 md:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner">
                <Camera size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Curated Experiences</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-normal">From sunset cruises to hidden mountain trails, we've cataloged the most breathtaking activities to elevate your trip from ordinary to unforgettable.</p>
              </div>
              <ul className="space-y-3">
                {['Local Guided Tours', 'Sunset Viewpoints', 'Historic Walks', 'Nightlife & Bars'].map(item => (
                  <li key={item} className="flex items-center gap-3 font-medium text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner">
                <Utensils size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Food & Culture</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-normal">Taste the soul of {cityName}. Discover bustling street food markets, hidden local cafes, and Michelin-starred dining experiences that define the regional palette.</p>
              </div>
              <ul className="space-y-3">
                {['Authentic Street Food', 'Fine Dining', 'Local Cafes', 'Traditional Markets'].map(item => (
                  <li key={item} className="flex items-center gap-3 font-medium text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── SECTION 8: PHOTO GALLERY ─────────────────────────────────────── */}
        <section className="space-y-6 md:space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center">Visual Story</h2>
          {/* Reduced height for better viewport composition */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 h-[350px] md:h-[400px]">
            <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden group relative bg-slate-100">
              <img src={gallery[2]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            <div className="rounded-2xl overflow-hidden group relative bg-slate-100">
              <img src={gallery[3]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
            <div className="rounded-2xl overflow-hidden group relative bg-slate-100">
              <img src={gallery[4]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
            <div className="col-span-2 rounded-2xl overflow-hidden group relative bg-slate-100">
              <img src={gallery[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
          </div>
        </section>

        {/* ─── SECTION 10: AI TRIP PLANNER CTA ──────────────────────────────── */}
        <section className="pt-8 pb-12">
          {/* Compact premium banner layout */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl border border-slate-800">
            {/* Subtle glow instead of giant colorful gradient */}
            <div className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-radial from-emerald-500/20 to-transparent -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
            
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20 mb-6 shadow-sm">
                <Navigation size={20} className="transform -rotate-45" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
                Experience {cityName} your way.
              </h2>
              
              <p className="text-sm text-slate-300 font-normal mb-8 leading-relaxed">
                Let Travista AI instantly design a personalized, day-by-day itinerary perfectly matched to your budget, travel style, and duration.
              </p>
              
              <button 
                onClick={() => navigate('/planner', { state: { destInput: data.name } })}
                className="px-8 py-3.5 bg-white text-slate-900 hover:bg-slate-50 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-lg flex items-center gap-2.5 group active:scale-[0.98]"
              >
                Design My Trip
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
