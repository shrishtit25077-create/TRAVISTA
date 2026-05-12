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
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm Travista AI. Where would you like to travel next?", initial: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleChat}
            className="fixed bottom-[180px] right-6 md:bottom-[200px] md:right-8 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex items-center justify-center text-white z-[9999] hover:scale-110 transition-transform group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full blur animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Sparkles size={24} className="relative z-10" />
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
              Ask Travista AI
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          </motion.button>
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
            className={`fixed bottom-0 right-0 md:bottom-32 md:right-8 w-full md:w-[400px] bg-white/90 backdrop-blur-2xl rounded-t-3xl md:rounded-3xl shadow-2xl border border-white/40 z-[10000] overflow-hidden flex flex-col ${isMinimized ? 'h-[64px]' : 'h-[85vh] md:h-[600px] max-h-[800px]'}`}
          >
            {/* Header */}
            <div 
              className="h-16 px-5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-emerald-500/10 cursor-pointer shrink-0"
              onClick={() => setIsMinimized(!isMinimized)}
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
                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
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
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                        msg.role === 'user' 
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
                                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3 group hover:border-emerald-200 transition-colors cursor-pointer">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                                    {card.type === 'place' ? <MapPin size={16}/> : <Calendar size={16}/>}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800">{card.title || card.day}</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{card.desc}</p>
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
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center h-[52px]">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
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
                          className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-medium rounded-full border border-slate-200 hover:border-emerald-200 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Box */}
                  <div className="relative flex items-center">
                    <button className="absolute left-3 text-slate-400 hover:text-emerald-500 transition-colors">
                      <Mic size={18} />
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about a destination..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-12 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-400 focus:bg-white transition-all focus:ring-4 focus:ring-emerald-500/10"
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping}
                      className="absolute right-2 p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-300 transition-all"
                    >
                      <Send size={14} />
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
