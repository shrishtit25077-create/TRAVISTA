import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, MapPin, Calendar, Wallet, Download, Map as MapIcon, RotateCcw, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateTrip } from '../../services/ai';
import TypingText from '../../components/UI/TypingText';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const { user, addItinerary } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.destination;

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

  useEffect(() => {
    if (destination) {
      handleSend(destination);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  const handleSend = async (customInput = null) => {
    const text = customInput || input;
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    try {
      const prompt = `Plan a trip to ${text}. Please include suggested duration, budget, and activities (adventure, culture, etc.). Keep formatting clear and readable with sections.`;
      const responseText = await generateTrip(prompt);
      
      const tripObj = {
        id: Date.now(),
        destination: text,
        createdAt: new Date().toISOString(),
        tripText: responseText
      };

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: `Here is a custom itinerary for ${text}:`,
        tripText: responseText
      }]);
      
      addItinerary(tripObj);
      setItinerary(tripObj);
    } catch (error) {
      toast.error("AI service temporarily unavailable");
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: "AI service temporarily unavailable. Please try again later."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-180px)] relative px-8">
      
      {/* Header */}
      <div className="mb-10 text-center space-y-2">
        {destination ? (
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            Planning trip to <span className="text-emerald-500">{destination}</span>
          </h1>
        ) : (
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            AI <span className="text-emerald-500">Planner</span>
          </h1>
        )}
        <p className="text-gray-400 font-medium text-sm">Conversational travel architecting powered by Travista AI.</p>
      </div>

      {/* Chat Console */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-12 space-y-4">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            <ChatBubble {...msg} isLatest={idx === messages.length - 1 && !msg.trip} />
            
            {msg.tripText && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-13 bg-white/70 backdrop-blur rounded-2xl shadow-md p-6 mb-12 whitespace-pre-wrap text-gray-800 leading-relaxed font-medium"
              >
                {msg.tripText}
              </motion.div>
            )}
          </div>
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
            disabled={!input.trim() || isTyping}
            className="px-6 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-50 font-bold text-sm gap-2 whitespace-nowrap"
          >
            {isTyping ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Trip
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
