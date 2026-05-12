import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ChevronRight, ChevronLeft, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchDestinations } from '../../services/api';
import { getRecommendations } from '../../services/recommendationEngine';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import DestinationCard from '../../components/DestinationCard';

const SectionRow = ({ title, data, subtitle }) => {
  const scrollRef = useRef(null);

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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
            {subtitle && (
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={() => scroll('right')} className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex items-start gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-2"
      >
        {data?.map((item) => (
          <div key={item.id} className="w-[280px] shrink-0 snap-start">
            <DestinationCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Inspiration = () => {
  const { user } = useAuth() || {};
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRows = useCallback(async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    setLoading(true);
    const currentPage = isInitial ? 1 : page;

    try {
      // Use categories that match the new premium system
      const categories = ['Trending Now', 'Beach Escape', 'Luxury', 'Adventure', 'Hidden Gem'];
      const newRows = await Promise.all(
        categories.map(async (cat) => {
          try {
            const destinations = await fetchDestinations(cat);
            return {
              title: cat,
              subtitle: cat === 'Trending Now' ? 'Hot Right Now' : null,
              data: Array.isArray(destinations) ? destinations.slice(0, 8) : []
            };
          } catch (e) {
            return { title: cat, data: [] };
          }
        })
      );
      
      setRows(prev => isInitial ? newRows : [...prev, ...newRows]);
      setPage(currentPage + 1);
      setHasMore(false); // Only load one set for now to maintain performance
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    loadMoreRows(true);
  }, [loadMoreRows]);

  return (
    <div className="min-h-screen bg-[#fafaf9] pt-8 pb-32">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 space-y-16">
        
        {/* Personalized Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-600"
            >
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Recommendations</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Inspiration for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                your next journey.
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-2xl border-4 border-white shadow-sm" alt="User" />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-500 pr-4">
              Joined by <span className="text-slate-900">12k+ travelers</span>
            </p>
          </div>
        </div>

        {/* Content Rows */}
        <div className="space-y-20">
          {rows?.map((row, idx) => (
            <motion.div
              key={row.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <SectionRow {...row} />
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspiration;
