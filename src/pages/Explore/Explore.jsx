import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Map as MapIcon, ChevronDown } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchDestinations } from '../../services/api';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { DestinationCard, DestinationSkeleton } from '../Home/Home';
import BudgetModal from '../../components/BudgetModal';

const FilterChip = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all ${
      active 
        ? 'bg-gray-900 border-gray-900 text-white' 
        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-900'
    }`}
  >
    {label}
  </button>
);

const Explore = () => {
  const { searchTerm } = useOutletContext();
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('Recommended');
  const [selectedDest, setSelectedDest] = useState(null);

  const categories = ['All', 'Beach', 'Mountain', 'Luxury', 'Culture', 'Adventure', 'Food'];

  const loadItems = useCallback(async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    setLoading(true);
    const currentPage = isInitial ? 1 : page;

    try {
      const rawData = await fetchDestinations(currentPage);
      setItems(prev => isInitial ? rawData : [...prev, ...rawData]);
      setPage(prev => isInitial ? 2 : prev + 1);
      if (currentPage >= 12) setHasMore(false);
    } catch (error) {
      console.error("Explore Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const loadMoreRef = useInfiniteScroll(loadItems, hasMore);

  useEffect(() => {
    loadItems(true);
  }, [activeCategory]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchTerm) {
      result = result.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeCategory !== 'All') {
      result = result.filter(d => d.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    return result;
  }, [items, searchTerm, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-8 space-y-12 pb-40">
      
      {/* Search & Filter Header */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Explore <span className="text-emerald-500">Stays</span></h1>
            <p className="text-gray-400 font-medium text-sm">Found {filteredItems.length} destinations for your search.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-gray-900 hover:border-gray-200 transition-all">
              Sort: {sortBy} <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 items-center">
          <button className="flex items-center gap-2 px-5 py-2 bg-gray-50 border border-gray-100 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          {categories.map(cat => (
            <FilterChip 
              key={cat} 
              label={cat} 
              active={activeCategory === cat} 
              onClick={() => setActiveCategory(cat)} 
            />
          ))}
        </div>
      </div>

      {/* Results Grid - Restored to Image Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item, idx) => (
          <DestinationCard 
            key={`${item.id}-${idx}`} 
            item={item} 
            size="small" 
            onPlanTrip={(dest) => setSelectedDest(dest)}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="pt-10">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <DestinationSkeleton key={i} size="small" />
            ))}
          </div>
        )}
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

export default Explore;
