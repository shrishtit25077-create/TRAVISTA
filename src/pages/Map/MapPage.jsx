import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, Map, Play, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Masonry from 'react-masonry-css';
import ExploreCard from '../../components/Explore/ExploreCard';
import MapView from '../../components/Explore/MapView';
import CinematicView from '../../components/Explore/CinematicView';
import { exploreDestinations, CATEGORIES } from '../../data/exploreDestinations';
import { useNavigate } from 'react-router-dom';
import BudgetModal from '../../components/BudgetModal';

const SORT_OPTIONS = [
  { label: 'Trending',          key: 'trending' },
  { label: 'Highest Rated',     key: 'rating' },
  { label: 'Budget Low → High', key: 'asc' },
  { label: 'Budget High → Low', key: 'desc' },
];

const PAGE_SIZE = 8;

const STORAGE_KEY = 'travista_explore_view';

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
      active
        ? 'bg-[#1D9E75] border-[#1D9E75] text-white shadow-md shadow-[#1D9E75]/20'
        : 'bg-white border-slate-200 text-slate-600 hover:border-[#1D9E75] hover:text-[#1D9E75]'
    }`}
  >
    {label}
  </button>
);

const ViewButton = ({ icon: Icon, label, active, onClick, cinemaMode }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
      active
        ? 'bg-[#1D9E75] text-white shadow-md shadow-[#1D9E75]/25'
        : cinemaMode 
          ? 'bg-black/30 text-white/50 border border-white/10 hover:border-white/30 hover:text-white backdrop-blur-md'
          : 'bg-white text-slate-500 border border-slate-200 hover:border-[#1D9E75] hover:text-[#1D9E75]'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const MapPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState(() => localStorage.getItem(STORAGE_KEY) || 'grid');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('trending');
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedDest, setSelectedDest] = useState(null);
  const sortRef = useRef(null);

  const setViewPersist = (v) => {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...exploreDestinations];

    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      data = data.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'All') {
      if (activeCategory === 'Budget ₹') {
        data = data.filter(d => d.numericPrice < 80000);
      } else if (activeCategory === 'Trending') {
        data = data.slice(0, 12);
      } else {
        data = data.filter(d => d.category === activeCategory);
      }
    }

    if (sort === 'asc') data.sort((a, b) => a.numericPrice - b.numericPrice);
    else if (sort === 'desc') data.sort((a, b) => b.numericPrice - a.numericPrice);
    else if (sort === 'rating') data.sort((a, b) => b.id - a.id);

    return data;
  }, [activeCategory, filterSearch, sort]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  const handleGlobeViewGrid = (dest) => {
    setViewPersist('grid');
    setFilterSearch(dest.name);
  };

  const breakpointCols = { default: 3, 1100: 2, 640: 1 };

  const isCinema = view === 'cinema';

  return (
    <div className={`flex flex-col h-full min-h-screen transition-colors duration-500 ${isCinema ? 'bg-black' : 'bg-[#F8FAFC]'}`}>
      {/* ── Top Bar ── */}
      <div className={`sticky top-0 z-[60] transition-all duration-500 border-b ${isCinema ? 'bg-black/40 backdrop-blur-xl border-white/10' : 'bg-white/90 backdrop-blur-lg border-slate-100'} px-8 py-4`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className={`text-2xl font-black tracking-tight transition-colors ${isCinema ? 'text-white' : 'text-slate-900'}`}>
            Explore <span className="text-[#1D9E75]">Destinations</span>
          </h1>

          {/* View toggles */}
          <div className="flex items-center gap-2">
            <ViewButton icon={Grid3X3} label="Grid"  active={view === 'grid'}  onClick={() => setViewPersist('grid')} cinemaMode={isCinema} />
            <ViewButton icon={Map}      label="Map"   active={view === 'map'}   onClick={() => setViewPersist('map')} cinemaMode={isCinema} />
            <ViewButton icon={Play}    label="✦ Cinema" active={view === 'cinema'} onClick={() => setViewPersist('cinema')} cinemaMode={isCinema} />
          </div>
        </div>

        {/* Filter chips (hidden in Cinema mode as CinemaView has its own) */}
        {!isCinema && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <FilterChip
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className={`flex-1 ${isCinema ? 'p-0' : 'px-8 py-6'}`}>
        <AnimatePresence mode="wait">

          {/* ── GRID VIEW ── */}
          {view === 'grid' && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Search + Sort */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={filterSearch}
                    onChange={e => { setFilterSearch(e.target.value); setPage(1); }}
                    placeholder="Search destinations..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#1D9E75] transition-colors shadow-sm"
                  />
                </div>

                {/* Sort dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setShowSort(v => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-[#1D9E75] transition-colors shadow-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {SORT_OPTIONS.find(s => s.key === sort)?.label}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {showSort && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => { setSort(opt.key); setShowSort(false); setPage(1); }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            sort === opt.key ? 'bg-[#1D9E75]/10 text-[#1D9E75] font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-24 text-slate-400">
                  <p className="text-2xl font-black mb-2">No destinations found</p>
                  <p>Try a different filter or search term</p>
                </div>
              ) : (
                <>
                  <Masonry
                    breakpointCols={breakpointCols}
                    className="flex gap-5 w-full"
                    columnClassName="masonry-column"
                  >
                    {paginated.map((dest, i) => (
                      <ExploreCard 
                        key={dest.id} 
                        dest={dest} 
                        priority={i < 3} 
                        onPlanTrip={(d) => setSelectedDest(d)}
                      />
                    ))}
                  </Masonry>

                  {/* Load more */}
                  {paginated.length < filtered.length && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all shadow-sm"
                      >
                        Load More ({filtered.length - paginated.length} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── MAP VIEW ── */}
          {view === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-[calc(100vh-220px)] min-h-[500px]"
            >
              <MapView 
                destinations={exploreDestinations} 
                onPlanTrip={(d) => setSelectedDest(d)}
              />
            </motion.div>
          )}

          {/* ── CINEMA VIEW ── */}
          {view === 'cinema' && (
            <motion.div key="cinema" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 pt-[73px] z-50 bg-black"
            >
              <CinematicView 
                destinations={exploreDestinations} 
                onPlanTrip={(d) => setSelectedDest(d)}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                categories={CATEGORIES}
              />
            </motion.div>
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

export default MapPage;
