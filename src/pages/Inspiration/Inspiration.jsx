import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ChevronRight, ChevronLeft, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchDestinations } from '../../services/api';
import { getPersonalizedData } from '../../services/recommendationEngine';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const SectionRow = ({ title, data, subtitle }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
            {subtitle && (
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-2"
      >
        {data.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -10 }}
            className="min-w-[320px] md:min-w-[400px] h-[520px] bg-white rounded-[2.5rem] border border-gray-100 shadow-soft overflow-hidden group snap-start cursor-pointer relative"
          >
            <img src={item.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Overlay Actions */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform duration-500">
              <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-red-500 transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-emerald-500 transition-all" onClick={() => navigate('/map')}>
                <MapPin className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-cyan-500 transition-all" onClick={() => navigate('/ai-architect')}>
                <Zap className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-2">{item.category}</span>
              <h3 className="text-3xl font-black tracking-tight leading-tight mb-2">{item.name}</h3>
              <div className="flex items-center gap-4 text-white/60">
                <span className="text-sm font-bold">{item.price}</span>
                <span className="text-sm font-bold">★ {item.rating}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Inspiration = () => {
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
      // Simulate API fetch with categories
      const categories = ['Trending Now', 'Because you like Beaches', 'Luxury Escapes', 'Budget Trips', 'Hidden Gems'];
      const currentCategory = categories[(currentPage - 1) % categories.length];
      
      const rawData = await fetchDestinations(currentPage);
      const personalizedData = getPersonalizedData(rawData, user);

      const newRow = {
        id: `row-${currentPage}`,
        title: currentCategory,
        subtitle: currentCategory.includes('you like') ? 'Based on your interest' : null,
        data: personalizedData
      };

      setRows(prev => isInitial ? [newRow] : [...prev, newRow]);
      setPage(prev => isInitial ? 2 : prev + 1);
      
      if (currentPage >= 10) setHasMore(false);
    } catch (error) {
      console.error("Inspiration Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, user]);

  const loadMoreRef = useInfiniteScroll(loadMoreRows, hasMore);

  useEffect(() => {
    loadMoreRows(true);
  }, [user]);

  return (
    <div className="space-y-24 pb-40">
      {/* Dynamic Rows */}
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        return (
          <div key={row.id} ref={isLast ? loadMoreRef : null}>
            <SectionRow title={row.title} subtitle={row.subtitle} data={row.data} />
          </div>
        );
      })}

      {loading && (
        <div className="space-y-12 px-2">
          <div className="h-8 bg-gray-100 rounded-full w-48 animate-pulse mb-6" />
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[400px] h-[520px] bg-white border border-gray-100 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspiration;
