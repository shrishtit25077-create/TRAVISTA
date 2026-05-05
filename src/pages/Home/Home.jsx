import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ArrowRight, MapPin, Star, MessageSquare, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { destinations as allDestinations } from '../../data/destinations';
import HomeHero from './HomeHero';
import { useDestinationPhotos, usePlace, useWeather } from '../../hooks/useTravista';
import { useDestinationTime } from '../../hooks/useDestinationTime';
import { useLocationContext } from '../../context/LocationContext';
import WeatherTimeChip from '../../components/WeatherTimeChip';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { track } from '../../services/trackingService';
import { useRecommendations } from '../../hooks/useRecommendations';
import BudgetModal from '../../components/BudgetModal';

export const DestinationCard = ({ item, size = 'medium', layout = 'grid', reasonChip, onPlanTrip }) => {
  const navigate = useNavigate();
  const { savedPlaces, toggleSave } = useAuth();
  
  const isSaved = savedPlaces.some((p) => p.id === item.id);

  const { photoUrl, loading: photoLoading } = useDestinationPhoto(item.name);
  const { place } = usePlace(item.name);
  const { weather: destWeather, loading: weatherLoading } = useWeather(item.name);
  const { userWeather } = useLocationContext();
  const destTime = useDestinationTime(destWeather?.timezone);

  const rating = place?.rating || item.rating;
  const temp = destWeather?.temp ? `${destWeather.temp}°C` : '';


  const handleClick = () => {
    track.viewed(item.name);
    if (onPlanTrip) {
      onPlanTrip(item);
    } else {
      navigate(`/destination/${item.id}`, { state: item });
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 z-[1]" />

      {/* Top Left: Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${badgeClass} relative z-[2]`}>
          {item.category}
        </span>
      </div>

      {/* Top Right: Actions */}
      <div className="absolute top-4 right-4 z-[10] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300 relative z-[2]">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSave(item); track.saved(item.name); }}
          className={`w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-red-500/90 text-white' : 'bg-black/40 text-white hover:bg-[#1D9E75]'}`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <button
          className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#1D9E75] transition-all"
          onClick={(e) => { e.stopPropagation(); navigate(`/map?focus=${item.id}`); }}
        >
          <MapPin className="w-4 h-4" />
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
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-[10] relative z-[2]">
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg w-fit mb-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-white">{rating}</span>
          </div>
        )}

        <h3 className="text-xl font-bold text-white tracking-wide group-hover:text-[#1D9E75] transition-colors">
          {item.name}
        </h3>
        {reasonChip && (
          <div className="reason-chip w-fit" style={{ fontSize: '10px', background: 'rgba(29,158,117,0.15)', color: '#1D9E75', padding: '3px 8px', borderRadius: '10px', marginTop: '4px' }}>
            ✦ {reasonChip}
          </div>
        )}
        <p className="text-sm font-medium text-white/70 line-clamp-1 mt-1">
          {item.description || item.location}
        </p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm font-bold text-white">{item.price} <span className="text-white/50 text-xs font-normal">per person</span></p>
          {temp && (
             <p className="text-sm font-bold text-teal-300">{temp}</p>
          )}
        </div>
      </div>
    </motion.div>
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
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
};const PersonalisedSection = ({ onPlanTrip }) => {
  const { recommendations, loading, isPersonalised } = useRecommendations(
    ['Paris', 'London', 'New York'], // exclude trending section dests
    6
  );

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 space-y-6">
        <div className="h-8 bg-slate-200 rounded-full w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_,i) => <div key={i} className="h-[400px] bg-slate-100 rounded-[1.5rem] shimmer" />)}
        </div>
      </div>
    );
  }

  // Map recommendation objects back to destination data
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
    <div className="bg-[#F8FAFC] min-h-screen">
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
              <div className="h-10 bg-slate-200 rounded-full w-1/4 animate-pulse mb-8" />
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[400px] h-[400px] bg-slate-100 rounded-[1.5rem] animate-pulse" />
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
