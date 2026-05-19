import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, ArrowLeftRight, Loader2, Clock, Zap, Filter,
  ExternalLink, ChevronDown, Users, Calendar, X, Sparkles,
  TrendingDown, Star, Shield, Luggage, Brain, ArrowRight,
  SlidersHorizontal, CheckCircle2
} from 'lucide-react';
import { searchFlights, extractIATA, formatDate, addDays, searchAirports } from '../../services/flightSearch';

// ─── Airline color map ─────────────────────────────────────────────────────────
const AIRLINE_COLORS = {
  '6E': { bg: '#1a1a6e', fg: '#fff', name: 'IndiGo' },
  AI:  { bg: '#c8102e', fg: '#fff', name: 'Air India' },
  UK:  { bg: '#6b21a8', fg: '#fff', name: 'Vistara' },
  SG:  { bg: '#e63946', fg: '#fff', name: 'SpiceJet' },
  EK:  { bg: '#c8a84b', fg: '#1a1a1a', name: 'Emirates' },
  SQ:  { bg: '#003580', fg: '#f5c518', name: 'Singapore Airlines' },
  QR:  { bg: '#5c0623', fg: '#c8a84b', name: 'Qatar Airways' },
  LH:  { bg: '#05164d', fg: '#ffcc00', name: 'Lufthansa' },
  BA:  { bg: '#075aaa', fg: '#eb2226', name: 'British Airways' },
};

const AirlineLogo = ({ code }) => {
  const info = AIRLINE_COLORS[code] || { bg: '#374151', fg: '#fff' };
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black shadow-sm"
      style={{ backgroundColor: info.bg, color: info.fg }}
    >
      {code}
    </div>
  );
};

// ─── Airport Autocomplete ──────────────────────────────────────────────────────
const AirportInput = ({ label, value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (value.length === 3 || value === '') {
      const match = searchAirports(value).find(a => a.code === value);
      setQuery(match ? `${match.city} (${match.code})` : value);
    }
  }, [value]);

  const handleInput = e => {
    const v = e.target.value;
    setQuery(v);
    const results = searchAirports(v);
    setSuggestions(results);
    setShow(results.length > 0);
    if (!v) onChange('');
  };

  const select = a => {
    setQuery(`${a.city} (${a.code})`);
    onChange(a.code);
    setShow(false);
  };

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div className="relative flex-1" ref={ref}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
      <input
        value={query}
        onChange={handleInput}
        onFocus={() => query.length >= 2 && setShow(true)}
        placeholder={placeholder}
        className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/15 transition-all"
      />
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto"
          >
            {suggestions.map((a, i) => (
              <button key={a.code + i} onClick={() => select(a)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-sm font-bold text-slate-900">{a.city}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{a.name}</div>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{a.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Premium Flight Card ───────────────────────────────────────────────────────
const FlightCard = ({ flight, adults, isRecommended }) => {
  const fmt = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 group cursor-pointer ${
        isRecommended ? 'border-emerald-200 shadow-md shadow-emerald-500/10' : 'border-slate-100 shadow-sm hover:border-emerald-100'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-emerald-500/30 flex items-center gap-1">
          <Zap size={10} /> AI Recommended
        </div>
      )}

      <div className="p-5 flex items-center gap-4">
        <AirlineLogo code={flight.airlineCode} />

        <div className="flex-1 min-w-0">
          {/* Route + stops */}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-base font-black text-slate-900">{flight.departure}</span>
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <div className="h-px flex-1 bg-slate-200" />
              <div className="text-center">
                {flight.stops === 0
                  ? <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Nonstop</span>
                  : <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{flight.stops} stop</span>
                }
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <span className="text-base font-black text-slate-900">{flight.arrival}</span>
          </div>

          {/* Meta info row */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="font-bold text-slate-500">{flight.airline}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {flight.duration}</span>
            <span className="flex items-center gap-1"><Luggage size={10} /> 15 kg</span>
            {flight.isMock && <span className="text-amber-400 font-bold">Est.</span>}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="text-right shrink-0 pl-4 border-l border-slate-100">
          <div className="text-xl font-black text-slate-900">{fmt(flight.price)}</div>
          {adults > 1 && <div className="text-[10px] text-slate-400 mb-1">for {adults} travelers</div>}
          <a
            href={flight.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all px-3 py-1.5 rounded-xl shadow-md shadow-emerald-500/20"
          >
            Book <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
    <div className="text-right space-y-2 shrink-0">
      <div className="h-5 bg-slate-100 rounded w-20" />
      <div className="h-6 bg-slate-200 rounded w-16" />
    </div>
  </div>
);

// ─── AI Panel ─────────────────────────────────────────────────────────────────
const AIRecommendationPanel = ({ flights, destination, depart }) => {
  const cheapest = flights.length ? flights.reduce((a, b) => a.price < b.price ? a : b) : null;
  const fmt = p => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
  const day = new Date(depart).toLocaleDateString('en-US', { weekday: 'long' });
  const isCheapDay = ['Tuesday', 'Wednesday', 'Saturday'].includes(day);

  const tips = [
    `Flying on a ${day} is ${isCheapDay ? '15–30% cheaper' : 'average priced'} for this route.`,
    'Booking 21+ days in advance can save up to 40% on fares.',
    `${destination} sees lower fares during shoulder season (Apr–May).`,
    'Mixing airlines for outbound/return can reduce cost by ₹5,000+.',
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/25">
          <Brain size={15} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">AI Travel Advisor</h3>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Smart Insights</p>
        </div>
      </div>

      {/* Cheapest fare */}
      {cheapest && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
            <TrendingDown size={11} /> Cheapest Fare Found
          </p>
          <p className="text-2xl font-black text-slate-900">{fmt(cheapest.price)}</p>
          <p className="text-[11px] text-slate-500 font-medium">{cheapest.airline} · {cheapest.duration}</p>
        </div>
      )}

      {/* Best day */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Calendar size={11} /> Best Travel Day
        </p>
        <p className="text-sm font-black text-slate-800">Tuesday or Wednesday</p>
        <p className="text-[11px] text-slate-400 font-medium mt-1">Typically 15–30% lower fares vs weekends</p>
      </div>

      {/* AI tips */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={11} /> AI Tips
        </p>
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>

      {/* Price trend */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Zap size={11} /> Price Trend
        </p>
        <p className="text-sm font-bold text-emerald-400">Prices dropping this week</p>
        <p className="text-[11px] text-slate-400 font-medium mt-1">Book in the next 3–5 days for the best deal</p>
        <div className="mt-3 flex gap-1">
          {[60, 80, 70, 95, 85, 75, 65].map((h, i) => (
            <div key={i} className="flex-1 flex items-end">
              <div
                className={`w-full rounded-sm transition-all ${i === 6 ? 'bg-emerald-500' : 'bg-slate-600'}`}
                style={{ height: `${h * 0.4}px` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <span key={i} className={`text-[9px] font-bold flex-1 text-center ${i === 6 ? 'text-emerald-400' : 'text-slate-600'}`}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Flight Booking Page ──────────────────────────────────────────────────
const STOP_OPTS = ['Any', 'Nonstop', '1 Stop', '2+ Stops'];
const TIME_OPTS = ['Any time', 'Morning (6–12)', 'Afternoon (12–18)', 'Evening (18–24)'];
const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First'];

export default function FlightBooking() {
  const [from, setFrom] = useState('DEL');
  const [to, setTo]   = useState('CDG');
  const [depart, setDepart] = useState(formatDate(addDays(new Date(), 14)));
  const [returnDate, setReturnDate] = useState(formatDate(addDays(new Date(), 21)));
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('Economy');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [stopFilter, setStopFilter] = useState('Any');
  const [timeFilter, setTimeFilter] = useState('Any time');
  const [maxBudget, setMaxBudget] = useState(150000);
  const [sortBy, setSortBy] = useState('cheapest');

  const handleSearch = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true); setError(null); setSearched(true);
    try {
      const results = await searchFlights({ from, to, depart, returnDate, adults, cabinClass: cabin });
      setFlights(results);
    } catch {
      setError('Could not load flights. Please try again.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, depart, returnDate, adults, cabin]);

  useEffect(() => { if (from && to) handleSearch(); }, []);

  const filtered = flights
    .filter(f => {
      if (stopFilter === 'Nonstop' && f.stops !== 0) return false;
      if (stopFilter === '1 Stop' && f.stops !== 1) return false;
      if (stopFilter === '2+ Stops' && f.stops < 2) return false;
      if (f.price > maxBudget) return false;
      return true;
    })
    .sort((a, b) => sortBy === 'cheapest' ? a.price - b.price : sortBy === 'fastest' ? a.duration?.localeCompare(b.duration) : 0);

  const cheapestFlight = filtered.length ? filtered.reduce((a, b) => a.price < b.price ? a : b) : null;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* ── Top Search Bar ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm px-4 md:px-8 py-4 shrink-0">
        <div className="flex flex-wrap items-end gap-3 max-w-6xl mx-auto">
          {/* From / To */}
          <AirportInput label="From" value={from} onChange={setFrom} placeholder="Origin" />
          <button
            onClick={() => { const t = from; setFrom(to); setTo(t); }}
            className="mb-0.5 w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 flex items-center justify-center transition-all active:scale-90 shrink-0 self-end"
          >
            <ArrowLeftRight size={15} className="text-slate-500" />
          </button>
          <AirportInput label="To" value={to} onChange={setTo} placeholder="Destination" />

          {/* Depart */}
          <div className="min-w-[130px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Depart</label>
            <input type="date" value={depart} min={formatDate(new Date())} onChange={e => setDepart(e.target.value)}
              className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 outline-none focus:border-emerald-400 transition-all" />
          </div>

          {/* Return */}
          <div className="min-w-[130px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Return</label>
            <input type="date" value={returnDate} min={depart} onChange={e => setReturnDate(e.target.value)}
              className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 outline-none focus:border-emerald-400 transition-all" />
          </div>

          {/* Travelers */}
          <div className="w-28">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Travelers</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
              <Users size={13} className="text-slate-400" />
              <input type="number" min={1} max={9} value={adults} onChange={e => setAdults(Math.max(1, +e.target.value))}
                className="w-full text-sm font-bold bg-transparent outline-none text-slate-700" />
            </div>
          </div>

          {/* Search */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="h-[46px] px-8 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 self-end"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Plane size={15} />}
            Search
          </button>
        </div>
      </div>

      {/* ── Body: Sidebar + Cards + AI Panel ── */}
      <div className="flex-1 overflow-hidden flex max-w-[1600px] mx-auto w-full">

        {/* Left Sidebar — Filters */}
        <aside className="w-64 shrink-0 h-full overflow-y-auto bg-white border-r border-slate-100 p-5 hidden md:flex flex-col gap-5">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal size={15} className="text-slate-400" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Filters</h3>
          </div>

          {/* Stops */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stops</p>
            <div className="space-y-1.5">
              {STOP_OPTS.map(opt => (
                <button key={opt} onClick={() => setStopFilter(opt)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl font-bold transition-all ${stopFilter === opt ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Time of day */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Departure Time</p>
            <div className="space-y-1.5">
              {TIME_OPTS.map(opt => (
                <button key={opt} onClick={() => setTimeFilter(opt)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-all ${timeFilter === opt ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Budget slider */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Budget</p>
            <input type="range" min={10000} max={300000} step={5000} value={maxBudget}
              onChange={e => setMaxBudget(+e.target.value)}
              className="w-full accent-emerald-500" />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400 font-medium">₹10K</span>
              <span className="text-[11px] font-black text-emerald-600">₹{(maxBudget / 1000).toFixed(0)}K</span>
              <span className="text-[10px] text-slate-400 font-medium">₹3L</span>
            </div>
          </div>

          {/* Cabin */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cabin Class</p>
            <div className="space-y-1.5">
              {CABIN_CLASSES.map(c => (
                <button key={c} onClick={() => setCabin(c)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-all ${cabin === c ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center — Flight Results */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-5 md:p-6 space-y-4">
          {/* Sort bar */}
          {searched && !loading && filtered.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-black text-slate-700">{filtered.length} flights found</p>
              <div className="flex gap-2">
                {[['cheapest', 'Cheapest'], ['fastest', 'Fastest']].map(([key, label]) => (
                  <button key={key} onClick={() => setSortBy(key)}
                    className={`text-[11px] font-black px-3 py-1.5 rounded-xl border transition-all ${sortBy === key ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && <div className="space-y-3">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>}

          {/* Error */}
          {error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Empty */}
          {searched && !loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Plane size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-base font-bold">No flights found</p>
              <p className="text-sm mt-1">Try adjusting your filters or dates</p>
            </div>
          )}

          {/* Flight cards */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((f, i) => (
                <FlightCard key={f.id} flight={f} adults={adults} isRecommended={f.id === cheapestFlight?.id && i === 0} />
              ))}
            </div>
          )}
        </main>

        {/* Right — AI Panel */}
        <aside className="w-72 shrink-0 h-full overflow-y-auto bg-white border-l border-slate-100 p-5 hidden lg:block">
          <AIRecommendationPanel flights={filtered} destination={to} depart={depart} />
        </aside>
      </div>
    </div>
  );
}
