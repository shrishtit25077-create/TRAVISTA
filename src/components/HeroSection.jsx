import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Search } from 'lucide-react';

const heroImages = {
  beach:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000',
  mountain:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000',
  culture: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=2000',
  food:    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2000',
};

const PLACEHOLDERS = ['Try: Bali…','Try: Paris…','Try: Ladakh…','Try: Santorini…','Try: Manali…'];

const AI_PILLS = [
  { icon:'🌴', label:'3 days in Bali' },
  { icon:'🏔️', label:'Budget Himachal' },
  { icon:'⛩️', label:'Kyoto Culture Tour' },
  { icon:'🏖️', label:'Goa Weekend' },
  { icon:'🗼', label:'Paris Romantic' },
];

const CHIPS_ROW1 = [
  { id:'beach',   icon:'🏖️', label:'Relaxing Beach' },
  { id:'mountain',icon:'🏔️', label:'Mountain Adventure' },
  { id:'culture', icon:'🏛️', label:'Cultural History' },
  { id:'food',    icon:'🍜', label:'Food Tour' },
];

const CHIPS_ROW2 = [
  { id:'r2-weekend', icon:'🏕️', label:'Weekend Getaway',   search:'Weekend Getaway' },
  { id:'r2-hill',    icon:'⛰️', label:'Hill Stations',      search:'Hill Stations' },
  { id:'r2-spirit',  icon:'🛕', label:'Spiritual यात्रा',  search:'Spiritual यात्रा' },
  { id:'r2-budget',  icon:'💸', label:'Budget ₹',           search:'Budget ₹' },
];

export default function HeroSection({
  activeTheme, setActiveTheme,
  searchValue, setSearchValue,
  isSearchFocused, setIsSearchFocused,
  suggestions, debouncedSearchValue, selectedIndex, setSelectedIndex,
  handleSelectSuggestion, handleKeyDown,
  isSurprising, showToast, handleSurpriseMe,
  searchContainerRef,
}) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // ── Parallax (mouse) ──────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bgX = useTransform(mouseX, [-1, 1], ['-1.2%', '1.2%']);
  const bgY = useTransform(mouseY, [-1, 1], ['-1.2%', '1.2%']);

  const onMouseMove = useCallback((e) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(((e.clientX - r.left) / r.width  - 0.5) * 2);
    mouseY.set(((e.clientY - r.top)  / r.height - 0.5) * 2);
  }, [mouseX, mouseY]);

  // ── Rotating placeholder ──────────────────────────────
  const [phIdx, setPhIdx] = useState(0);
  useEffect(() => {
    if (isSearchFocused || searchValue) return;
    const t = setInterval(() => setPhIdx(i => (i+1) % PLACEHOLDERS.length), 2800);
    return () => clearInterval(t);
  }, [isSearchFocused, searchValue]);

  // ── AI pill offset (auto-scroll) ──────────────────────
  const [pillBase, setPillBase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPillBase(i => (i+1) % AI_PILLS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const dots = [
    { size:6, top:'17%', left:'63%', delay:0 },
    { size:4, top:'57%', left:'80%', delay:1.1 },
    { size:8, top:'32%', left:'87%', delay:0.5 },
  ];

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative h-[660px] md:h-[740px] rounded-[2.5rem] mx-6 md:mx-12 overflow-hidden mt-6 shadow-[0_28px_72px_rgba(0,0,0,0.22)]"
    >
      {/* ── Background with parallax ── */}
      <AnimatePresence mode="popLayout">
        <motion.div key={activeTheme}
          className="absolute inset-[-3%] z-0"
          style={{ x: bgX, y: bgY }}
          initial={{ opacity:0, scale:1.08 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0 }}
          transition={{ duration:1.3, ease:[0.22,1,0.36,1] }}>
          <img src={heroImages[activeTheme] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000'} alt="Hero"
            className="w-full h-full object-cover"
            style={{ filter:'brightness(0.88) contrast(1.07) saturate(1.12)' }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlays ── */}
      <motion.div className="absolute inset-0 z-[5] pointer-events-none"
        animate={{ opacity:[0.50,0.62,0.50] }}
        transition={{ duration:9, repeat:Infinity, ease:'easeInOut' }}
        style={{ background:'linear-gradient(135deg,rgba(15,23,42,0.58) 0%,rgba(10,40,60,0.26) 55%,transparent 100%)' }} />
      <div className="absolute inset-0 z-[6] pointer-events-none"
        style={{ background:'linear-gradient(to right,rgba(15,23,42,0.70) 0%,rgba(15,23,42,0.28) 46%,rgba(15,23,42,0.04) 72%,transparent 100%)' }} />
      <div className="absolute inset-0 z-[6] pointer-events-none"
        style={{ background:'linear-gradient(to top,rgba(15,23,42,0.35) 0%,transparent 38%)' }} />

      {/* ── Glow dots ── */}
      {dots.map((d,i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none z-[7]"
          style={{ width:d.size, height:d.size, top:d.top, left:d.left, background:'rgba(111,175,155,0.75)', boxShadow:'0 0 14px rgba(111,175,155,0.85)' }}
          animate={{ y:[-7,7,-7], opacity:[0.45,1,0.45] }}
          transition={{ duration:3.5, repeat:Infinity, delay:d.delay, ease:'easeInOut' }} />
      ))}

      {/* ── CONTENT ── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">

        {/* Glass depth card */}
        <div style={{
          maxWidth:'36rem',
          background:'rgba(255,255,255,0.04)',
          backdropFilter:'blur(4px)',
          WebkitBackdropFilter:'blur(4px)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'20px',
          padding:'2.4rem 2rem 2rem',
        }}>
          {/* Eyebrow */}
          <motion.span initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.10, duration:0.5 }}
            className="block text-[10.5px] font-bold tracking-[0.26em] uppercase mb-4"
            style={{ color:'rgba(255,255,255,0.50)' }}>
            Travista · Editorial Collection
          </motion.span>

          {/* Headline */}
          <h1 className="font-black tracking-tight leading-[1.05] mb-4" style={{ fontSize:'clamp(2.6rem,5vw,4rem)' }}>
            <motion.span initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.18, duration:0.7, ease:[0.22,1,0.36,1] }}
              className="block text-white" style={{ textShadow:'0 2px 16px rgba(0,0,0,0.25)' }}>
              Curate your
            </motion.span>
            <motion.span initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.30, duration:0.7, ease:[0.22,1,0.36,1] }}
              className="block italic"
              style={{
                fontWeight: 400,
                color: '#9ADBCB',
                textShadow: '0 0 18px rgba(111,175,155,0.22), 0 2px 8px rgba(0,0,0,0.16)',
                letterSpacing: '0.005em',
              }}>
              perfect journey.
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42, duration:0.55 }}
            className="text-[0.95rem] leading-relaxed mb-6"
            style={{ color:'rgba(255,255,255,0.72)', maxWidth:'24rem' }}>
            Discover destinations, plan itineraries, and explore the world effortlessly.
          </motion.p>

          {/* ── Search Bar ── */}
          <motion.div initial={{ opacity:0, y:12, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay:0.50, duration:0.55, ease:[0.22,1,0.36,1] }}
            className="relative mb-4" ref={searchContainerRef}>

            <AnimatePresence>
              {showToast && (
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                  className="absolute -top-10 left-4 bg-white px-4 py-1.5 rounded-full shadow-lg border border-[#E5E7EB] z-10 pointer-events-none">
                  <span className="text-xs font-semibold text-[#2f6f5e]">✨ How about this?</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div animate={{ scale: isSearchFocused ? 1.012 : 1 }} transition={{ duration:0.18 }}
              className={`bg-white rounded-full flex items-center gap-2 p-1.5 transition-all duration-200 ${
                isSearchFocused
                  ? 'shadow-[0_0_0_4px_rgba(47,111,94,0.18),0_14px_44px_rgba(0,0,0,0.22)] border border-[#2f6f5e]/40'
                  : 'shadow-[0_12px_40px_rgba(0,0,0,0.24)] border border-white/80 hover:shadow-[0_16px_50px_rgba(0,0,0,0.30)]'
              }`}>
              <div className="flex-1 flex items-center pl-4 gap-3 relative">
                <Search className={`w-4 h-4 shrink-0 transition-colors ${isSearchFocused ? 'text-[#2f6f5e]' : 'text-[#9CA3AF]'}`} />
                {!searchValue && !isSearchFocused && (
                  <AnimatePresence mode="wait">
                    <motion.span key={phIdx}
                      initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}
                      transition={{ duration:0.28 }}
                      className="absolute left-8 text-[#9CA3AF] text-sm font-medium pointer-events-none">
                      {PLACEHOLDERS[phIdx]}
                    </motion.span>
                  </AnimatePresence>
                )}
                <input type="text" value={searchValue}
                  onChange={e => { setSearchValue(e.target.value); if (!isSearchFocused) setIsSearchFocused(true); }}
                  onFocus={() => setIsSearchFocused(true)} onKeyDown={handleKeyDown}
                  placeholder={isSearchFocused ? 'Where do you want to go?' : ''}
                  className="w-full bg-transparent border-none outline-none text-[#111827] text-sm font-medium py-2.5 relative z-10" />
              </div>
              <div className="flex items-center gap-1.5 pr-1.5">
                <motion.button onClick={handleSurpriseMe} whileHover={{ scale:1.1 }} whileTap={{ scale:0.90 }}
                  animate={isSurprising ? { rotate:360 } : { rotate:0 }} transition={{ duration:0.45 }}
                  className="w-9 h-9 bg-[#F9FAFB] hover:bg-[#F3F4F6] rounded-full flex items-center justify-center border border-[#E5E7EB] transition-colors" title="Surprise Me">
                  <span className="text-base">🎲</span>
                </motion.button>
                <motion.button onClick={() => navigate('/ai-generator')}
                  whileHover={{ scale:1.05, y:-1 }} whileTap={{ scale:0.96 }}
                  className="relative overflow-hidden px-6 py-2.5 rounded-full font-bold text-sm text-white whitespace-nowrap focus:outline-none group"
                  style={{ background:'linear-gradient(135deg,#2f6f5e 0%,#3f8f78 100%)', boxShadow:'0 6px 22px rgba(47,111,94,0.42)' }}>
                  <span className="relative z-10">Generate Trip ✨</span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </motion.button>
              </div>
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
                  className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.16)] overflow-hidden z-40 py-2">
                  {suggestions.length === 0 ? (
                    <p className="text-[#9CA3AF] text-sm px-4 py-8 text-center">No results — try Goa, Paris or Bali</p>
                  ) : (
                    <div className="max-h-[280px] overflow-y-auto scrollbar-hide">
                      {!debouncedSearchValue.trim() && <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1 mt-2 px-4">✨ Smart Suggestions</p>}
                      {suggestions.map((sug, index) => (
                        <button key={sug.id} onClick={() => handleSelectSuggestion(sug)} onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${selectedIndex===index ? 'bg-[#F3F4F6]' : 'hover:bg-[#F9FAFB]'}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${selectedIndex===index ? 'bg-[rgba(47,111,94,0.10)]' : 'bg-[#F3F4F6]'}`}>{sug.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${selectedIndex===index ? 'text-[#2f6f5e]' : 'text-[#111827]'}`}>{sug.title}</p>
                            {sug.subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{sug.subtitle}</p>}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] px-2 py-0.5 bg-[#F3F4F6] rounded-md shrink-0">{sug.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── All chips — flex-wrap, balanced ── */}
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.60, duration:0.45 }}
            style={{ display:'flex', flexWrap:'wrap', gap:'12px 14px', maxWidth:'520px' }}
          >
            {[...CHIPS_ROW1, ...CHIPS_ROW2].map((chip, idx) => {
              const isTheme = CHIPS_ROW1.some(c => c.id === chip.id);
              const isActive = isTheme && activeTheme === chip.id;
              const handleClick = isTheme
                ? () => setActiveTheme(chip.id)
                : () => setSearchValue(chip.search ?? chip.label);
              return (
                <motion.button
                  key={chip.id}
                  onClick={handleClick}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.62 + idx * 0.055, duration:0.32 }}
                  whileHover={{ 
                    y: -2, 
                    backgroundColor: isActive ? 'rgba(142, 215, 196, 0.35)' : 'rgba(255, 255, 255, 0.75)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
                  }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    minWidth: '120px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    background: isActive ? 'rgba(142, 215, 196, 0.15)' : 'rgba(255, 255, 255, 0.45)',
                    color: isActive ? '#1f6f63' : '#374151',
                    border: isActive ? '1px solid rgba(142, 215, 196, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <motion.span whileHover={{ scale:1.25 }} transition={{ duration:0.18 }} style={{ fontSize:'14px' }}>{chip.icon}</motion.span>
                  {chip.label}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── AI Pills (bottom right) ── */}
      <div className="absolute bottom-14 right-8 z-20">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-2 text-right" style={{ color:'rgba(255,255,255,0.40)' }}>✨ AI suggestions for you</p>
        <div className="flex gap-2.5">
          <AnimatePresence mode="popLayout">
            {[0,1,2].map(offset => {
              const pill = AI_PILLS[(pillBase + offset) % AI_PILLS.length];
              return (
                <motion.button key={`${pillBase}-${offset}`}
                  onClick={() => { setSearchValue(pill.label); navigate('/ai-generator'); }}
                  initial={{ opacity:0, y:14, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:-10, scale:0.9 }}
                  transition={{ duration:0.38, ease:[0.22,1,0.36,1], delay: offset * 0.05 }}
                  whileHover={{ y:-4, scale:1.05 }} whileTap={{ scale:0.96 }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold text-white whitespace-nowrap"
                  style={{ background:'rgba(15,23,42,0.62)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.14)', boxShadow:'0 4px 16px rgba(0,0,0,0.20)' }}>
                  <span className="text-base">{pill.icon}</span>{pill.label}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <motion.div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.3, duration:0.6 }}>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color:'rgba(255,255,255,0.55)' }}>Scroll to explore</span>
        <motion.div animate={{ y:[0,6,0] }} transition={{ duration:1.4, repeat:Infinity, ease:'easeInOut' }}
          className="text-base" style={{ color:'rgba(255,255,255,0.55)' }}>↓</motion.div>
      </motion.div>
    </section>
  );
}
