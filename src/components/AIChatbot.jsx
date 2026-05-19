import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Mic, MapPin, Calendar, Compass, Minus, Loader2 } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Best cafes in Paris",
  "3-day Bali itinerary",
  "Luxury trip to Switzerland",
  "Budget-friendly Japan guide",
  "Romantic destinations in Europe"
];

// Fake AI Response System
const getAIResponse = (prompt) => {
  const lowercasePrompt = prompt.toLowerCase();

  if (lowercasePrompt.includes("paris") || lowercasePrompt.includes("cafes")) {
    return {
      text: "Paris has an incredible cafe culture. Here are my top premium recommendations for your trip:",
      cards: [
        { type: "place", title: "Café de Flore", desc: "Historic coffeehouse in Saint-Germain-des-Prés." },
        { type: "place", title: "Le Train Bleu", desc: "Ornate dining inside Gare de Lyon." }
      ]
    };
  }

  if (lowercasePrompt.includes("bali") || lowercasePrompt.includes("3-day")) {
    return {
      text: "A 3-day getaway to Bali is short but magical. I suggest focusing on Ubud and Seminyak.",
      badges: ["Tropical", "Relaxation", "₹ 25,000 est."],
      cards: [
        { type: "itinerary", day: "Day 1", desc: "Arrival & Sunset at Tanah Lot temple." },
        { type: "itinerary", day: "Day 2", desc: "Ubud Monkey Forest & Tegalalang Rice Terraces." },
        { type: "itinerary", day: "Day 3", desc: "Beach club hopping in Seminyak before departure." }
      ]
    };
  }

  if (lowercasePrompt.includes("switzerland") || lowercasePrompt.includes("luxury")) {
    return {
      text: "Switzerland is the pinnacle of luxury travel. Consider staying in Zermatt or St. Moritz.",
      badges: ["Luxury", "Mountains", "Flight + Train"],
      cards: [
        { type: "place", title: "Badrutt's Palace", desc: "Iconic 5-star luxury hotel in St. Moritz." },
        { type: "place", title: "Glacier Express", desc: "World's slowest express train with panoramic views." }
      ]
    };
  }

  if (lowercasePrompt.includes("japan") || lowercasePrompt.includes("budget")) {
    return {
      text: "Japan on a budget is absolutely possible! Use a JR Pass and stay in premium capsule hotels or ryokans.",
      badges: ["Budget", "Culture", "Bullet Train"],
      cards: [
        { type: "itinerary", day: "Tokyo", desc: "Explore Akihabara & eat affordable street food in Shinjuku." },
        { type: "itinerary", day: "Kyoto", desc: "Free entry to Fushimi Inari Shrine & budget temple visits." }
      ]
    };
  }

  return {
    text: "That sounds like a wonderful travel idea! I can help you build a personalized itinerary, estimate costs, or find the best places to stay. Would you like me to generate a full planner for this?",
    badges: ["AI Assistant", "Ready to Plan"]
  };
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm Travista AI. Where would you like to travel next?", initial: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const messagesEndRef = useRef(null);

  // Smart stacking logic: detect if PWA banner is likely visible
  useEffect(() => {
    const dismissed = localStorage.getItem('travista_pwa_dismissed');
    if (dismissed) {
      setIsBannerVisible(false);
      return;
    }

    const handler = (e) => {
      // Small delay to match PWA banner's delay
      setTimeout(() => setIsBannerVisible(true), 3500);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsBannerVisible(false));

    // Check if we already have a hint that it might be showing
    // (This is an approximation since we can't easily see sibling state without context)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  const handleSend = async (text) => {
    const prompt = text || inputValue.trim();
    if (!prompt) return;

    // Add user message
    const newUserMsg = { role: 'user', text: prompt };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Fake delay
    setTimeout(() => {
      const response = getAIResponse(prompt);
      setMessages(prev => [...prev, { role: 'ai', ...response }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // 1.5s to 2.5s delay
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ── Premium Floating AI Assistant FAB ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            style={{ position: 'fixed', bottom: isBannerVisible ? 160 : 24, right: 24, zIndex: 999 }}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            className="flex flex-col items-center gap-2.5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Tooltip — slides in above FAB on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.88 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="pointer-events-none select-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(6,36,28,0.96) 100%)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 12,
                    padding: '6px 14px',
                    color: '#a7f3d0',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(16,185,129,0.1)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  ✦ Ask Travista AI
                </motion.div>
              )}
            </AnimatePresence>

            {/* The FAB circle itself */}
            <motion.button
              onClick={toggleChat}
              animate={{ y: [0, -6, 0] }}
              transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' } }}
              whileHover={{ scale: 1.12, y: 0 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                position: 'relative',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
                background: 'transparent',
              }}
            >
              {/* Outer ambient glow — always on, intensifies on hover */}
              <motion.div
                animate={{
                  boxShadow: isHovered
                    ? '0 0 0 12px rgba(16,185,129,0.12), 0 0 40px rgba(16,185,129,0.3)'
                    : '0 0 0 0px rgba(16,185,129,0), 0 0 20px rgba(16,185,129,0.15)',
                }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}
              />

              {/* Slow-expanding pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', repeatType: 'loop' }}
                style={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(16,185,129,0.4)',
                  pointerEvents: 'none',
                }}
              />

              {/* Second offset pulse for depth */}
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', repeatType: 'loop', delay: 1 }}
                style={{
                  position: 'absolute',
                  inset: -3,
                  borderRadius: '50%',
                  border: '1px solid rgba(16,185,129,0.25)',
                  pointerEvents: 'none',
                }}
              />

              {/* Main circle body */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: isHovered
                  ? 'linear-gradient(145deg, rgba(16,185,129,0.25) 0%, rgba(6,78,59,0.35) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: isHovered
                  ? '1.5px solid rgba(16,185,129,0.5)'
                  : '1.5px solid rgba(255,255,255,0.22)',
                boxShadow: isHovered
                  ? '0 8px 32px rgba(16,185,129,0.28), inset 0 1px 0 rgba(255,255,255,0.3)'
                  : '0 8px 28px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
                flexShrink: 0,
              }}>
                {/* Inner emerald tint fill */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 35%, rgba(52,211,153,0.15) 0%, transparent 70%)',
                }} />

                {/* Icon */}
                <Sparkles
                  size={22}
                  style={{
                    color: isHovered ? '#34d399' : '#10b981',
                    position: 'relative',
                    zIndex: 1,
                    filter: isHovered ? 'drop-shadow(0 0 6px rgba(52,211,153,0.7))' : 'none',
                    transition: 'all 0.25s ease',
                  }}
                />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: isMinimized ? 'calc(100% - 64px)' : 0,
              scale: 1
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] bg-white/95 backdrop-blur-2xl rounded-t-3xl md:rounded-[28px] shadow-2xl border border-white/40 z-[1050] overflow-hidden flex flex-col pointer-events-auto ${isMinimized ? 'h-[64px]' : 'h-[85vh] md:h-[600px] max-h-[800px]'}`}
          >
            {/* Header */}
            <div
              className="h-16 px-5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-emerald-500/10 cursor-pointer shrink-0"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Travista AI</h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
                  <Minus size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-white/50 hover:text-red-500 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar relative bg-slate-50/50">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={`msg-${msg.role}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm shadow-md'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                        }`}>
                        {msg.text}
                      </div>

                      {/* AI Extra Content (Badges/Cards) */}
                      {msg.role === 'ai' && (msg.badges || msg.cards) && (
                        <div className="mt-3 w-full space-y-3">
                          {msg.badges && (
                            <div className="flex flex-wrap gap-2">
                              {msg.badges.map((badge, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100/50">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}

                          {msg.cards && (
                            <div className="space-y-2 w-[85%]">
                              {msg.cards.map((card, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => window.location.href = '/planner'}
                                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3 group hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95 pointer-events-auto relative overflow-hidden"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    {card.type === 'place' ? <MapPin size={16} /> : <Calendar size={16} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{card.title || card.day}</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{card.desc}</p>
                                  </div>
                                  <div className="absolute top-0 right-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white to-transparent">
                                    <Sparkles size={12} className="text-emerald-500" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                      <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-3 items-center">
                        <div className="flex gap-1.5 items-center">
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">Travista AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Footer / Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                  {/* Suggested Prompts (horizontal scroll) */}
                  {messages.length < 3 && !isTyping && (
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-4 pb-1 touch-pan-x">
                      {SUGGESTED_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 active:scale-95 text-xs font-medium rounded-full border border-slate-200 hover:border-emerald-300 transition-all duration-200 cursor-pointer pointer-events-auto flex items-center gap-1.5"
                        >
                          <Sparkles size={10} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity hidden" />
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Box */}
                  <div className="relative flex items-center group">
                    <button className="absolute left-3 text-slate-400 hover:text-emerald-500 transition-colors z-10 p-1 rounded-md hover:bg-slate-100">
                      <Mic size={18} />
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isTyping ? "AI is generating..." : "Message Travista AI..."}
                      disabled={isTyping}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-14 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-400 focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-emerald-400/20 shadow-sm focus:shadow-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed caret-emerald-500"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping}
                      className={`absolute right-2 p-2 rounded-xl transition-all duration-200 z-10 flex items-center justify-center ${inputValue.trim() && !isTyping
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className={inputValue.trim() ? 'translate-x-0.5' : ''} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
