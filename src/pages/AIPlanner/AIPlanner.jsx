import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Calendar, Wallet, Utensils, Bed,
  Cloud, RefreshCcw, Bot, ChevronRight, Compass,
  Clock, MapPin, Loader2, ArrowUp, Lightbulb, Download,
  Plane, X, Plus, Trash2, Edit3, Share2, ArrowLeft, MoreHorizontal
} from 'lucide-react';
import { generateNewTrip } from '../../services/ai';
import { downloadItineraryPDF } from '../../services/pdfExport';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';

const FlightPanel = lazy(() => import('./FlightPanel'));

// ─── Typing Indicator ────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex gap-1.5 px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm w-16">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
      />
    ))}
  </div>
);

// ─── Trip Preview Card ────────────────────────────────────────────────────────

const TripPreviewCard = ({ plan, onOpen }) => {
  const { photoUrl } = useDestinationPhoto(plan.title || 'Travel');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/40 group"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={photoUrl} alt={plan.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-6">
          <h3 className="text-white font-black text-xl leading-tight">{plan.title}</h3>
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{plan.days?.length || 0} Days • {plan.budget}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-2xl">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Flights Est.</span>
            <span className="text-sm font-black text-gray-900">₹12,400+</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Hotels Est.</span>
            <span className="text-sm font-black text-gray-900">₹8,500/nt</span>
          </div>
        </div>

        <button
          onClick={onOpen}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
        >
          Open Itinerary
        </button>
      </div>
    </motion.div>
  );
};

// ─── Itinerary Editor ─────────────────────────────────────────────────────────

const ItineraryEditor = ({ plan, onBack }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [localPlan, setLocalPlan] = useState(plan);
  const [isEditing, setIsEditing] = useState(null); // { dayIdx, slot, index }
  const [flightOpen, setFlightOpen] = useState(false);

  const currentDay = localPlan.days?.[activeDay] || {};

  const handleEdit = (dayIdx, slot, index, newValue) => {
    const newPlan = { ...localPlan };
    newPlan.days[dayIdx][slot] = newValue;
    setLocalPlan(newPlan);
    setIsEditing(null);
  };

  const addDay = () => {
    const newDay = {
      day: localPlan.days.length + 1,
      title: 'New Adventures',
      morning: 'Exploring hidden spots',
      afternoon: 'Local culture immersion',
      evening: 'Relaxing at the hub',
      stay: 'Nearby Stay',
      food: 'Local Street Food'
    };
    setLocalPlan({ ...localPlan, days: [...localPlan.days, newDay] });
    setActiveDay(localPlan.days.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="fixed inset-0 z-[150] bg-[#fafaf9] flex flex-col"
    >
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
          <div>
            <h2 className="text-base font-black text-gray-900">{localPlan.title}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{localPlan.days.length} Days Itinerary</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFlightOpen(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">
            <Plane size={14} /> Book Flights
          </button>
          <button onClick={() => downloadItineraryPDF(localPlan)} className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg">
            <Download size={16} />
          </button>
          <button className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
            {localPlan.days.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${activeDay === i
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                  }`}
              >
                Day {d.day}
              </button>
            ))}
            <button
              onClick={addDay}
              className="shrink-0 w-11 h-11 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Day Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-gray-900">{currentDay.title}</h3>
              <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
                <Edit3 size={16} />
              </button>
            </div>

            {['morning', 'afternoon', 'evening'].map((slot) => (
              <div key={slot} className="group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{slot}</span>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative">
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">{currentDay[slot]}</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-2 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-500"><Edit3 size={14} /></button>
                    <button className="p-2 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}

            {/* Extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
              <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-[2.5rem]">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils size={16} className="text-orange-500" />
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Dining</span>
                </div>
                <p className="text-xs font-bold text-gray-700">{currentDay.food}</p>
              </div>
              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2.5rem]">
                <div className="flex items-center gap-2 mb-4">
                  <Bed size={16} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Accommodation</span>
                </div>
                <p className="text-xs font-bold text-gray-700">{currentDay.stay}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <AnimatePresence>
          {flightOpen && (
            <FlightPanel plan={localPlan} onClose={() => setFlightOpen(false)} />
          )}
        </AnimatePresence>
      </Suspense>
    </motion.div>
  );
};

// ─── Main AI Planner Component ────────────────────────────────────────────────

const AIPlanner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewingItinerary, setViewingItinerary] = useState(null);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('travista_ai_chats');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('travista_ai_chats', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    if (urlPrompt) {
      setSearchParams({}, { replace: true });
      handleSend(decodeURIComponent(urlPrompt));
    }
  }, [searchParams]);

  const handleSend = async (overriddenQuery = null) => {
    const text = overriddenQuery || query;
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now(), type: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const plan = await generateNewTrip(text);
      const aiMsg = { id: Date.now() + 1, type: 'ai', content: plan };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('[AI Planner]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-50 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900">Travista AI</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Always Online</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 pb-40">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <div className="w-16 h-16 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <Sparkles size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">How can I help you explore?</h2>
            <p className="text-sm text-gray-400 max-w-xs font-medium">Try "10 day trip to Europe on a budget" or "Weekend getaway in Goa".</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'user' ? (
                <div className="max-w-[80%] bg-gray-900 text-white px-5 py-3 rounded-3xl rounded-tr-sm shadow-xl shadow-gray-200">
                  <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="w-full max-w-xl space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <Bot size={12} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Travista AI</span>
                  </div>
                  <TripPreviewCard plan={msg.content} onOpen={() => setViewingItinerary(msg.content)} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex flex-col gap-4">
            <TypingIndicator />
            <div className="w-full max-w-sm h-64 bg-gray-50 rounded-[2rem] animate-pulse border border-gray-100" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-8 pb-8 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">

          {messages.length === 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
              {['7 days in Tokyo', 'Paris weekend', 'Goa solo trip', 'Bali adventure'].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="shrink-0 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Message Travista AI..."
              className="w-full h-16 pl-6 pr-20 bg-white border border-gray-200 rounded-[2rem] text-sm font-bold text-gray-900 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-xl shadow-gray-200/40"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 h-12 px-6 bg-gray-900 hover:bg-emerald-600 disabled:bg-gray-100 text-white rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Full Editor Overlay */}
      <AnimatePresence>
        {viewingItinerary && (
          <ItineraryEditor
            plan={viewingItinerary}
            onBack={() => setViewingItinerary(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPlanner;
