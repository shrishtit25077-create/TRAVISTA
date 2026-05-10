/**
 * Travista Flight Search Panel
 * A sleek, self-contained modal for searching and browsing flights,
 * contextually pre-filled from the AI itinerary.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plane, ArrowRight, Loader2, Clock, Zap,
  ArrowLeftRight, Filter, ExternalLink, AlertCircle,
  ChevronDown, Users, Calendar
} from 'lucide-react';
import { searchFlights, extractIATA, formatDate, addDays } from '../../services/flightSearch';

// ─── Airline Logo ─────────────────────────────────────────────────────────────

const AirlineLogo = ({ code, name }) => {
  const colors = {
    '6E': ['#1a1a6e', '#fff'], AI: ['#c8102e', '#fff'], UK: ['#6b21a8', '#fff'],
    SG: ['#e63946', '#fff'], EK: ['#c8a84b', '#1a1a1a'], SQ: ['#003580', '#f5c518'],
    QR: ['#5c0623', '#c8a84b'],
  };
  const [bg, fg] = colors[code] || ['#374151', '#fff'];
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-black"
      style={{ backgroundColor: bg, color: fg }}
    >
      {code}
    </div>
  );
};

// ─── Flight Card ──────────────────────────────────────────────────────────────

const FlightCard = ({ flight, adults }) => {
  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all group"
    >
      <AirlineLogo code={flight.airlineCode} name={flight.airline} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-gray-900">{flight.departure}</span>
          <div className="flex items-center gap-1 flex-1">
            <div className="h-px flex-1 bg-gray-200 max-w-12" />
            {flight.stops === 0
              ? <span className="text-[9px] font-semibold text-emerald-600 whitespace-nowrap">Direct</span>
              : <span className="text-[9px] font-semibold text-amber-600 whitespace-nowrap">{flight.stops} stop</span>
            }
            <div className="h-px flex-1 bg-gray-200 max-w-12" />
          </div>
          <span className="text-sm font-bold text-gray-900">{flight.arrival}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="font-medium truncate">{flight.airline}</span>
          <span className="flex items-center gap-0.5"><Clock size={9} />{flight.duration}</span>
          {flight.isMock && <span className="text-amber-400 font-medium">Est.</span>}
        </div>
      </div>

      <div className="text-right shrink-0 ml-2">
        <div className="text-base font-bold text-gray-900">{formatPrice(flight.price)}</div>
        {adults > 1 && <div className="text-[9px] text-gray-400">for {adults} travelers</div>}
        <a
          href={flight.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all px-2.5 py-1 rounded-lg mt-1"
        >
          Book <ExternalLink size={9} />
        </a>
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl animate-pulse">
    <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-2 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="text-right space-y-1.5 shrink-0">
      <div className="h-4 bg-gray-200 rounded w-16" />
      <div className="h-5 bg-gray-200 rounded w-14" />
    </div>
  </div>
);

// ─── AI Insight Banner ────────────────────────────────────────────────────────

const AIInsight = ({ destination, depart }) => {
  const day = new Date(depart).toLocaleDateString('en-US', { weekday: 'long' });
  return (
    <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
      <Zap size={13} className="text-emerald-500 shrink-0 mt-0.5" />
      <p className="text-xs text-emerald-700 font-medium leading-relaxed">
        <span className="font-bold">AI Tip:</span> For your {destination} trip, flying on a{' '}
        {['Tuesday','Wednesday'].includes(day) ? <strong>{day}</strong> : day} typically offers{' '}
        {['Tuesday','Wednesday'].includes(day) ? '15–30% lower' : 'competitive'} fares.
        Book at least 3 weeks in advance for best prices.
      </p>
    </div>
  );
};

// ─── Main Flight Panel ────────────────────────────────────────────────────────

const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First'];
const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'nonstop',  label: 'Nonstop' },
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'morning',  label: 'Morning' },
  { key: 'evening',  label: 'Evening' },
];

const FlightPanel = ({ plan, onClose }) => {
  // Extract destination from plan title
  const destGuess = plan?.title?.match(/(?:to|in|for)\s+([A-Za-z\s]+?)(?:,|\s*$)/i)?.[1]?.trim()
    || plan?.title?.split(' ').slice(-2).join(' ')
    || 'Tokyo';

  const defaultDepart = formatDate(addDays(new Date(), 14));
  const defaultReturn = formatDate(addDays(new Date(), 14 + (plan?.days?.length || 5)));

  const [from, setFrom] = useState('DEL');
  const [to, setTo] = useState(extractIATA(destGuess));
  const [destLabel, setDestLabel] = useState(destGuess);
  const [depart, setDepart] = useState(defaultDepart);
  const [returnDate, setReturnDate] = useState(defaultReturn);
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('Economy');
  const [filter, setFilter] = useState('all');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [showCabinMenu, setShowCabinMenu] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const results = await searchFlights({ from, to, depart, returnDate, adults, cabinClass: cabin });
      setFlights(results);
    } catch (err) {
      setError('Could not load flights. Please try again.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, depart, returnDate, adults, cabin]);

  // Auto-search on open
  useEffect(() => { handleSearch(); }, []);

  const filtered = filter === 'all'
    ? flights
    : flights.filter(f => f.tags?.includes(filter) || (filter === 'nonstop' && f.stops === 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-50 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Plane size={14} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Book Flights</h2>
              <p className="text-[10px] text-gray-400">Find flights for your {destLabel} trip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Search Form */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 space-y-3">
          {/* Route row */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">From</label>
              <input
                value={from}
                onChange={e => setFrom(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="DEL"
                maxLength={3}
                className="w-full text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-400 focus:bg-white transition-all uppercase placeholder-gray-300"
              />
            </div>
            <button
              onClick={() => { setFrom(to); setTo(from); }}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:border-emerald-200 border border-gray-200 flex items-center justify-center transition-colors mt-5"
            >
              <ArrowLeftRight size={13} className="text-gray-500" />
            </button>
            <div className="flex-1">
              <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">To</label>
              <input
                value={to}
                onChange={e => setTo(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="TYO"
                maxLength={3}
                className="w-full text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-400 focus:bg-white transition-all uppercase placeholder-gray-300"
              />
            </div>
          </div>

          {/* Dates + Pax row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Depart</label>
              <input
                type="date"
                value={depart}
                min={formatDate(new Date())}
                onChange={e => setDepart(e.target.value)}
                className="w-full text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2.5 outline-none focus:border-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Return</label>
              <input
                type="date"
                value={returnDate}
                min={depart}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2.5 outline-none focus:border-emerald-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Travelers</label>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2.5">
                <Users size={11} className="text-gray-400 shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={adults}
                  onChange={e => setAdults(Math.max(1, Math.min(9, +e.target.value)))}
                  className="w-full text-xs font-medium text-gray-700 bg-transparent outline-none"
                />
              </div>
            </div>
            <div className="relative">
              <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Cabin</label>
              <button
                onClick={() => setShowCabinMenu(m => !m)}
                className="w-full flex items-center justify-between gap-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2.5 hover:border-emerald-300 transition-colors"
              >
                <span className="truncate">{cabin}</span>
                <ChevronDown size={11} className={`shrink-0 transition-transform ${showCabinMenu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showCabinMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden"
                  >
                    {CABIN_CLASSES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setCabin(c); setShowCabinMenu(false); }}
                        className={`w-full text-left text-xs px-3 py-2 font-medium hover:bg-gray-50 transition-colors ${cabin === c ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gray-900 hover:bg-emerald-600 disabled:opacity-50 transition-all py-2.5 rounded-xl active:scale-[0.98]"
          >
            {loading
              ? <><Loader2 size={13} className="animate-spin" /> Searching flights…</>
              : <><Plane size={13} /> Search Flights</>
            }
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

          {/* AI Insight */}
          {searched && !loading && flights.length > 0 && (
            <AIInsight destination={destLabel} depart={depart} />
          )}

          {/* Filters */}
          {searched && !loading && flights.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    filter === f.key
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-gray-400 self-center">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* No results */}
          {searched && !loading && !error && filtered.length === 0 && (
            <div className="text-center py-8">
              <Plane size={28} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">No flights found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or dates</p>
            </div>
          )}

          {/* Results list */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map(f => (
                <FlightCard key={f.id} flight={f} adults={adults} />
              ))}
            </div>
          )}

          {/* Mock data disclaimer */}
          {!loading && flights.some(f => f.isMock) && (
            <p className="text-[10px] text-gray-400 text-center pb-2">
              Prices are estimated. Click "Book" for real-time fares.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlightPanel;
