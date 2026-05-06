import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, MapPin, Calendar, Wallet, Download, Map as MapIcon, RotateCcw, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateDetailedItinerary } from '../../services/aiService';
import TypingText from '../../components/UI/TypingText';
import toast from 'react-hot-toast';

const ChatBubble = ({ type, content, isLatest }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex gap-4 ${type === 'user' ? 'flex-row-reverse' : 'flex-row'} mb-8`}
  >
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
      type === 'user' ? 'bg-gray-900 border-gray-800' : 'bg-emerald-50 border-emerald-100'
    }`}>
      {type === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-emerald-600" />}
    </div>
    
    <div className={`max-w-[80%] p-6 rounded-3xl ${
      type === 'user' 
        ? 'bg-gray-900 text-white rounded-tr-none' 
        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-soft'
    }`}>
      {type === 'bot' && isLatest ? (
        <TypingText text={content} className="text-sm font-medium leading-relaxed" delay={10} />
      ) : (
        <p className="text-sm font-medium leading-relaxed">{content}</p>
      )}
    </div>
  </motion.div>
);

const SuggestionChip = ({ label, onClick }) => (
  <button 
    onClick={() => onClick(label)}
    className="px-5 py-2.5 bg-white border border-gray-100 rounded-full text-[11px] font-black uppercase tracking-widest text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
  >
    {label}
  </button>
);

const AIArchitect = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: `Hello ${user?.name || 'Explorer'}! I'm your AI Journey Architect. Where shall we explore next? Give me a destination and your preferred duration (e.g., "Plan a 5-day Kyoto trip").` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customInput = null) => {
    const text = customInput || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    try {
      // Logic to parse input and call generation service
      const mockParams = { destination: text, days: 5, budget: 'Medium', interests: [] };
      const response = await generateDetailedItinerary(mockParams);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          content: `Architecting your dream journey to ${text}... I've designed a bespoke 5-day itinerary focused on local immersion and premium comfort. Would you like to see the full breakdown or view it on the map?` 
        }]);
        setItinerary(response);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      toast.error("Generation Engine encountered an error.");
      setIsTyping(false);
    }
  };

  const suggestions = ["5-day Bali Trip", "Luxury Weekend in Paris", "Budget Solo Trip to Kyoto", "Cultural Tour of Rome"];

  return (
    <div className="flex-1 min-w-0 w-full flex flex-col h-[calc(100vh-160px)] relative px-4 md:px-8">
      
      {/* Chat Console */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-12 pt-8 space-y-4">
        {messages.map((msg, idx) => (
          <ChatBubble key={msg.id} {...msg} isLatest={idx === messages.length - 1} />
        ))}
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <div className="bg-white border border-gray-100 p-6 rounded-3xl rounded-tl-none shadow-soft flex gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          </motion.div>
        )}
        
        {itinerary && !isTyping && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-14 bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-premium mb-12"
          >
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest w-fit">
                      <Sparkles className="w-3 h-3" /> AI Itinerary Ready
                   </div>
                   <h4 className="text-3xl font-black text-gray-900 tracking-tighter">Your Bespoke Journey</h4>
                </div>
                <div className="flex gap-3">
                   <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-emerald-600 transition-colors"><Heart className="w-5 h-5" /></button>
                   <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-cyan-600 transition-colors"><MapIcon className="w-5 h-5" /></button>
                   <button className="p-3 bg-gray-900 text-white rounded-2xl"><Download className="w-5 h-5" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500"><Calendar className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Duration</p><p className="font-bold text-gray-900">5 Days</p></div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500"><Wallet className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Est. Budget</p><p className="font-bold text-gray-900">₹85,000</p></div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500"><MapPin className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Distance</p><p className="font-bold text-gray-900">120 km</p></div>
                 </div>
              </div>
              
              <button className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-4 group">
                Full Breakdown <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Control Center */}
      <div className="pb-8 space-y-6 bg-transparent">
        <AnimatePresence>
          {!itinerary && !isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              {suggestions.map(s => (
                <SuggestionChip key={s} label={s} onClick={(l) => handleSend(l)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative bg-white border border-gray-100 p-2 rounded-[2rem] shadow-premium flex items-center gap-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Where do you want to explore? (e.g. Plan a 5-day solo trip to Bali)" 
              className="flex-1 bg-transparent border-none px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-300 outline-none"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-14 h-14 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIArchitect;
