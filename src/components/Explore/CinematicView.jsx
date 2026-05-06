import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Star, Thermometer, Calendar,
  Wallet, ArrowRight, Play, Film
} from 'lucide-react';
import { useWeather } from '../../hooks/useTravista';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';

// ─── YouTube ID map ───────────────────────────────────────────────────────────
// Each destination has a primary YouTube ID + curated fallbacks
const YOUTUBE_MAP = {
  "Paris":       { primary: "tBbpGfCZnSA", fallbacks: ["1EiC9bvVGnk", "fQSkQhDkPDo"] },
  "London":      { primary: "5GENMGoMGiY", fallbacks: ["9e_C70W8S6k"] },
  "New York":    { primary: "mqdm-8IcSCw", fallbacks: ["m0U9Y6H2N7Y"] },
  "Bali":        { primary: "dkLBaYuNKSA", fallbacks: ["RhIZFQJCQ0M", "7Mog5gQQi8A"] },
  "Tokyo":       { primary: "lbDrQLBmDGY", fallbacks: ["UlB0AUuVGho"] },
  "Santorini":   { primary: "HHFZPKb3fFw", fallbacks: ["N-I1YwI-5pM"] },
  "Dubai":       { primary: "7RL3_IbOR2Y", fallbacks: ["K3V2V4V6Z6I"] },
  "Maldives":    { primary: "bPJSzBfxEHk", fallbacks: ["fJ6SKS9GFsI"] },
  "Barcelona":   { primary: "bSXGMvPWbxA", fallbacks: ["7Mog5gQQi8A"] },
  "Kyoto":       { primary: "KA9BFw2VPDY", fallbacks: ["UlB0AUuVGho"] },
  "Istanbul":    { primary: "gGlnJGESlzw", fallbacks: ["6PJJQLCM9As"] },
  "Manali":      { primary: "vwzVkqRmAR0", fallbacks: [] },
  "Goa":         { primary: "0JxLMGmDKBQ", fallbacks: [] },
  "Iceland":     { primary: "k9C31T3bDis", fallbacks: [] },
  "Norway":      { primary: "3WN8n5BqdNw", fallbacks: [] },
  "Singapore":   { primary: "pPqKmlE7jGE", fallbacks: [] },
  "Morocco":     { primary: "hKkZKJRHbfw", fallbacks: [] },
  "Sydney":      { primary: "16fVMCKZbXs", fallbacks: [] },
  "Prague":      { primary: "l4sMGMXUPBM", fallbacks: [] },
  "Varanasi":    { primary: "fhpkHYh7bHc", fallbacks: [] },
  "Kenya":       { primary: "MRXCIbRFqB0", fallbacks: [] },
  "Queenstown":  { primary: "3tRaT0JUHSI", fallbacks: [] },
  "Patagonia":   { primary: "WqKKORFEdOI", fallbacks: [] },
};

// Default travel ambiance video for unknowns
const DEFAULT_VIDEO_ID = "MCdcBm9BQXU";

function getYouTubeEmbed(id) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0`;
}

function getVideoIdForDest(name) {
  return YOUTUBE_MAP[name]?.primary || DEFAULT_VIDEO_ID;
}

// ─── CinematicView ───────────────────────────────────────────────────────────
const CinematicView = ({ destinations, onPlanTrip, activeCategory, setActiveCategory, categories }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activePreview, setActivePreview] = useState(null); // debounced hovered
  const [isChanging, setIsChanging] = useState(false);
  const [photoFallback, setPhotoFallback] = useState({});
  const autoAdvanceRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Filter destinations
  const filteredDests = destinations.filter(d => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Budget ₹') return d.numericPrice < 80000;
    if (activeCategory === 'Trending') return true;
    return d.category === activeCategory;
  });

  // Priority: debounced hover > selected
  const activeIndex = activePreview !== null ? activePreview : selectedIndex;
  const currentDest = filteredDests[activeIndex] || filteredDests[0];
  const selectedDest = filteredDests[selectedIndex] || filteredDests[0];

  const { weather } = useWeather(currentDest?.name);
  const { photoUrl } = useDestinationPhoto(currentDest?.name);

  const videoId = currentDest ? getVideoIdForDest(currentDest.name) : DEFAULT_VIDEO_ID;

  // ── Hover debounce (150 ms to avoid flicker) ─────────────────────────────
  const handleMouseEnter = (i) => {
    setHoveredIndex(i);
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setActivePreview(i);
    }, 150);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setActivePreview(null);
    }, 80);
  };

  // ── Auto-advance (only when not hovering) ────────────────────────────────
  const resetTimer = useCallback(() => {
    clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => {
      if (hoveredIndex === null) {
        setIsChanging(true);
        setTimeout(() => {
          setSelectedIndex(prev => (prev + 1) % filteredDests.length);
          setIsChanging(false);
        }, 400);
      }
    }, 10000);
  }, [filteredDests.length, hoveredIndex]);

  const handleNext = () => {
    setIsChanging(true);
    setTimeout(() => {
      setSelectedIndex(prev => (prev + 1) % filteredDests.length);
      setIsChanging(false);
      resetTimer();
    }, 400);
  };

  const handlePrev = () => {
    setIsChanging(true);
    setTimeout(() => {
      setSelectedIndex(prev => (prev - 1 + filteredDests.length) % filteredDests.length);
      setIsChanging(false);
      resetTimer();
    }, 400);
  };

  // keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filteredDests.length]);

  useEffect(() => { resetTimer(); return () => clearTimeout(autoAdvanceRef.current); }, [selectedIndex, filteredDests.length]);
  useEffect(() => { setSelectedIndex(0); }, [activeCategory]);

  if (!currentDest) return null;

  const isFallback = photoFallback[currentDest.name];

  return (
    <div className="absolute inset-0 bg-black flex overflow-hidden">

      {/* ── Cinematic Stage ─────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Video / Photo Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${currentDest.id}-${videoId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black"
          >
            {isFallback ? (
              <img
                src={photoUrl}
                alt={currentDest.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.6)' }}
              />
            ) : (
              <iframe
                key={`${currentDest.name}-${videoId}`}
                src={getYouTubeEmbed(videoId)}
                className="absolute inset-0 w-full h-full border-none pointer-events-none scale-[1.18]"
                allow="autoplay; fullscreen"
                title={currentDest.name}
              />
            )}

            {/* Cinematic gradient overlays */}
            <div className="absolute inset-0 z-10" style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.75) 100%)'
            }} />
            <div className="absolute inset-0 z-10" style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%)'
            }} />
          </motion.div>
        </AnimatePresence>

        {/* "Now Previewing" badge when hovering */}
        <AnimatePresence>
          {hoveredIndex !== null && hoveredIndex !== selectedIndex && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 text-[11px] font-black uppercase tracking-widest">Previewing</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left / Right Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all group"
        >
          <ChevronLeft size={28} className="group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all group"
        >
          <ChevronRight size={28} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Bottom Content */}
        <div className="absolute bottom-28 left-14 z-20 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${currentDest.id}`}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <p className="text-emerald-400/80 text-[10px] font-black tracking-[5px] uppercase flex items-center gap-2">
                <Film size={12} /> Now Exploring
              </p>
              <h1 className="text-[60px] font-extralight text-white leading-none tracking-[3px] uppercase italic drop-shadow-2xl">
                {currentDest.name}
              </h1>
              <p className="text-white/60 text-sm font-bold tracking-[2px] uppercase">
                {currentDest.country} · {currentDest.category}
              </p>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-3 pt-1">
                {[
                  { icon: <Star size={13} className="text-yellow-400 fill-yellow-400" />, text: currentDest.rating || '4.8' },
                  { icon: <Thermometer size={13} className="text-teal-400" />, text: `${weather?.temp || '24'}°C` },
                  { icon: <Wallet size={13} className="text-emerald-400" />, text: currentDest.price },
                  { icon: <Calendar size={13} className="text-blue-400" />, text: '5–7 Days' },
                ].map((chip, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                    {chip.icon}
                    <span className="text-white text-xs font-bold">{chip.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => onPlanTrip(currentDest)}
                  className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30"
                >
                  <Play size={16} fill="currentColor" /> Plan My Trip
                </button>
                <button
                  className="bg-white/10 backdrop-blur-md text-white border border-white/15 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all"
                  onClick={() => window.open(`https://www.google.com/search?q=flights+to+${currentDest.name}`, '_blank')}
                >
                  ✈️ Find Flights
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-10 left-14 flex gap-2 z-20">
          {filteredDests.slice(0, 12).map((_, i) => (
            <button
              key={i}
              onClick={() => { setSelectedIndex(i); setActivePreview(null); }}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === (activePreview !== null ? activePreview : selectedIndex)
                  ? 'w-8 bg-emerald-400'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Category filter pills */}
        <div className="absolute bottom-10 right-6 z-30 flex flex-wrap justify-end gap-2 max-w-xs">
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-black/30 border-white/10 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Side Panel ──────────────────────────────────────────────────── */}
      <div className="w-[340px] h-full bg-black/80 backdrop-blur-[24px] border-l border-white/10 z-40 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
            {filteredDests.length} Destinations
          </p>
          <h2 className="text-white text-xl font-black italic uppercase tracking-tighter">
            Cinema <span className="text-white/30">Mode</span>
          </h2>
          <p className="text-white/30 text-[11px] font-medium mt-1">Hover to preview · Click to explore</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {filteredDests.map((dest, i) => {
            const isSelected = selectedIndex === i;
            const isHovered = hoveredIndex === i;
            const isActive = isSelected || isHovered;
            return (
              <SidebarItem
                key={dest.id}
                dest={dest}
                isSelected={isSelected}
                isHovered={isHovered}
                isActive={isActive}
                onClick={() => { setSelectedIndex(i); setActivePreview(null); }}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </div>

        <div className="p-5 border-t border-white/10">
          <button
            onClick={() => onPlanTrip(selectedDest)}
            className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight size={14} /> Plan Trip to {selectedDest?.name}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SidebarItem ─────────────────────────────────────────────────────────────
const SidebarItem = ({ dest, isSelected, isHovered, isActive, onClick, onMouseEnter, onMouseLeave }) => {
  const { photoUrl } = useDestinationPhoto(dest.name);
  const { weather } = useWeather(dest.name);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ x: 3 }}
      transition={{ duration: 0.15 }}
      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group relative ${
        isSelected
          ? 'bg-emerald-500/15 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : isHovered
          ? 'bg-white/8 border border-white/15 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
          : 'border border-transparent hover:border-white/10 hover:bg-white/5'
      }`}
    >
      {/* Thumbnail */}
      <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all ${
        isActive ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-black' : 'border border-white/10'
      }`}>
        <img
          src={photoUrl}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
          alt={dest.name}
        />
        {/* Play icon overlay on hover */}
        {isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
              <Play size={10} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-black text-sm truncate transition-colors ${
          isSelected ? 'text-emerald-400' : isHovered ? 'text-white' : 'text-white/80'
        }`}>
          {dest.name}
        </h4>
        <p className="text-white/30 text-[10px] font-bold uppercase truncate mt-0.5">
          {dest.country} · {dest.category}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-black text-white/50">{dest.price}</span>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[10px] font-black text-teal-400">{weather?.temp || '24'}°C</span>
        </div>
      </div>

      {/* Active bar */}
      {isSelected && (
        <motion.div
          layoutId="activeBar"
          className="w-1.5 h-10 bg-emerald-400 rounded-full shrink-0"
        />
      )}

      {/* Hover play indicator */}
      {isHovered && !isSelected && (
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <Play size={10} fill="white" className="text-white ml-0.5" />
        </div>
      )}
    </motion.button>
  );
};

export default CinematicView;
