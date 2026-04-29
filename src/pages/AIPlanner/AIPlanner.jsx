import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, MapPin, Calendar, Wallet, Download, Map as MapIcon, RotateCcw, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateDetailedItinerary } from '../../services/aiService';
import TypingText from '../../components/UI/TypingText';
import toast from 'react-hot-toast';

const ChatBubble = ({ type, content, isLatest }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex gap-4 ${type === 'user' ? 'flex-row-reverse' : 'flex-row'} mb-8`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
      type === 'user' ? 'bg-gray-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    }`}>
      {type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
    
    <div className={`max-w-[75%] p-5 rounded-[1.5rem] text-[13px] font-medium leading-relaxed ${
      type === 'user' 
        ? 'bg-gray-900 text-white rounded-tr-none' 
        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
    }`}>
      {type === 'bot' && isLatest ? (
        <TypingText text={content} className="text-[13px]" delay={10} />
      ) : (
        <p>{content}</p>
      )}
    </div>
  </motion.div>
);

const SuggestionChip = ({ label, onClick }) => (
  <button 
    onClick={() => onClick(label)}
    className="px-5 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
  >
    {label}
  </button>
);

const AIPlanner = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: `Hello ${user?.name || 'Explorer'}! I'm your AI Planner. Where shall we explore next? (e.g., "Plan a 5-day Kyoto trip").` }
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
      const mockParams = { destination: text, days: 5, budget: 'Medium', interests: [] };
      const response = await generateDetailedItinerary(mockParams);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          content: `Architecting your dream journey to ${text}... I've designed a bespoke 5-day itinerary. Would you like to view it on the map?` 
        }]);
        setItinerary(response);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      toast.error("Generation failed.");
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-180px)] relative px-8">
      
      {/* Header */}
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">AI <span className="text-emerald-500">Planner</span></h1>
        <p className="text-gray-400 font-medium text-sm">Conversational travel architecting powered by Travista AI.</p>
      </div>

      {/* Chat Console */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-12 space-y-4">
        {messages.map((msg, idx) => (
          <ChatBubble key={msg.id} {...msg} isLatest={idx === messages.length - 1} />
        ))}
        
        {isTyping && (
          <div className="flex gap-4 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-[1.5rem] rounded-tl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          </div>
        )}
        
        {itinerary && !isTyping && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-13 bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm mb-12"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                   <Sparkles className="w-3 h-3" /> Itinerary Ready
                </div>
                <div className="flex gap-2">
                   <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-emerald-600 transition-colors"><MapIcon className="w-4 h-4" /></button>
                   <button className="p-2.5 bg-gray-900 text-white rounded-xl"><Download className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-50">
                 <div><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Duration</p><p className="font-bold text-gray-900 text-sm">5 Days</p></div>
                 <div><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Budget</p><p className="font-bold text-gray-900 text-sm">₹85,000</p></div>
                 <div><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Interest</p><p className="font-bold text-gray-900 text-sm">Culture</p></div>
              </div>
              
              <button className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                View Full Breakdown <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Center */}
      <div className="pb-8 space-y-6">
        {!itinerary && !isTyping && (
          <div className="flex flex-wrap gap-2.5 justify-center">
            {["5-day Bali Trip", "Luxury Paris", "Kyoto Culture"].map(s => (
              <SuggestionChip key={s} label={s} onClick={(l) => handleSend(l)} />
            ))}
          </div>
        )}

        <div className="relative bg-white border border-gray-100 p-2 rounded-[1.5rem] shadow-sm flex items-center gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Where next? (e.g. Plan a 5-day Bali trip)" 
            className="flex-1 bg-transparent px-5 py-3 text-[13px] font-medium text-gray-900 placeholder-gray-300 outline-none"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
