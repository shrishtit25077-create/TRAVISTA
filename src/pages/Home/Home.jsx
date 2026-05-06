import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ArrowRight, MapPin, Star, MessageSquare, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { destinations as allDestinations } from '../../data/destinations';
import HomeHero from './HomeHero';
import { useDestinationPhotos, useWeather } from '../../hooks/useTravista';
import { useDestinationTime } from '../../hooks/useDestinationTime';
import { useLocationContext } from '../../context/LocationContext';
import WeatherTimeChip from '../../components/WeatherTimeChip';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { track } from '../../services/trackingService';
import { useRecommendations } from '../../hooks/useRecommendations';
import BudgetModal from '../../components/BudgetModal';

import { Bell } from 'lucide-react';

export const DestinationCard = ({ item, size = 'medium', layout = 'grid', reasonChip, onPlanTrip }) => {
  const navigate = useNavigate();
  const { savedPlaces, toggleSave } = useAuth();
  
  const isSaved = savedPlaces.some((p) => p.id === item.id);

  const { photoUrl, loading: photoLoading } = useDestinationPhoto(item.name);
  const { weather: destWeather, loading: weatherLoading } = useWeather(item.name);
  const { userWeather } = useLocationContext();
  const destTime = useDestinationTime(destWeather?.timezone);

  const rating = item.rating;
  const temp = destWeather?.temp ? `${destWeather.temp}°C` : '';

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertMonth, setAlertMonth] = useState('October');

  const handleClick = () => {
    if (showAlertModal) return;
    track.viewed(item.name);
    if (onPlanTrip) {
      onPlanTrip(item);
    } else {
      navigate(`/destination/${item.id}`, { state: item });
    }
  };

  const handleSetAlert = (e) => {
    e.stopPropagation();
    if (!alertPrice) return;
    try {
      const stored = localStorage.getItem('travista_alerts');
      const alerts = stored ? JSON.parse(stored) : [];
      alerts.push({
        id: Date.now(),
        destination: item.name,
        targetPrice: Number(alertPrice),
        month: alertMonth,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('travista_alerts', JSON.stringify(alerts));
      setShowAlertModal(false);
      import('react-hot-toast').then(toast => toast.default.success("Price alert set!"));
    } catch (err) {
      console.error(err);
    }
  };

  const catColors = {
    'Beach': 'bg-blue-500/80 text-blue-100',
    'Culture': 'bg-purple-500/80 text-purple-100',
    'Weekend': 'bg-teal-500/80 text-teal-100',
    'Adventure': 'bg-amber-500/80 text-amber-100',
  };
  const badgeClass = catColors[item.category] || 'bg-gray-500/80 text-gray-100';

  let containerClass = 'h-[320px]'; // hidden gems
  if (layout === 'luxury') containerClass = 'h-[500px]';
  else if (layout === 'trending' || layout === 'personalized') containerClass = 'h-[400px]';

  return (
    <>
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: 1.02, filter: 'brightness(1.05)' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`relative rounded-[1.5rem] overflow-hidden cursor-pointer group shadow-xl flex flex-col ${containerClass} bg-[#1e293b]`}
      >
        {photoLoading ? (
          <div className="absolute inset-0 shimmer z-0" />
        ) : (
          <img
            src={photoUrl}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={item.name}
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.name)}/800/600`;
            }}
          />
        )}
        {/* Gradient overlay — strong bottom shadow for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-[1] pointer-events-none" />

        {/* Top Left: Category Badge */}
        <div className="absolute top-4 left-4 z-[5] flex gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${badgeClass}`}>
            {item.category}
          </span>
        </div>

        {/* Top Right: Actions */}
        <div className="absolute top-4 right-4 z-[5] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); toggleSave(item); track.saved(item.name); }}
            className={`w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-md ${isSaved ? 'bg-red-500/90 text-white' : 'bg-black/50 text-white hover:bg-[#1D9E75]'}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#1D9E75] transition-all shadow-md"
            onClick={(e) => { e.stopPropagation(); navigate(`/map?focus=${item.id}`); }}
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-amber-500 transition-all shadow-md"
            onClick={(e) => { e.stopPropagation(); setShowAlertModal(true); }}
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

        <WeatherTimeChip
          userWeather={userWeather}
          destWeather={destWeather}
          destTime={destTime}
          isDay={destWeather?.isDay}
          loading={weatherLoading}
        />

        {/* Bottom Content */}
        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-[5]">
          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg w-fit mb-2 shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-white">{rating}</span>
            </div>
          )}

          <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-lg group-hover:text-[#1D9E75] transition-colors">
            {item.name}
          </h3>
          {reasonChip && (
            <div className="reason-chip w-fit" style={{ fontSize: '10px', background: 'rgba(29,158,117,0.2)', color: '#4ade80', padding: '3px 8px', borderRadius: '10px', marginTop: '4px' }}>
              ✦ {reasonChip}
            </div>
          )}
          <p className="text-sm font-medium text-white/75 line-clamp-1 mt-1 drop-shadow-md">
            {item.description || item.location}
          </p>
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm font-bold text-white drop-shadow-md">{item.price} <span className="text-white/60 text-xs font-normal">per person</span></p>
            {temp && (
               <p className="text-sm font-bold text-teal-300 drop-shadow-md">{temp}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAlertModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl border border-slate-100 dark:border-[#2a2a2a]"
            >
              <button onClick={() => setShowAlertModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-50 dark:bg-[#0f0f0f]">
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Bell className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Price Drop Alert</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">We'll let you know when flight prices to {item.name} match your budget.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Target Price (₹)</label>
                  <input 
                    type="number" 
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Travel Month</label>
                  <select 
                    value={alertMonth}
                    onChange={(e) => setAlertMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 outline-none text-slate-900 dark:text-white font-medium"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSetAlert}
                disabled={!alertPrice}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-4 font-bold disabled:opacity-50 transition-colors"
              >
                Set Alert
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export const DestinationSkeleton = ({ layout = 'grid' }) => {
  let containerClass = 'h-[320px]';
  if (layout === 'luxury') containerClass = 'h-[500px]';
  else if (layout === 'trending' || layout === 'personalized') containerClass = 'h-[400px]';

  return (
    <div className={`relative rounded-[1.5rem] overflow-hidden ${containerClass} bg-slate-200 dark:bg-slate-800 animate-pulse flex flex-col justify-end p-5`}>
      <div className="w-16 h-6 bg-slate-300 dark:bg-slate-700 rounded-full absolute top-4 left-4" />
      <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full absolute top-4 right-4" />
      
      <div className="space-y-3 relative z-10 w-full mt-auto">
        <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded-lg" />
        <div className="w-3/4 h-6 bg-slate-300 dark:bg-slate-700 rounded-lg" />
        <div className="w-full h-4 bg-slate-300 dark:bg-slate-700 rounded-lg" />
        <div className="flex justify-between items-center pt-2">
          <div className="w-1/3 h-5 bg-slate-300 dark:bg-slate-700 rounded-lg" />
          <div className="w-1/4 h-5 bg-slate-300 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

const SectionRow = ({ title, data, subtitle, layout, onPlanTrip }) => {
  let gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  if (layout === 'luxury') gridClass = "grid grid-cols-1 md:grid-cols-2 gap-8";
  else if (layout === 'hidden') gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          {subtitle && (
            <span className="text-[10px] font-bold bg-[#1D9E75]/20 text-[#1D9E75] px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#1D9E75]/30">
              {subtitle}
            </span>
          )}
        </div>
        <button className="text-sm font-medium text-slate-400 hover:text-[#1D9E75] transition-colors flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className={gridClass}>
        {data.map((item) => (
          <DestinationCard 
            key={item.id} 
            item={item} 
            layout={layout} 
            reasonChip={item.reason} 
            onPlanTrip={onPlanTrip}
          />
        ))}
      </div>
    </div>
  );
};

const PersonalisedSection = ({ onPlanTrip }) => {
  const { recommendations, loading, isPersonalised } = useRecommendations(
    ['Paris', 'London', 'New York'], 
    6
  );

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_,i) => <DestinationSkeleton key={i} layout="personalized" />)}
        </div>
      </div>
    );
  }

  const data = recommendations.map(rec => {
    const dest = allDestinations.find(d => d.name === rec.destination || d.name.startsWith(rec.destination));
    return dest ? { ...dest, reason: rec.reason } : null;
  }).filter(Boolean);

  if (data.length === 0) return null;

  return (
    <SectionRow 
      title="Because You Like Discovery" 
      subtitle={isPersonalised ? "✦ Personalised for you" : "Trending"} 
      data={data} 
      layout="personalized" 
      onPlanTrip={onPlanTrip}
    />
  );
};

const Home = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categoryMap = {
    "Relaxing Beach": "Beach",
    "Mountain Adventure": "Adventure",
    "Cultural History": "Culture",
    "Food Tour": "Food",
    "Weekend Getaway": "Weekend",
    "Hill Stations": "Hill",
    "Spiritual": "Spiritual",
    "Budget ₹": "Budget"
  };

  const filteredData = useMemo(() => {
    let data = allDestinations;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.category.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q)) ||
        (q === 'budget' && d.numericPrice < 50000) ||
        (q === 'luxury' && d.numericPrice > 150000)
      );
    }

    if (activeCategory !== 'All') {
      const cat = categoryMap[activeCategory];
      if (cat === 'Budget') {
        data = data.filter(d => d.numericPrice < 50000);
      } else {
        data = data.filter(d => d.category === cat);
      }
    }

    return data;
  }, [activeCategory, debouncedSearch]);

  const sections = useMemo(() => {
    if (filteredData.length === 0) return [];

    const trending = [...filteredData].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 6);
    const luxury = filteredData.filter(d => d.numericPrice > 140000).slice(0, 4);
    const gems = filteredData.filter(d => (d.popularity || 0) < 85 && d.rating >= 4.7).slice(0, 8);
    
    const result = [];
    if (trending.length > 0) result.push({ id: 'trending', title: 'Trending Now', data: trending, layout: 'trending' });
    // Personalized section is now handled by PersonalisedSection component
    if (luxury.length > 0) result.push({ id: 'luxury', title: 'Luxury Escapes', data: luxury, layout: 'luxury' });
    if (gems.length > 0) result.push({ id: 'gems', title: 'Hidden Gems', data: gems, layout: 'hidden' });

    return result;
  }, [filteredData]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="pt-8">
        <div className="max-w-7xl mx-auto px-8">
          <HomeHero 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onPlanTrip={(dest) => setSelectedDest(dest)}
          />
        </div>
      </div>

      <div className="space-y-24 pb-40">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="max-w-[1400px] mx-auto px-6 space-y-12 py-10"
            >
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4 animate-pulse mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <DestinationSkeleton key={i} layout="trending" />
                ))}
              </div>
            </motion.div>
          ) : sections.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <Navigation className="w-10 h-10 text-slate-300 transform -rotate-45" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight italic mb-2">No destinations found.</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto">Try adjusting your search or filters to explore more places.</p>
            </motion.div>
          ) : (
            sections.map((section, idx) => (
              <React.Fragment key={section.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <SectionRow 
                    title={section.title} 
                    subtitle={section.subtitle} 
                    data={section.data} 
                    layout={section.layout} 
                    onPlanTrip={(dest) => setSelectedDest(dest)}
                  />
                </motion.div>
                {section.id === 'trending' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <PersonalisedSection onPlanTrip={(dest) => setSelectedDest(dest)} />
                  </motion.div>
                )}
              </React.Fragment>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedDest && (
          <BudgetModal 
            destination={selectedDest} 
            onClose={() => setSelectedDest(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
