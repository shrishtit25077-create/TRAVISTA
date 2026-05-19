import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Heart, MapPin, Sparkles, Navigation, CloudRain, Sun, Wind, CloudSnow, Flame, TreePine, Loader2, TrendingDown, ArrowRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DestinationCard, { DestinationSkeleton } from '../../components/DestinationCard';

// ─── Curated Destinations Data ──────────────────────────────────────────────
const CURATED_DESTINATIONS = [
  { id: '1',  name: 'Paris',        country: 'France',      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop', category: 'Romantic',         price: 150000, rating: 4.9, tagline: 'City of light, love, and endless romance.',         weather: 'Autumn vibes' },
  { id: '2',  name: 'Kyoto',        country: 'Japan',       image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop', category: 'Cultural',          price: 92000,  rating: 4.8, tagline: 'Ancient temples and blooming cherry blossoms.',    weather: 'Sunny' },
  { id: '3',  name: 'Bali',         country: 'Indonesia',   image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2076&auto=format&fit=crop', category: 'Beach Escape',     price: 65000,  rating: 4.7, tagline: 'Lush jungles and serene spiritual retreats.',     weather: 'Tropical' },
  { id: '4',  name: 'Zermatt',      country: 'Switzerland', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070&auto=format&fit=crop', category: 'Luxury',           price: 220000, rating: 4.9, tagline: 'World-class skiing under the Matterhorn.',        weather: 'Snow' },
  { id: '5',  name: 'Santorini',    country: 'Greece',      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop', category: 'Romantic',         price: 110000, rating: 4.8, tagline: 'Breathtaking sunsets over the Aegean Sea.',      weather: 'Sunny' },
  { id: '6',  name: 'Dubai',        country: 'UAE',         image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop', category: 'Luxury',           price: 95000,  rating: 4.6, tagline: 'Futuristic architecture and desert luxury.',     weather: 'Sunny' },
  { id: '7',  name: 'Reykjavik',    country: 'Iceland',     image: 'https://images.unsplash.com/photo-1520612196627-772844d18ec9?q=80&w=2070&auto=format&fit=crop', category: 'Adventure',        price: 130000, rating: 4.9, tagline: 'Northern lights and dramatic landscapes.',       weather: 'Cold' },
  { id: '8',  name: 'Goa',          country: 'India',       image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1974&auto=format&fit=crop', category: 'Beach Escape',     price: 25000,  rating: 4.5, tagline: 'Vibrant nightlife and pristine coastlines.',     weather: 'Tropical' },
  { id: '9',  name: 'Machu Picchu', country: 'Peru',        image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2070&auto=format&fit=crop', category: 'Adventure',        price: 145000, rating: 4.9, tagline: 'The lost city of the Incas high in the Andes.',  weather: 'Cold' },
  { id: '10', name: 'Amalfi Coast', country: 'Italy',       image: 'https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?q=80&w=2071&auto=format&fit=crop', category: 'Luxury',           price: 125000, rating: 4.8, tagline: 'Cliffside colorful villages and lemons.',         weather: 'Sunny' },
  { id: '11', name: 'Banff',        country: 'Canada',      image: 'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?q=80&w=2071&auto=format&fit=crop', category: 'Mountain Retreat', price: 95000,  rating: 4.8, tagline: 'Turquoise glacial lakes and alpine peaks.',      weather: 'Cold' },
  { id: '12', name: 'Seoul',        country: 'South Korea', image: 'https://images.unsplash.com/photo-1538669715315-05ad0419213d?q=80&w=2070&auto=format&fit=crop', category: 'Food & Nightlife', price: 85000,  rating: 4.7, tagline: 'A mesmerizing blend of pop culture and tradition.', weather: 'Autumn vibes' },
  { id: '13', name: 'Swiss Alps',   country: 'Switzerland', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop', category: 'Mountain Retreat', price: 220000, rating: 4.9, tagline: 'Iconic peaks and pristine snow resorts.',         weather: 'Snow' },
  { id: '14', name: 'Tokyo',        country: 'Japan',       image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2070&auto=format&fit=crop', category: 'Food & Nightlife', price: 180000, rating: 4.8, tagline: 'Electric nights and world-class culinary art.',    weather: 'Sunny' },
  { id: '15', name: 'Maldives',     country: 'Maldives',    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2065&auto=format&fit=crop', category: 'Beach Escape',     price: 250000, rating: 4.9, tagline: 'Overwater bungalows and crystal clear reefs.',   weather: 'Tropical' },
  { id: '16', name: 'Barcelona',    country: 'Spain',       image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070&auto=format&fit=crop', category: 'Cultural',          price: 110000, rating: 4.8, tagline: 'Art, architecture, and Mediterranean energy.',   weather: 'Sunny' },
  { id: '17', name: 'London',       country: 'UK',          image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop', category: 'Cultural',          price: 120000, rating: 4.7, tagline: 'Royal heritage and cosmopolitan vibes.',          weather: 'Autumn vibes' },
  { id: '18', name: 'New York',     country: 'USA',         image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop', category: 'Weekend Trip',     price: 180000, rating: 4.7, tagline: 'The city that never sleeps.',                    weather: 'Sunny' },
  { id: '19', name: 'Petra',        country: 'Jordan',      image: 'https://images.unsplash.com/photo-1501230491752-92a106b539fb?q=80&w=2070&auto=format&fit=crop', category: 'Hidden Gem',       price: 110000, rating: 4.9, tagline: 'The ancient rose-red city carved into stone.',   weather: 'Sunny' },
  { id: '20', name: 'Marrakech',    country: 'Morocco',     image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2071&auto=format&fit=crop', category: 'Cultural',          price: 70000,  rating: 4.7, tagline: 'Bustling souks and stunning riads.',             weather: 'Sunny' },
  { id: '21', name: 'Cappadocia',   country: 'Turkey',      image: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?q=80&w=2070&auto=format&fit=crop', category: 'Adventure',        price: 65000,  rating: 4.9, tagline: 'Hot air balloons over fairy chimneys.',          weather: 'Sunny' },
  { id: '22', name: 'Sydney',       country: 'Australia',   image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop', category: 'Beach Escape',     price: 140000, rating: 4.8, tagline: 'Iconic harbor and surf-ready beaches.',           weather: 'Sunny' },
  { id: '23', name: 'Singapore',    country: 'Singapore',   image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1952&auto=format&fit=crop', category: 'Luxury',           price: 90000,  rating: 4.8, tagline: 'Futuristic gardens and urban perfection.',      weather: 'Tropical' },
  { id: '24', name: 'Phuket',       country: 'Thailand',    image: 'https://images.unsplash.com/photo-1589394815804-964ce0ff96c7?q=80&w=2070&auto=format&fit=crop', category: 'Beach Escape',     price: 40000,  rating: 4.6, tagline: 'Crystal waters and tropical island nights.',    weather: 'Tropical' },
];

const WEATHER_FILTERS = [
  { id: 'Sunny',        icon: Sun,       color: 'text-amber-500',   bg: 'bg-amber-50'   },
  { id: 'Snow',         icon: CloudSnow, color: 'text-sky-500',     bg: 'bg-sky-50'     },
  { id: 'Tropical',     icon: Flame,     color: 'text-orange-500',  bg: 'bg-orange-50'  },
  { id: 'Rainy',        icon: CloudRain, color: 'text-blue-500',    bg: 'bg-blue-50'    },
  { id: 'Cold',         icon: Wind,      color: 'text-slate-500',   bg: 'bg-slate-50'   },
  { id: 'Autumn vibes', icon: TreePine,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const CATEGORIES = [
  'All', 'Beach Escape', 'Cultural', 'Luxury', 'Adventure',
  'Hidden Gem', 'Mountain Retreat', 'Romantic', 'Food & Nightlife',
  'Spiritual', 'Weekend Trip',
];

// ─── Main Explore Component ────────────────────────────────────────────────────
export default function Explore() {
  const context = useOutletContext() || {};
  const { searchTerm = '' } = context;

  const navigate = useNavigate();
  const [activeWeather, setActiveWeather]   = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // Infinite scroll state
  const [displayedItems, setDisplayedItems] = useState([]);
  const [page, setPage]                     = useState(1);
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const ITEMS_PER_PAGE = 12;

  const filteredData = useMemo(() => {
    let result = [...CURATED_DESTINATIONS];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q)    ||
        d.country.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }
    if (activeWeather) result = result.filter(d => d.weather === activeWeather);
    if (activeCategory !== 'All' && !activeWeather && !searchTerm) {
      result = result.filter(d => d.category === activeCategory);
    }
    return result.sort(() => 0.5 - Math.random());
  }, [searchTerm, activeWeather, activeCategory]);

  useEffect(() => {
    setPage(1);
    setDisplayedItems(filteredData.slice(0, ITEMS_PER_PAGE));
  }, [filteredData]);

  const loadMore = () => {
    if (displayedItems.length >= filteredData.length) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setDisplayedItems(filteredData.slice(0, (page + 1) * ITEMS_PER_PAGE));
      setPage(p => p + 1);
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-12">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      {/* Sits in normal flow ABOVE the sticky filter bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-6 pb-5">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
              Discover your next{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                masterpiece.
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Curated premium travel experiences by Travista AI.
            </p>
          </div>

          {/* Compact Climate Toolbar */}
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-2 shadow-sm max-w-2xl shrink-0">
            <Sparkles size={13} className="text-emerald-500 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 pr-2 border-r border-slate-100">
              Climate
            </span>
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar touch-pan-x">
              {WEATHER_FILTERS.map(w => (
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
              <button
                onClick={() => setActiveWeather(null)}
                className="text-[9px] font-black uppercase text-slate-300 hover:text-slate-600 shrink-0 pl-2 border-l border-slate-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Category Filter Bar ───────────────────────────────────── */}
      {/*
        KEY FIX: This bar is a SIBLING of the max-width containers, not nested
        inside one. It is full-width at the component root so sticky positioning
        works correctly relative to the DashboardLayout scroll container.
        The inner content uses its own max-width + padding to stay aligned.
      */}
      <div className="travista-sticky-bar">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar touch-pan-x min-w-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setActiveWeather(null); }}
                  className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                    activeCategory === cat && !activeWeather
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/15'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate('/map')}
              className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-md shadow-slate-900/15 whitespace-nowrap"
            >
              <MapIcon size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Explore Map</span>
              <span className="sm:hidden">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Card Grid ────────────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
            <AnimatePresence mode="popLayout">
              {displayedItems.map(item => (
                <DestinationCard key={item.id} item={item} />
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

        {/* Load More */}
        <div className="py-16 flex justify-center w-full">
          {isRefreshing ? (
            <Loader2 size={32} className="text-emerald-500 animate-spin" />
          ) : displayedItems.length < filteredData.length ? (
            <button
              onClick={loadMore}
              className="px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-900 shadow-sm hover:shadow-md transition-all flex items-center gap-2 group"
            >
              View More Destinations
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ) : (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              You've reached the end
            </p>
          )}
        </div>
      </div>

      {/* ── Price Drops CTA ───────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-3xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingDown size={22} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  AI Monitoring Active
                </span>
              </div>
              <p className="text-white font-black text-base leading-snug">
                Travista AI found 8 price drops today.
              </p>
              <p className="text-slate-400 text-xs font-medium">
                Bali ↓28% · Paris ↓22% · Maldives ↓22% · and 5 more.
              </p>
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

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
