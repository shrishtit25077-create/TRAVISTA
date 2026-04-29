import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ChevronRight, ChevronLeft, MapPin, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { destinations as allDestinations } from '../../data/destinations';
import HomeHero from './HomeHero';

export const DestinationCard = ({ item, size = 'medium' }) => {
  const navigate = useNavigate();
  const { savedPlaces, toggleSave } = useAuth();
  
  const isSaved = savedPlaces.some((p) => p.id === item.id);

  const handleClick = (destination) => {
    navigate(`/destination/${destination.id}`, { state: destination });
  };

  return (
    <motion.div
      onClick={() => handleClick(item)}
      whileHover={{ scale: 1.03, filter: 'brightness(1.05)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-[2rem] overflow-hidden cursor-pointer group shadow-sm flex flex-col ${size === 'small' ? 'h-[400px] min-w-[300px]' : 'h-[500px] min-w-[380px]'
        }`}
    >
      <img
        src={item.image}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        alt={item.name}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />

      <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSave(item); }}
          className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center border transition-all ${isSaved ? 'bg-red-500 text-white border-red-500' : 'bg-white/20 text-white border-white/10 hover:bg-white hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <button
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white hover:text-green-500 transition-all"
          onClick={(e) => { e.stopPropagation(); navigate(`/map?focus=${item.id}`); }}
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black uppercase text-green-400 tracking-[0.3em]">{item.category}</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-white/90">{item.rating}</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-green-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-sm font-bold text-white/50">{item.price}</p>
        </div>
      </div>
    </motion.div>
  );
};

const SectionRow = ({ title, data, subtitle }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -current.offsetWidth * 0.8 : current.offsetWidth * 0.8;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{title}</h2>
            {subtitle && (
              <span className="text-[10px] font-black bg-green-100 text-green-600 px-3 py-1 rounded-full uppercase tracking-widest">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-green-600 transition-colors flex items-center gap-2">
            View all <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
      >
        {data.map((item) => (
          <div key={item.id} className="snap-start">
            <DestinationCard item={item} size={title === 'Luxury Escapes' ? 'large' : title === 'Hidden Gems' ? 'small' : 'medium'} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

    // Search Filter
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

    // Category Filter
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

    const trending = [...filteredData].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 8);
    const luxury = filteredData.filter(d => d.numericPrice > 140000).slice(0, 8);
    const gems = filteredData.filter(d => (d.popularity || 0) < 85 && d.rating >= 4.7).slice(0, 8);
    
    // Personalized Logic
    const interests = user?.preferences?.interests || ['beach', 'culture'];
    const personalized = filteredData.filter(d => 
      d.tags?.some(t => interests.includes(t)) || 
      interests.includes(d.type)
    ).slice(0, 8);

    const result = [];
    if (trending.length > 0) result.push({ id: 'trending', title: 'Trending Now', data: trending });
    if (personalized.length > 0) result.push({ id: 'personalized', title: `Because you like Discovery`, subtitle: 'Personalized', data: personalized });
    if (luxury.length > 0) result.push({ id: 'luxury', title: 'Luxury Escapes', data: luxury });
    if (gems.length > 0) result.push({ id: 'gems', title: 'Hidden Gems', data: gems });

    return result;
  }, [filteredData, user]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <HomeHero 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="space-y-24 pb-40">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="max-w-7xl mx-auto px-8 space-y-12 py-10"
              >
                <div className="h-10 bg-slate-200 rounded-full w-1/4 animate-pulse mb-8" />
                <div className="flex gap-6 overflow-hidden">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="min-w-[400px] h-[500px] bg-slate-100 rounded-[2.5rem] animate-pulse" />
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
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Navigation className="w-10 h-10 text-slate-300 transform -rotate-45" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight italic mb-2">No destinations found.</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">Try adjusting your search or filters to explore more places.</p>
              </motion.div>
            ) : (
              sections.map((section) => (
                <motion.div 
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <SectionRow title={section.title} subtitle={section.subtitle} data={section.data} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Home;
