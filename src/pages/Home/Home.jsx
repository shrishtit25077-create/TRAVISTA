import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ChevronRight, ChevronLeft, MapPin, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchDestinations } from '../../services/api';
import { getPersonalizedData } from '../../services/recommendationEngine';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import HomeHero from './HomeHero';

export const DestinationCard = ({ item, size = 'medium' }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.03, filter: 'brightness(1.05)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-[2rem] overflow-hidden cursor-pointer group shadow-sm flex flex-col ${
        size === 'small' ? 'h-[400px] min-w-[300px]' : 'h-[500px] min-w-[380px]'
      }`}
    >
      <img 
        src={item.image} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        alt={item.name} 
      />
      {/* Bottom Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
      
      {/* Quick Actions */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white hover:text-red-500 transition-all">
          <Heart className="w-4 h-4" />
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRows = useCallback(async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    setLoading(true);
    const currentPage = isInitial ? 1 : page;

    try {
      const categories = ['Trending Now', `Because you like ${user?.interests?.[0] || 'Discovery'}`, 'Luxury Escapes', 'Hidden Gems'];
      const currentCategory = categories[(currentPage - 1) % categories.length];
      
      const rawData = await fetchDestinations(currentPage);
      const personalizedData = getPersonalizedData(rawData, user);

      const newRow = {
        id: `row-${currentPage}`,
        title: currentCategory,
        subtitle: currentCategory.includes('you like') ? 'Personalized' : null,
        data: personalizedData
      };

      setRows(prev => isInitial ? [newRow] : [...prev, newRow]);
      setPage(prev => isInitial ? 2 : prev + 1);
      
      if (currentPage >= 10) setHasMore(false);
    } catch (error) {
      console.error("Home Engine Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, user]);

  const loadMoreRef = useInfiniteScroll(loadMoreRows, hasMore);

  useEffect(() => {
    loadMoreRows(true);
  }, [user]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <HomeHero />
        
        <div className="space-y-24 pb-40">
          {rows.map((row, index) => {
            const isLast = index === rows.length - 1;
            return (
              <div key={row.id} ref={isLast ? loadMoreRef : null}>
                <SectionRow title={row.title} subtitle={row.subtitle} data={row.data} />
              </div>
            );
          })}

          {loading && (
            <div className="max-w-7xl mx-auto px-8 space-y-12 py-10 opacity-60">
              <div className="h-10 bg-slate-200 rounded-full w-1/4 animate-pulse mb-8" />
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[400px] h-[500px] bg-slate-100 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
