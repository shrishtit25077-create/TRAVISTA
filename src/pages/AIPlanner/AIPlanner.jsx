import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, MapPin, Calendar, Wallet, Download, Map as MapIcon, RotateCcw, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateDetailedItinerary } from '../../services/aiService';
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

  const generateTrip = (query) => {
    const dest = query.trim();
    return {
      id: Date.now(),
      destination: dest,
      createdAt: new Date().toISOString(),
      budget: { stay: 18000, food: 6000, travel: 12000, activities: 5000, total: 41000 },
      days: [
        {
          day: 1,
          activities: [
            { id: `a-${Date.now()}-1`, time: "Morning", title: "Arrival & Hotel Check-in" },
            { id: `a-${Date.now()}-2`, time: "Afternoon", title: "Orientation Walk & Neighbourhood Explore" },
            { id: `a-${Date.now()}-3`, time: "Evening", title: "Welcome Dinner at Local Restaurant" },
          ]
        },
        {
          day: 2,
          activities: [
            { id: `a-${Date.now()}-4`, time: "Morning", title: "City Highlights Tour" },
            { id: `a-${Date.now()}-5`, time: "Afternoon", title: "Visit Top Landmark / Museum" },
            { id: `a-${Date.now()}-6`, time: "Evening", title: "Sunset Viewpoint + Street Food" },
          ]
        },
        {
          day: 3,
          activities: [
            { id: `a-${Date.now()}-7`, time: "Morning", title: "Adventure Activity / Nature Trip" },
            { id: `a-${Date.now()}-8`, time: "Afternoon", title: "Scenic Drive or Local Market" },
            { id: `a-${Date.now()}-9`, time: "Evening", title: "Cultural Show or Night Market" },
          ]
        },
        {
          day: 4,
          activities: [
            { id: `a-${Date.now()}-10`, time: "Morning", title: "Breakfast at Iconic Café" },
            { id: `a-${Date.now()}-11`, time: "Afternoon", title: "Cultural Heritage Site Visit" },
            { id: `a-${Date.now()}-12`, time: "Evening", title: "Fine Dining Experience" },
          ]
        },
        {
          day: 5,
          activities: [
            { id: `a-${Date.now()}-13`, time: "Morning", title: "Leisurely Breakfast & Packing" },
            { id: `a-${Date.now()}-14`, time: "Afternoon", title: "Last-minute Shopping & Souvenirs" },
            { id: `a-${Date.now()}-15`, time: "Evening", title: "Departure" },
          ]
        },
      ]
    };
  };

  const handleSend = (customInput = null) => {
    const text = customInput || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const trip = generateTrip(text);
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: `Architecting your dream journey to ${text}... I've designed a bespoke ${trip.days.length}-day itinerary with ${trip.days.reduce((acc, d) => acc + d.activities.length, 0)} activities.`,
        trip
      }]);
      
      addItinerary(trip);
      setItinerary(trip);

      setIsTyping(false);
    }, 1500);
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
            
            {msg.trip && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-13 bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm mb-12"
              >
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                       <Sparkles className="w-3 h-3" /> Itinerary Ready
                    </div>
                    {msg.trip.budget && (
                      <span className="text-xs font-bold text-slate-500">Est. ₹{(msg.trip.budget.total/1000).toFixed(0)}k</span>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 capitalize mb-1">{msg.trip.destination}</h2>
                    <p className="text-emerald-600 font-bold text-sm">
                      {Array.isArray(msg.trip.days) ? msg.trip.days.length : msg.trip.days} Days · {' '}
                      {Array.isArray(msg.trip.days)
                        ? msg.trip.days.reduce((acc, d) => acc + d.activities.length, 0)
                        : (msg.trip.plan?.length || 0)} Activities
                    </p>
                  </div>

                  <div className="space-y-3">
                    {Array.isArray(msg.trip.days)
                      ? msg.trip.days.slice(0, 2).map((d, i) => (
                          <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                            <p className="font-black text-emerald-500 text-xs uppercase tracking-wider">Day {d.day}</p>
                            {d.activities.slice(0, 2).map((act, ai) => (
                              <p key={ai} className="text-gray-600 text-sm font-medium">
                                <span className="text-gray-400">{act.time} · </span>{act.title}
                              </p>
                            ))}
                          </div>
                        ))
                      : msg.trip.plan?.slice(0, 3).map((day, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="font-black text-emerald-500 w-16 pt-0.5">DAY {i+1}</span>
                            <span className="text-gray-700 font-medium">{day.replace(`Day ${i+1}: `, '')}</span>
                          </div>
                        ))
                    }
                    {Array.isArray(msg.trip.days) && msg.trip.days.length > 2 && (
                      <p className="text-xs text-gray-400 font-bold text-center">+{msg.trip.days.length - 2} more days in full view</p>
                    )}
                  </div>
                  
                  <button onClick={() => navigate('/itineraries')} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 mt-4">
                    Open Full Planner <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
