import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, ChevronDown, Globe, Plane, 
  Palmtree, Mountain, Landmark, Utensils, 
  Wind, Tent, MapPin, Wallet, Dices, ArrowRight
} from 'lucide-react';

const HeroChip = ({ label, active, onClick }) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-5 py-2.5
        rounded-full
        text-sm font-medium
        leading-none
        whitespace-nowrap
        transition-all duration-200
        ${active 
          ? 'bg-[#2F7D69] text-white shadow-md' 
          : 'bg-white text-[#374151] border border-slate-100 hover:border-slate-200 shadow-sm'
        }
      `}
    >
      <span className="flex items-center gap-1">{label}</span>
    </motion.button>
  );
};

const DestinationCard = ({ label, icon: Icon }) => (
  <motion.button 
    initial={{ y: 0 }}
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    whileHover={{ scale: 1.03, y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
    className="flex items-center gap-3 px-6 py-4 glass-destination-dark rounded-2xl text-[11px] font-black tracking-widest text-white hover:border-white/20 transition-all shadow-2xl group"
  >
    {Icon && <Icon strokeWidth={1.5} className="w-4 h-4 text-[#34D399] group-hover:scale-110 transition-transform" />}
    <span className="whitespace-nowrap uppercase">{label}</span>
  </motion.button>
);

const HomeHero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeChip, setActiveChip] = useState('Relaxing Beach 🌴');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const chips = [
    "Relaxing Beach 🌴", "Mountain Adventure 🏔️", "Cultural History 🏛️", "Food Tour 🍜",
    "Weekend Getaway 🏕️", "Hill Stations 🌄", "Spiritual यात्रा 🛕", "Budget ₹ 💸"
  ];

  return (
    <div className="relative h-[85vh] w-full rounded-[28px] overflow-hidden shadow-2xl mb-12 flex items-center justify-end px-20">
      {/* Immersive Background Layer */}
      <motion.div 
        style={{ y: scrollY * 0.15 }}
        className="absolute inset-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover scale-105"
          alt="Sunset Landscape"
        />
        {/* Exact Cinematic Navy Overlay (90deg) */}
        <div className="absolute inset-0 cinematic-navy-overlay-fade" />
      </motion.div>

      {/* Floating Hero Content (RIGHT ALIGNED) */}
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-[640px] w-full space-y-10 text-right flex flex-col items-end"
      >
        {/* Typography Layer */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.5em]">TRAVISTA • PREMIUM COLLECTION</span>
          <div className="space-y-1">
            <h1 className="text-6xl font-extrabold tracking-tight leading-[0.95] text-white">
              Curate your <br/>
              <span className="bg-gradient-to-r from-[#34D399] to-[#10B981] bg-clip-text text-transparent italic">
                perfect journey.
              </span>
            </h1>
          </div>
          <p className="text-[16px] text-white/70 font-medium leading-relaxed max-w-sm ml-auto">
            Discover destinations, plan itineraries, and explore the world effortlessly.
          </p>
        </div>

        <div className="space-y-10 w-full flex flex-col items-end">
          {/* Glassmorphism Search Hub */}
          <div className="glass-search-premium p-1.5 rounded-full flex items-center gap-4 min-h-[68px] w-full max-w-[580px] group transition-all hover:bg-white/[0.12]">
            <div className="pl-6 flex items-center justify-center">
              <Search strokeWidth={1.5} className="w-5 h-5 text-slate-300 group-focus-within:text-[#34D399] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search destinations, stays, experiences..." 
              className="flex-1 bg-transparent border-none py-3 text-sm font-bold text-white placeholder-slate-400 outline-none"
            />
            <motion.button 
              whileHover={{ scale: 1.04, backgroundColor: "#256653" }}
              whileTap={{ scale: 0.96 }}
              className="bg-[#2F7D69] text-white h-[52px] px-10 py-0 font-black text-[11px] uppercase tracking-widest flex items-center gap-2.5 mr-0.5 rounded-full shadow-lg"
            >
              GENERATE TRIP ✨
            </motion.button>
          </div>

          {/* Clean Category Pills */}
          <div className="flex flex-wrap gap-3 justify-end w-full">
            {chips.map(chip => (
              <HeroChip 
                key={chip} 
                label={chip} 
                active={activeChip === chip}
                onClick={() => setActiveChip(chip)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Bottom Center Indicator */}
      <motion.div 
        animate={{ y: [0, 8, 0] }} 
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
      >
        <ChevronDown strokeWidth={1.5} className="w-4 h-4" />
      </motion.div>

      {/* Floating Destination Cards (Bottom Right) */}
      <div className="absolute bottom-12 right-12 flex flex-col gap-4 items-end">
        <DestinationCard label="Budget Himachal" icon={Mountain} />
        <DestinationCard label="Kyoto Culture Tour" icon={Landmark} />
      </div>
    </div>
  );
};

export default HomeHero;
