import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Info, MapPin, Star, Thermometer, Calendar, Wallet, Plane, ArrowRight } from 'lucide-react';
import { useWeather } from '../../hooks/useTravista';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';

const destinationVideos = {
  "Paris":        "1EiC9bvVGnk",
  "London":       "5GENMGoMGiY",
  "New York":     "mqdm-8IcSCw",
  "Bali":         "dkLBaYuNKSA",
  "Tokyo":        "lbDrQLBmDGY",
  "Santorini":    "HHFZPKb3fFw",
  "Dubai":        "7RL3_IbOR2Y",
  "Maldives":     "bPJSzBfxEHk",
  "Barcelona":    "bSXGMvPWbxA",
  "Kyoto":        "KA9BFw2VPDY",
  "Istanbul":     "gGlnJGESlzw",
  "Manali":       "vwzVkqRmAR0",
  "Goa":          "0JxLMGmDKBQ",
  "Iceland":      "k9C31T3bDis",
  "Norway":       "3WN8n5BqdNw",
  "Singapore":    "pPqKmlE7jGE",
  "Morocco":      "hKkZKJRHbfw",
  "Sydney":       "16fVMCKZbXs",
  "Prague":       "l4sMGMXUPBM",
  "Varanasi":     "fhpkHYh7bHc",
  "Kenya":        "MRXCIbRFqB0",
  "Queenstown":   "3tRaT0JUHSI",
  "Patagonia":    "WqKKORFEdOI",
};

const destinationVideoFallbacks = {
  "Paris":     ["tBbpGfCZnSA", "fQSkQhDkPDo"],
  "London":    ["9e_C70W8S6k", "SdUuX9T3Xj4"],
  "New York":  ["m0U9Y6H2N7Y", "mqdm-8IcSCw"],
  "Bali":      ["RhIZFQJCQ0M", "7Mog5gQQi8A"],
  "Tokyo":     ["lbDrQLBmDGY", "UlB0AUuVGho"],
  "Santorini": ["HHFZPKb3fFw", "N-I1YwI-5pM"],
  "Dubai":     ["7RL3_IbOR2Y", "K3V2V4V6Z6I"],
  "Maldives":  ["bPJSzBfxEHk", "fJ6SKS9GFsI"],
  "Barcelona": ["bSXGMvPWbxA", "7Mog5gQQi8A"],
  "Kyoto":     ["KA9BFw2VPDY", "UlB0AUuVGho"],
  "Istanbul":  ["gGlnJGESlzw", "6PJJQLCM9As"],
  "Manali":    ["vwzVkqRmAR0", "8Mog5gQQi8A"],
  "Goa":       ["0JxLMGmDKBQ", "9Mog5gQQi8A"],
  "Iceland":   ["k9C31T3bDis", "10Mog5gQQi8A"],
  "Norway":    ["3WN8n5BqdNw", "11Mog5gQQi8A"],
  "Singapore": ["pPqKmlE7jGE", "12Mog5gQQi8A"],
  "Morocco":   ["hKkZKJRHbfw", "13Mog5gQQi8A"],
  "Sydney":    ["16fVMCKZbXs", "14Mog5gQQi8A"],
};

const getVideoUrl = (youtubeId) =>
  `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`;

const CinematicView = ({ destinations, onPlanTrip, activeCategory, setActiveCategory, categories }) => {
  const [index, setIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [videoIndexes, setVideoIndexes] = useState({});
  const [usePhotoFallback, setUsePhotoFallback] = useState({});
  const autoAdvanceRef = useRef(null);

  // Filter destinations based on activeCategory
  const filteredDests = destinations.filter(d => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Budget ₹') return d.numericPrice < 80000;
    if (activeCategory === 'Trending') return true;
    return d.category === activeCategory;
  });

  const currentDest = filteredDests[index] || filteredDests[0];
  const { weather } = useWeather(currentDest?.name);
  const { photoUrl } = useDestinationPhoto(currentDest?.name);

  const handleVideoError = useCallback((destination) => {
    console.log(`Video load failure for ${destination}. Trying fallback...`);
    const currentIndex = videoIndexes[destination] || 0;
    const fallbacks = destinationVideoFallbacks[destination] || [];
    
    if (currentIndex < fallbacks.length) {
      setVideoIndexes(prev => ({ ...prev, [destination]: currentIndex + 1 }));
    } else {
      console.log(`All videos failed for ${destination}. Using photo fallback.`);
      setUsePhotoFallback(prev => ({ ...prev, [destination]: true }));
    }
  }, [videoIndexes]);

  const resetTimer = () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => {
      handleNext();
    }, 10000); // 10s for cinema mode
  };

  const handleNext = () => {
    setIsChanging(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % filteredDests.length);
      setIsChanging(false);
      resetTimer();
    }, 400);
  };

  const handlePrev = () => {
    setIsChanging(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + filteredDests.length) % filteredDests.length);
      setIsChanging(false);
      resetTimer();
    }, 400);
  };

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(autoAdvanceRef.current);
  }, [index, filteredDests.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filteredDests.length]);

  // Detected iframe load failure (YouTube doesn't fire onerror on iframes)
  useEffect(() => {
    if (!currentDest || usePhotoFallback[currentDest.name]) return;
    
    const timer = setTimeout(() => {
      // 6 second timeout to check if video loaded
      handleVideoError(currentDest.name);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [currentDest?.name, videoIndexes[currentDest?.name], handleVideoError, usePhotoFallback]);

  // Reset index when category changes
  useEffect(() => {
    setIndex(0);
  }, [activeCategory]);

  if (!currentDest) return null;

  const currentVideoIdx = videoIndexes[currentDest.name] || 0;
  const currentVideoId = currentVideoIdx === 0 
    ? (destinationVideos[currentDest.name] || "MCdcBm9BQXU")
    : destinationVideoFallbacks[currentDest.name][currentVideoIdx - 1];

  return (
    <div className="absolute inset-0 bg-black flex overflow-hidden">
      {/* Cinematic Stage (Left side) */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentDest.id}-${currentVideoId}-${usePhotoFallback[currentDest.name]}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-black"
          >
            {usePhotoFallback[currentDest.name] ? (
              <img
                src={photoUrl}
                alt={currentDest.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.6)' }}
              />
            ) : (
              <iframe
                src={getVideoUrl(currentVideoId)}
                className="absolute inset-0 w-full h-full border-none pointer-events-none scale-[1.15]"
                allow="autoplay; fullscreen"
                title={currentDest.name}
              />
            )}
            
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 z-10"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.65) 100%)'
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
        >
          <ChevronRight size={32} />
        </button>

        {/* Center Content (Bottom Third) */}
        <div className="absolute bottom-24 left-16 z-20 space-y-4 max-w-2xl">
          <motion.div
            key={`content-${currentDest.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-white/50 text-xs font-black tracking-[4px] uppercase">Now Exploring</p>
            <h1 className="text-[64px] font-extralight text-white tracking-[4px] leading-tight uppercase italic">
              {currentDest.name}
            </h1>
            <p className="text-white/80 text-sm font-bold tracking-[2px] uppercase">
              {currentDest.country} · {currentDest.category}
            </p>

            {/* Meta Chips */}
            <div className="flex gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold">{currentDest.rating || '4.8'}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                <Thermometer size={14} className="text-teal-400" />
                <span className="text-white text-xs font-bold">{weather?.temp || '24'}°C</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                <Wallet size={14} className="text-emerald-400" />
                <span className="text-white text-xs font-bold">{currentDest.price}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                <Calendar size={14} className="text-blue-400" />
                <span className="text-white text-xs font-bold">5-7 Days</span>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                onClick={() => onPlanTrip(currentDest)}
                className="bg-[#1D9E75] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-[#15825f] transition-all shadow-xl shadow-[#1D9E75]/20"
              >
                Plan My Trip <ArrowRight size={18} />
              </button>
              <button 
                className="bg-white/10 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all"
                onClick={() => window.open(`https://www.google.com/search?q=flights+to+${currentDest.name}`, '_blank')}
              >
                ✈️ Find Flights
              </button>
            </div>
          </motion.div>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-16 flex gap-2 z-20">
          {filteredDests.slice(0, 10).map((_, i) => (
            <div 
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-[#1D9E75]' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>

        {/* Floating Bottom Filters */}
        <div className="absolute bottom-8 right-8 z-30 flex gap-2">
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border transition-all ${
                activeCategory === cat 
                  ? 'bg-[#1D9E75] border-[#1D9E75] text-white' 
                  : 'bg-black/30 border-white/10 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Side Panel (Right side) */}
      <div className="w-[340px] h-full bg-black/75 backdrop-blur-[20px] border-l border-white/10 z-40 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <p className="text-[#1D9E75] text-[10px] font-black uppercase tracking-widest mb-1">{filteredDests.length} Destinations Found</p>
          <h2 className="text-white text-xl font-black italic uppercase tracking-tighter">Cinema <span className="text-white/40">Mode</span></h2>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2">
          {filteredDests.map((dest, i) => (
            <SidebarItem 
              key={dest.id} 
              dest={dest} 
              active={index === i} 
              onClick={() => { setIndex(i); resetTimer(); }}
            />
          ))}
        </div>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={() => onPlanTrip(currentDest)}
            className="w-full py-4 bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-2xl text-[#1D9E75] font-black text-xs uppercase tracking-widest hover:bg-[#1D9E75] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            ✦ Plan My Trip to {currentDest.name}
          </button>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ dest, active, onClick }) => {
  const { photoUrl } = useDestinationPhoto(dest.name);
  const { weather } = useWeather(dest.name);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group ${
        active ? 'bg-[#1D9E75]/10 border border-[#1D9E75]/30' : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
        <img src={photoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={dest.name} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-black text-sm transition-colors ${active ? 'text-[#1D9E75]' : 'text-white'}`}>{dest.name}</h4>
        <p className="text-white/40 text-[10px] font-bold uppercase truncate">{dest.country} · {dest.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-black text-white/60">₹{dest.numericPrice?.toLocaleString()}</span>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[10px] font-black text-teal-400">{weather?.temp || '24'}°C</span>
        </div>
      </div>
      {active && (
        <div className="w-1.5 h-10 bg-[#1D9E75] rounded-full" />
      )}
    </button>
  );
};

export default CinematicView;
