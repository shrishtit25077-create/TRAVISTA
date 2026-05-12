import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Heart, MapPin, Sparkles, Navigation, CloudRain, Sun, Wind, CloudSnow, Flame, TreePine, Loader2, TrendingDown, ArrowRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BudgetModal from '../../components/BudgetModal';

// ─── Massive Curated Premium Data ──────────────────────────────────────────
const CURATED_DESTINATIONS = [
  { id: '1', name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop', category: 'Romantic Escapes', price: 85000, rating: 4.9, tagline: 'City of light, love, and endless romance.', weather: 'Autumn vibes' },
  { id: '2', name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop', category: 'Cultural Experiences', price: 92000, rating: 4.8, tagline: 'Ancient temples and blooming cherry blossoms.', weather: 'Sunny' },
  { id: '3', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2076&auto=format&fit=crop', category: 'Tropical Escapes', price: 45000, rating: 4.7, tagline: 'Lush jungles and serene spiritual retreats.', weather: 'Tropical' },
  { id: '4', name: 'Zermatt', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070&auto=format&fit=crop', category: 'Luxury Winter', price: 150000, rating: 4.9, tagline: 'World-class skiing under the Matterhorn.', weather: 'Snow' },
  { id: '5', name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop', category: 'Romantic Escapes', price: 110000, rating: 4.8, tagline: 'Breathtaking sunsets over the Aegean Sea.', weather: 'Sunny' },
  { id: '6', name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop', category: 'Luxury Urban', price: 80000, rating: 4.6, tagline: 'Futuristic architecture and desert luxury.', weather: 'Sunny' },
  { id: '7', name: 'Reykjavik', country: 'Iceland', image: 'https://images.unsplash.com/photo-1520612196627-772844d18ec9?q=80&w=2070&auto=format&fit=crop', category: 'Adventure Trips', price: 130000, rating: 4.9, tagline: 'Northern lights and dramatic landscapes.', weather: 'Cold' },
  { id: '8', name: 'Goa', country: 'India', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1974&auto=format&fit=crop', category: 'Beach Destinations', price: 25000, rating: 4.5, tagline: 'Vibrant nightlife and pristine coastlines.', weather: 'Tropical' },
  { id: '9', name: 'Machu Picchu', country: 'Peru', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2070&auto=format&fit=crop', category: 'Hidden Gems', price: 145000, rating: 4.9, tagline: 'The lost city of the Incas high in the Andes.', weather: 'Cold' },
  { id: '10', name: 'Amalfi Coast', country: 'Italy', image: 'https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?q=80&w=2071&auto=format&fit=crop', category: 'Luxury Escapes', price: 125000, rating: 4.8, tagline: 'Cliffside colorful villages and lemons.', weather: 'Sunny' },
  { id: '11', name: 'Banff', country: 'Canada', image: 'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?q=80&w=2071&auto=format&fit=crop', category: 'Mountain Retreats', price: 95000, rating: 4.8, tagline: 'Turquoise glacial lakes and alpine peaks.', weather: 'Cold' },
  { id: '12', name: 'Seoul', country: 'South Korea', image: 'https://images.unsplash.com/photo-1538669715315-05ad0419213d?q=80&w=2070&auto=format&fit=crop', category: 'Trending Now', price: 85000, rating: 4.7, tagline: 'A mesmerizing blend of pop culture and tradition.', weather: 'Autumn vibes' },
  { id: '13', name: 'Venice', country: 'Italy', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=2070&auto=format&fit=crop', category: 'Romantic Escapes', price: 120000, rating: 4.8, tagline: 'Gondola rides through historic canal streets.', weather: 'Sunny' },
  { id: '14', name: 'Cappadocia', country: 'Turkey', image: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?q=80&w=2070&auto=format&fit=crop', category: 'Adventure Trips', price: 65000, rating: 4.9, tagline: 'Hot air balloons over fairy chimneys.', weather: 'Sunny' },
  { id: '15', name: 'Maldives', country: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2065&auto=format&fit=crop', category: 'Luxury Escapes', price: 250000, rating: 4.9, tagline: 'Overwater bungalows and crystal clear reefs.', weather: 'Tropical' },
  { id: '16', name: 'Phuket', country: 'Thailand', image: 'https://images.unsplash.com/photo-1589394815804-964ce0ff96c7?q=80&w=2070&auto=format&fit=crop', category: 'Beach Destinations', price: 35000, rating: 4.6, tagline: 'Limestone cliffs and emerald waters.', weather: 'Tropical' },
  { id: '17', name: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop', category: 'Cultural Experiences', price: 55000, rating: 4.7, tagline: 'Where East meets West in historic grandeur.', weather: 'Autumn vibes' },
  { id: '18', name: 'Prague', country: 'Czechia', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=2070&auto=format&fit=crop', category: 'Romantic Escapes', price: 75000, rating: 4.8, tagline: 'A fairytale city of spires and cobblestones.', weather: 'Cold' },
  { id: '19', name: 'Vienna', country: 'Austria', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2072&auto=format&fit=crop', category: 'Cultural Experiences', price: 85000, rating: 4.8, tagline: 'Imperial palaces and classical music heritage.', weather: 'Cold' },
  { id: '20', name: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1583307842306-f6d3d9ce453e?q=80&w=2072&auto=format&fit=crop', category: 'Trending Now', price: 40000, rating: 4.7, tagline: 'Bustling street markets and golden temples.', weather: 'Tropical' },
  { id: '21', name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77ef244?q=80&w=2070&auto=format&fit=crop', category: 'Trending Now', price: 90000, rating: 4.8, tagline: 'Gaudí architecture and Mediterranean beaches.', weather: 'Sunny' },
  { id: '22', name: 'Petra', country: 'Jordan', image: 'https://images.unsplash.com/photo-1501230491752-92a106b539fb?q=80&w=2070&auto=format&fit=crop', category: 'Hidden Gems', price: 110000, rating: 4.9, tagline: 'The ancient rose-red city carved into stone.', weather: 'Sunny' },
  { id: '23', name: 'Lapland', country: 'Finland', image: 'https://images.unsplash.com/photo-1513083839250-713e2f9d1d1f?q=80&w=2070&auto=format&fit=crop', category: 'Winter Wonderland', price: 140000, rating: 4.9, tagline: 'Reindeer safaris and Santa’s winter village.', weather: 'Snow' },
  { id: '24', name: 'Marrakech', country: 'Morocco', image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2071&auto=format&fit=crop', category: 'Cultural Experiences', price: 70000, rating: 4.7, tagline: 'Bustling souks and stunning riads.', weather: 'Sunny' },
  { id: '25', name: 'Cairo', country: 'Egypt', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=2070&auto=format&fit=crop', category: 'Adventure Trips', price: 60000, rating: 4.6, tagline: 'The Great Pyramids and the majestic Nile.', weather: 'Sunny' },
  { id: '26', name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop', category: 'Trending Now', price: 110000, rating: 4.8, tagline: 'Iconic opera house and surf culture.', weather: 'Sunny' },
  { id: '27', name: 'Vancouver', country: 'Canada', image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?q=80&w=2118&auto=format&fit=crop', category: 'Mountain Retreats', price: 95000, rating: 4.8, tagline: 'Where dense forests meet glass skyscrapers.', weather: 'Cold' },
  { id: '28', name: 'Bora Bora', country: 'French Polynesia', image: 'https://images.unsplash.com/photo-1589394815804-964ce0ff96c7?q=80&w=2070&auto=format&fit=crop', category: 'Luxury Escapes', price: 300000, rating: 5.0, tagline: 'The ultimate tropical paradise lagoon.', weather: 'Tropical' },
  { id: '29', name: 'Cape Town', country: 'South Africa', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=2071&auto=format&fit=crop', category: 'Adventure Trips', price: 85000, rating: 4.8, tagline: 'Table Mountain views and pristine coastlines.', weather: 'Sunny' },
  { id: '30', name: 'Queenstown', country: 'New Zealand', image: 'https://images.unsplash.com/photo-1607593673750-7ad1fce4ea46?q=80&w=2070&auto=format&fit=crop', category: 'Adventure Trips', price: 120000, rating: 4.9, tagline: 'The adventure capital of the world.', weather: 'Cold' },
  { id: '31', name: 'Amsterdam', country: 'Netherlands', image: 'https://images.unsplash.com/photo-1517736996303-4e64a4f87f6b?q=80&w=2070&auto=format&fit=crop', category: 'Cultural Experiences', price: 88000, rating: 4.7, tagline: 'Historic canals and vibrant art districts.', weather: 'Autumn vibes' },
  { id: '32', name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1952&auto=format&fit=crop', category: 'Luxury Urban', price: 90000, rating: 4.8, tagline: 'Futuristic gardens and world-class dining.', weather: 'Tropical' }
];

const WEATHER_FILTERS = [
  { id: 'Sunny', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', hover: 'hover:border-amber-400' },
  { id: 'Snow', icon: CloudSnow, color: 'text-sky-500', bg: 'bg-sky-50', hover: 'hover:border-sky-400' },
  { id: 'Tropical', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', hover: 'hover:border-orange-400' },
  { id: 'Rainy', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', hover: 'hover:border-blue-400' },
  { id: 'Cold', icon: Wind, color: 'text-slate-500', bg: 'bg-slate-50', hover: 'hover:border-slate-400' },
  { id: 'Autumn vibes', icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:border-emerald-400' },
];

const CATEGORIES = ['All', 'Trending Now', 'Luxury Escapes', 'Cultural Experiences', 'Adventure Trips', 'Beach Destinations', 'Hidden Gems', 'Winter Wonderland'];

// ─── Pinterest Style Masonry Card ────────────────────────────────────────────
const MasonryCard = ({ item, index, onSelect }) => {
  const { toggleSave, savedPlaces } = useAuth();
  const isSaved = savedPlaces?.some(p => p.id === item.id);
  const navigate = useNavigate();

  // Generate varied heights based on index to simulate Pinterest flow
  const heights = ['h-[300px]', 'h-[380px]', 'h-[460px]', 'h-[340px]', 'h-[420px]', 'h-[500px]'];
  const cardHeight = heights[index % heights.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      className={`group relative ${cardHeight} w-full rounded-[2rem] overflow-hidden cursor-pointer shadow-sm shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-400/40 hover:-translate-y-1.5 transition-all duration-500 bg-slate-100`}
      onClick={() => onSelect(item)}
    >
      <div className="absolute inset-0 bg-slate-900">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
          loading="lazy"
        />
      </div>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5 opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
          {item.category}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSave(item); }}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-rose-500 transition-colors shadow-lg"
        >
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-rose-500" : ""} />
        </button>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-20 flex flex-col justify-end h-full">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <MapPin size={14} /> {item.country}
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-1.5 drop-shadow-md leading-tight">{item.name}</h3>
          <p className="text-slate-300 text-sm font-medium mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
            {item.tagline}
          </p>

          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150 border-t border-white/10 pt-4 mt-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Est. Price</p>
              <p className="text-base font-black text-white">₹ {item.price.toLocaleString('en-IN')}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/planner', { state: { destInput: item.name } }); }}
              className="px-4 py-2.5 bg-emerald-500 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30"
            >
              Plan <Navigation size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Explore Component ────────────────────────────────────────────────────
export default function Explore() {
  const { searchTerm } = useOutletContext();
  const navigate = useNavigate();
  const [activeWeather, setActiveWeather] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDest, setSelectedDest] = useState(null);
  
  // Infinite Scroll State
  const [displayedItems, setDisplayedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const ITEMS_PER_PAGE = 12;

  // Initial Filter logic
  const filteredData = useMemo(() => {
    let result = [...CURATED_DESTINATIONS];
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.country.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    if (activeWeather) {
      result = result.filter(d => d.weather === activeWeather);
    }

    if (activeCategory !== 'All' && !activeWeather && !searchTerm) {
      result = result.filter(d => d.category === activeCategory);
    }

    // Shuffle slightly for organic feel
    return result.sort(() => 0.5 - Math.random());
  }, [searchTerm, activeWeather, activeCategory]);

  // Handle lazy loading simulation
  useEffect(() => {
    setPage(1);
    setDisplayedItems(filteredData.slice(0, ITEMS_PER_PAGE));
  }, [filteredData]);

  const loadMore = () => {
    if (displayedItems.length >= filteredData.length) return;
    setIsRefreshing(true);
    setTimeout(() => {
      const nextItems = filteredData.slice(0, (page + 1) * ITEMS_PER_PAGE);
      setDisplayedItems(nextItems);
      setPage(page + 1);
      setIsRefreshing(false);
    }, 800); // simulate network delay
  };

  // Removed infinite scroll listener in favor of manual 'View More' button.

  return (
    <div className="min-h-screen bg-[#fafaf9] pt-4 pb-32">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 space-y-3">
        
        {/* Compact Hero */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
              Discover your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">masterpiece.</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Curated premium travel experiences by Travista AI.</p>
          </div>

          {/* Compact Climate Matcher Toolbar */}
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-2 shadow-sm max-w-2xl">
            <Sparkles size={13} className="text-emerald-500 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 pr-2 border-r border-slate-100">Climate</span>
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar touch-pan-x">
              {WEATHER_FILTERS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setActiveWeather(activeWeather === w.id ? null : w.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap shrink-0 text-[10px] font-bold ${
                    activeWeather === w.id
                      ? `${w.bg} ${w.color} border-current shadow-sm`
                      : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <w.icon size={12} className={activeWeather === w.id ? '' : w.color} />
                  {w.id}
                </button>
              ))}
            </div>
            {activeWeather && (
              <button onClick={() => setActiveWeather(null)} className="text-[9px] font-black uppercase text-slate-300 hover:text-slate-600 shrink-0 pl-2 border-l border-slate-100">✕</button>
            )}
          </div>
        </div>

        {/* Categories & Actions Bar */}
        <div className="flex items-center gap-4 sticky top-[70px] z-[40] bg-[#fafaf9]/90 backdrop-blur-xl py-4 -my-2 border-b border-slate-100/50">
          <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar touch-pan-x min-w-0 pr-2">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveWeather(null); }}
                className={`px-5 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat && !activeWeather
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/map')}
            className="shrink-0 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
          >
            <MapIcon size={14} className="text-emerald-400" /> <span className="hidden sm:inline">Explore Map</span><span className="sm:hidden">Map</span>
          </button>
        </div>

        {/* Endless Native Masonry Grid */}
        <div className="pt-4 min-h-[800px]">
          {displayedItems.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 md:gap-6 w-full">
              <AnimatePresence mode="popLayout">
                {displayedItems.map((item, idx) => (
                  <div key={item.id} className="break-inside-avoid w-full mb-5 md:mb-6">
                    <MasonryCard 
                      item={item} 
                      index={idx}
                      onSelect={setSelectedDest} 
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapIcon className="text-slate-400" size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">No destinations found</h3>
              <p className="text-sm text-slate-500 font-medium">Try adjusting your filters or search term.</p>
            </motion.div>
          )}
          
          {/* Lazy Loading Spinner & View More CTA */}
          <div className="py-16 flex justify-center w-full">
            {isRefreshing ? (
              <Loader2 size={32} className="text-emerald-500 animate-spin" />
            ) : displayedItems.length < filteredData.length ? (
              <button 
                onClick={loadMore}
                className="px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-900 shadow-sm shadow-slate-200/50 hover:shadow-md transition-all flex items-center gap-2 group"
              >
                View More Destinations
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You've reached the end</p>
            )}
          </div>
        </div>

        {/* ─── Smart Price Drops CTA ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 bg-slate-900 rounded-3xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingDown size={22} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">AI Monitoring Active</span>
              </div>
              <p className="text-white font-black text-base leading-snug">Travista AI found 8 price drops today.</p>
              <p className="text-slate-400 text-xs font-medium">Bali ↓28% · Paris ↓22% · Maldives ↓22% · and 5 more.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/price-drops')}
            className="shrink-0 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/30 whitespace-nowrap"
          >
            View All Price Drops <ArrowRight size={13} />
          </button>
        </motion.div>

      </div>

      {/* Budget Plan Modal */}
      <AnimatePresence>
        {selectedDest && (
          <BudgetModal 
            destination={selectedDest} 
            onClose={() => setSelectedDest(null)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
