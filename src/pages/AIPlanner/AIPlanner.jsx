import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, Calendar, Wallet, Utensils, Bed,
  Cloud, RefreshCcw, Bot, ChevronRight, Compass,
  Clock, MapPin, Loader2, ArrowUp, Lightbulb, Download, Plane
} from 'lucide-react';
import { generateNewTrip } from '../../services/ai';
import { downloadItineraryPDF } from '../../services/pdfExport';

// Lazy-load the heavy flight panel so it never blocks initial render
const FlightPanel = lazy(() => import('./FlightPanel'));

// ─── Streaming Text ──────────────────────────────────────────────────────────

const StreamingText = ({ text, speed = 12 }) => {
  const [displayed, setDisplayed] = useState('');
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i < text.length) {
      const t = setTimeout(() => { setDisplayed(p => p + text[i]); setI(p => p + 1); }, speed);
      return () => clearTimeout(t);
    }
  }, [i, text, speed]);
  return <span>{displayed}</span>;
};

// ─── Day Card ────────────────────────────────────────────────────────────────

const DayCard = ({ day, index }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      className="border border-gray-100 rounded-xl overflow-hidden bg-white"
    >
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {day.day}
        </span>
        <span className="text-sm font-semibold text-gray-800 flex-1">{day.title}</span>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
          <Bed size={11} /><span className="hidden sm:inline">{day.stay?.split(' ').slice(0, 2).join(' ')}</span>
          <ChevronRight size={13} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { label: 'Morning', icon: '🌅', text: day.morning },
                  { label: 'Afternoon', icon: '☀️', text: day.afternoon },
                  { label: 'Evening', icon: '🌙', text: day.evening },
                ].map((s, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Bed size={12} className="text-emerald-500" />
                  <span>{day.stay}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Utensils size={12} className="text-orange-400" />
                  <span>{day.food}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Itinerary Result ────────────────────────────────────────────────────────

const ItineraryResult = ({ plan }) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [flightOpen, setFlightOpen] = useState(false);

  const handleDownload = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      await downloadItineraryPDF(plan);
    } catch (err) {
      console.error('[PDF] Export failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
  >
    {/* Header */}
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            <StreamingText text={plan.title} speed={25} />
          </h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">
            <StreamingText text={plan.summary} speed={8} />
          </p>
        </div>
        <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Sparkles size={14} className="text-emerald-500" />
        </div>
      </div>

      {/* Meta pills + Book Flights CTA */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { icon: Calendar, text: plan.bestSeason },
          { icon: Wallet, text: plan.budget },
          { icon: Cloud, text: plan.weather },
        ].map(({ icon: Icon, text }, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 font-medium">
            <Icon size={11} className="text-emerald-500" />{text}
          </span>
        ))}
        <button
          onClick={() => setFlightOpen(true)}
          className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all px-3 py-1.5 rounded-lg active:scale-95"
        >
          <Plane size={11} /> Book Flights
        </button>
      </div>
    </div>

    {/* Flight Panel */}
    <Suspense fallback={null}>
      <AnimatePresence>
        {flightOpen && (
          <FlightPanel plan={plan} onClose={() => setFlightOpen(false)} />
        )}
      </AnimatePresence>
    </Suspense>

    {/* Timeline */}
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Clock size={12} className="text-gray-400" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Day-by-Day</span>
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        className="space-y-1.5"
      >
        {plan.days?.map((day, di) => (
          <DayCard key={di} day={day} index={di} />
        ))}
      </motion.div>
    </div>

    {/* Tips + Hidden Gems */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {plan.tips?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={13} className="text-amber-400" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Insider Tips</span>
          </div>
          <ul className="space-y-2">
            {plan.tips.map((tip, ti) => (
              <li key={ti} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
                <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      {plan.hiddenGems?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={13} className="text-purple-400" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Hidden Gems</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plan.hiddenGems.map((gem, gi) => (
              <span key={gi} className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 font-medium">
                {gem}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* CTA Footer */}
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-gray-400">Generated by Travista AI · Always verify locally</p>
      <div className="flex gap-2">
        <button className="text-xs font-semibold text-gray-600 hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50">
          Share
        </button>
        <button
          onClick={handleDownload}
          disabled={pdfLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg"
        >
          {pdfLoading
            ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
            : <><Download size={11} /> Download PDF</>
          }
        </button>
      </div>
    </div>
  </motion.div>
  );
};

// ─── Loading State ────────────────────────────────────────────────────────────

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-3 py-4 px-5 bg-white border border-gray-100 rounded-xl"
  >
    <Loader2 size={16} className="text-emerald-500 animate-spin shrink-0" />
    <div className="flex-1">
      <div className="flex gap-1 mb-2">
        {[0, 150, 300].map(d => (
          <div key={d} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
      <div className="h-2 bg-gray-100 rounded w-48 animate-pulse" />
    </div>
    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Planning...</span>
  </motion.div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onSuggest }) => {
  const suggestions = [
    { label: 'Tokyo, 7 days', query: '7-day trip to Tokyo, Japan, mid-range budget' },
    { label: 'Paris weekend', query: 'Weekend escape to Paris, luxury budget' },
    { label: 'Bali on a budget', query: '5-day budget adventure in Bali, Indonesia' },
    { label: 'NYC solo trip', query: '4-day solo trip to New York City' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="text-center mb-6">
        <div className="inline-flex w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center mb-3">
          <Sparkles size={18} className="text-emerald-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">AI Trip Planner</h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">Describe your ideal trip and get a complete day-by-day itinerary in seconds.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
        {suggestions.map(s => (
          <button
            key={s.query}
            onClick={() => onSuggest(s.query)}
            className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-left hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
          >
            <Compass size={12} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-gray-600 group-hover:text-emerald-700 truncate">{s.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AIPlanner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('travista_ai_messages');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [recentPrompts, setRecentPrompts] = useState(() => {
    try {
      const saved = localStorage.getItem('travista_recent_prompts');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const autoTriggered = useRef(false);

  useEffect(() => {
    localStorage.setItem('travista_ai_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('travista_recent_prompts', JSON.stringify(recentPrompts));
  }, [recentPrompts]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-trigger from BudgetModal redirect: /planner?prompt=...
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    if (urlPrompt && !autoTriggered.current && !loading) {
      autoTriggered.current = true;
      // Clear param immediately so back-navigation doesn't retrigger
      setSearchParams({}, { replace: true });
      handleGenerate(decodeURIComponent(urlPrompt));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleGenerate = async (overriddenQuery = null) => {
    const finalQuery = overriddenQuery || query;
    if (!finalQuery.trim() || loading) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: finalQuery }]);
    setQuery('');
    setLoading(true);

    try {
      const plan = await generateNewTrip(finalQuery);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: plan }]);
      if (!recentPrompts.includes(finalQuery)) {
        setRecentPrompts(prev => [finalQuery, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error('[AI Planner] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem('travista_ai_messages');
    inputRef.current?.focus();
  };

  const chips = recentPrompts.length > 0
    ? recentPrompts
    : ['7-day trip to Kyoto', 'Weekend in Lisbon', 'Backpack through Southeast Asia'];

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50/50">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">AI Trip Planner</h1>
            <p className="text-[10px] text-gray-400">Powered by OpenRouter</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2.5 py-1 rounded-lg hover:bg-gray-100"
          >
            Clear history
          </button>
        )}
      </div>

      {/* ── Chat Feed ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 pb-40">
        <AnimatePresence mode="sync">
          {messages.length === 0 ? (
            <EmptyState onSuggest={handleGenerate} key="empty" />
          ) : (
            messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'user' ? (
                  <div className="max-w-[75%] bg-gray-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm">
                    <p className="text-sm font-medium">{msg.content}</p>
                  </div>
                ) : (
                  <div className="w-full max-w-3xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center">
                        <Bot size={12} className="text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Travista AI</span>
                    </div>
                    <ItineraryResult plan={msg.content} />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {loading && <LoadingState />}
        <div ref={chatEndRef} />
      </div>

      {/* ── Sticky Composer ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 md:px-6 pb-6 pt-8 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pointer-events-auto">

          {/* Quick Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
            {chips.slice(0, 4).map(text => (
              <button
                key={text}
                onClick={() => handleGenerate(text)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-all px-2.5 py-1 rounded-full"
              >
                <Compass size={9} className="text-emerald-400" />
                {text.length > 28 ? text.slice(0, 28) + '…' : text}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-lg shadow-gray-100 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <Sparkles size={16} className="text-emerald-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe your trip… e.g. 5 days in Kyoto, mid budget"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-300 outline-none py-1 font-medium"
              disabled={loading}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !query.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 disabled:opacity-30 transition-all active:scale-95"
            >
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Planning</>
                : <><ArrowUp size={13} /> Generate</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
