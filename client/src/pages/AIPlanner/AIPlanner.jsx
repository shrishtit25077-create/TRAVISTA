import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Bot, Plane, Building, Compass, MapPin, Wallet, ArrowRight } from 'lucide-react';
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
      type === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
    }`}>
      {type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
    
    <div className={`max-w-[75%] p-5 rounded-[1.5rem] text-[14px] font-medium leading-relaxed shadow-sm ${
      type === 'user' 
        ? 'bg-slate-900 text-white rounded-tr-none' 
        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
    }`}>
      {type === 'bot' && isLatest ? (
        <TypingText text={content} className="text-[14px]" delay={15} />
      ) : (
        <p>{content}</p>
      )}
    </div>
  </motion.div>
);

const TripCard = ({ plan, destination, tripId, onNavigate }) => {
  if (!plan) return null;
  
  const image = plan.images?.[0] || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800";
  const flight = plan.flights?.[0];
  const stay = plan.stays?.[0];
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
      className="ml-13 mb-12 bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row w-full"
    >
      <div className="w-full md:w-2/5 h-56 md:h-auto relative overflow-hidden group">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={image} 
          alt={destination} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              Top Pick
            </span>
            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Score: {plan.score}
            </span>
          </div>
          <h3 className="text-2xl font-black leading-tight">{destination}</h3>
        </div>
      </div>
      
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100">
              <Plane className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Roundtrip Flight</p>
              <p className="text-sm font-black text-slate-800">{flight?.carrier || 'Select Airlines'}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-lg font-black text-slate-900">₹{flight?.price || 500}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
              <Building className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Recommended Stay</p>
              <p className="text-sm font-black text-slate-800 line-clamp-1">{stay?.name || 'Boutique Hotel'}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-lg font-black text-slate-900">₹{stay?.price || 200}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Est. Budget</p>
            <p className="text-3xl font-black text-emerald-600">₹{plan.totalBudget}</p>
          </div>
          <button 
            onClick={() => onNavigate(tripId)}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-[1.2rem] font-black text-xs tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
          >
            Open Itinerary <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SuggestionChip = ({ label, onClick }) => (
  <button 
    onClick={() => onClick(label)}
    className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
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
    { id: 1, type: 'bot', content: `Hello ${user?.name || 'Explorer'}! I'm your AI Travel Architect. Where shall we explore next?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
  }, [destination]);

  const handleSend = async (customInput = null) => {
    const text = customInput || input;
    if (!text.trim() || isTyping) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    try {
      const prompt = `Plan a trip to ${text}`;
      const planObject = await generateTrip(prompt);
      
      if (!planObject.bestOption) throw new Error("Invalid format from AI");

      const best = planObject.bestOption;
      
      const groupedActivities = {};
      if (best.activities && best.activities.length > 0) {
        best.activities.forEach((a, i) => {
          const d = a.day || 1;
          if (!groupedActivities[d]) groupedActivities[d] = [];
          groupedActivities[d].push({
            id: `a-${Date.now()}-${i}`,
            time: ['Morning', 'Afternoon', 'Evening', 'Night'][groupedActivities[d].length % 4],
            title: `${a.name}${a.description ? ` - ${a.description}` : ''}`
          });
        });
      } else {
        groupedActivities[1] = [];
      }

      const daysArr = Object.keys(groupedActivities).map(Number).sort((a,b) => a - b).map(day => ({
        day,
        activities: groupedActivities[day]
      }));

      const tripObj = {
        id: Date.now(),
        destination: text,
        createdAt: new Date().toISOString(),
        images: best.images || [],
        days: daysArr,
        budget: {
          total: best.totalBudget || 1000,
          stay: best.stays?.[0]?.price || 300,
          activities: best.activities?.reduce((s,a) => s+(a.cost||0), 0) || 200,
          travel: best.flights?.[0]?.price || 500
        }
      };

      addItinerary(tripObj);

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: `I've perfectly architected your journey to ${text}. Here is your tailored blueprint:`,
        plan: best,
        tripId: tripObj.id,
        dest: text
      }]);
      
    } catch (error) {
      let errMessage = "AI service temporarily unavailable. Please try again later.";
      if (error.response?.data?.message?.includes("GEMINI_API_KEY")) {
         errMessage = "Server Error: The GEMINI_API_KEY is missing from the backend server/.env file. Please add it to generate trips!";
      }
      
      toast.error("Generation failed");
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: errMessage
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 w-full flex flex-col h-[calc(100vh-120px)] overflow-hidden relative px-4 md:px-8 pt-8">
      
      {/* Header */}
      <div className="mb-10 text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          AI <span className="text-emerald-500 italic">Architect</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Powered by Gemini. Just tell me where you want to go, and I'll forge the perfect itinerary.
        </p>
      </div>

      {/* Chat Console */}
      <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar pb-12 space-y-4">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            <ChatBubble {...msg} isLatest={idx === messages.length - 1 && !msg.plan} />
            
            {msg.plan && (
              <TripCard 
                plan={msg.plan} 
                destination={msg.dest} 
                tripId={msg.tripId} 
                onNavigate={(id) => navigate(`/itinerary/${id}`)} 
              />
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] rounded-tl-none flex gap-1.5 items-center shadow-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Center */}
      <div className="pb-8 space-y-6 shrink-0 bg-[#F7F9FC]">
        {messages.length === 1 && !isTyping && (
          <div className="flex flex-wrap gap-3 justify-center">
            {["A romantic week in Paris", "Luxury Dubai getaway", "Backpacking through Vietnam"].map(s => (
              <SuggestionChip key={s} label={s} onClick={(l) => handleSend(l)} />
            ))}
          </div>
        )}

        <div className="relative bg-white border-2 border-slate-100 p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center gap-3 focus-within:border-emerald-300 transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your dream destination..." 
            className="flex-1 bg-transparent px-6 py-4 text-[15px] font-bold text-slate-900 placeholder-slate-300 outline-none"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="px-8 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-emerald-600 transition-all disabled:opacity-50 font-black text-[11px] uppercase tracking-widest gap-2 whitespace-nowrap shadow-md"
          >
            {isTyping ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Architect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
