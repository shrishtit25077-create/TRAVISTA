/**
 * Travista Premium Trip Experience
 * Cinematic, immersive itinerary showcase — generated from BudgetModal params.
 * Intentionally distinct from the AI Planner's minimal SaaS UI.
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Calendar, Wallet, Cloud, Bed, Utensils,
  MapPin, Lightbulb, Download, Plane, ChevronDown,
  ArrowLeft, Clock, Compass, Star
} from 'lucide-react';
import { generateNewTrip } from '../../services/ai';
import { downloadItineraryPDF } from '../../services/pdfExport';

const FlightPanel = lazy(() => import('../AIPlanner/FlightPanel'));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

// ─── Loading Screen ───────────────────────────────────────────────────────────

const LoadingScreen = ({ destination }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 px-6"
    >
      <div className="relative mx-auto w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Sparkles size={20} className="text-emerald-400" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Crafting your {destination} experience
        </h1>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          Our AI is designing a premium itinerary tailored just for you…
        </p>
      </div>
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
        ))}
      </div>
    </motion.div>
  </div>
);

// ─── Day Timeline Card ────────────────────────────────────────────────────────

const DaySection = ({ day, index }) => {
  const [expanded, setExpanded] = useState(index < 2);

  return (
    <motion.div
      variants={fade}
      className="relative"
    >
      {/* Connector line */}
      {index > 0 && (
        <div className="absolute left-[19px] -top-6 w-px h-6 bg-gradient-to-b from-emerald-500/40 to-transparent" />
      )}

      <div className="flex gap-4">
        {/* Timeline node */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10">
            <span className="text-[11px] font-bold text-emerald-400">{String(day.day).padStart(2,'0')}</span>
          </div>
          {/* Connector to next */}
          <div className="w-px flex-1 min-h-6 bg-gradient-to-b from-emerald-500/30 to-transparent mt-1" />
        </div>

        {/* Card */}
        <div className="flex-1 mb-6">
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between gap-3 mb-3 text-left group"
          >
            <div>
              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">Day {day.day}</span>
              <h3 className="text-base font-bold text-gray-100 mt-0.5 leading-tight">{day.title}</h3>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {/* Time blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  {[
                    { slot: 'Morning', icon: '🌅', text: day.morning, accent: 'border-orange-900/40 bg-orange-950/20' },
                    { slot: 'Afternoon', icon: '☀️', text: day.afternoon, accent: 'border-blue-900/40 bg-blue-950/20' },
                    { slot: 'Evening', icon: '🌙', text: day.evening, accent: 'border-purple-900/40 bg-purple-950/20' },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-xl border p-3 ${s.accent}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm">{s.icon}</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{s.slot}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>

                {/* Stay + Food */}
                <div className="flex flex-wrap gap-3">
                  {day.stay && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Bed size={12} className="text-emerald-500 shrink-0" />
                      <span>{day.stay}</span>
                    </div>
                  )}
                  {day.food && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Utensils size={12} className="text-orange-400 shrink-0" />
                      <span>{day.food}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Stat Pill ────────────────────────────────────────────────────────────────

const StatPill = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-1 p-4 bg-gray-900 border border-gray-800 rounded-xl">
    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
      <Icon size={11} className="text-emerald-500" />{label}
    </div>
    <span className="text-sm font-bold text-gray-100 leading-tight">{value}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PremiumTrip = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [flightOpen, setFlightOpen] = useState(false);

  const prompt = searchParams.get('prompt') ? decodeURIComponent(searchParams.get('prompt')) : null;
  const dest = searchParams.get('dest') || 'your destination';

  useEffect(() => {
    if (!prompt) {
      navigate('/planner', { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await generateNewTrip(prompt);
        if (!cancelled) setPlan(result);
      } catch (err) {
        console.error('[PremiumTrip] Error:', err);
        if (!cancelled) navigate('/planner', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [prompt]);

  const handleDownload = async () => {
    if (!plan || pdfLoading) return;
    setPdfLoading(true);
    try { await downloadItineraryPDF(plan); }
    catch (err) { console.error('[PDF]', err); }
    finally { setPdfLoading(false); }
  };

  if (loading) return <LoadingScreen destination={dest} />;

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-teal-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pb-24">

        {/* ── Header ── */}
        <div className="flex items-center justify-between py-5 border-b border-gray-800/60 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles size={12} className="text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-gray-400">Premium Experience</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFlightOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all px-3 py-1.5 rounded-lg"
            >
              <Plane size={11} /> Flights
            </button>
            <button
              onClick={handleDownload}
              disabled={pdfLoading}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 bg-white/5 border border-gray-700 hover:bg-white/10 disabled:opacity-40 transition-all px-3 py-1.5 rounded-lg"
            >
              <Download size={11} /> {pdfLoading ? 'Saving…' : 'PDF'}
            </button>
          </div>
        </div>

        {/* ── Hero Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <Star size={10} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">AI-Curated Journey</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-3">
            {plan.title}
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
            {plan.summary}
          </p>
        </motion.div>

        {/* ── Stats Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8"
        >
          {plan.bestSeason && <StatPill icon={Calendar} label="Best Season" value={plan.bestSeason} />}
          {plan.budget && <StatPill icon={Wallet} label="Budget" value={plan.budget} />}
          {plan.weather && <StatPill icon={Cloud} label="Weather" value={plan.weather} />}
        </motion.div>

        {/* ── Book Flights CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl mb-8"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Plane size={14} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-300">Ready to fly?</p>
            <p className="text-[11px] text-gray-500">Find and book flights for your {dest} trip</p>
          </div>
          <button
            onClick={() => setFlightOpen(true)}
            className="shrink-0 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all px-4 py-2 rounded-lg active:scale-95"
          >
            Find Flights
          </button>
        </motion.div>

        {/* ── Day-by-Day Timeline ── */}
        {plan.days?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-5">
              <Clock size={13} className="text-gray-500" />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                {plan.days.length}-Day Journey
              </span>
            </div>

            <motion.div
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden"
              animate="visible"
            >
              {plan.days.map((day, di) => (
                <DaySection key={di} day={day} index={di} />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Tips + Hidden Gems ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {plan.tips?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={13} className="text-amber-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Insider Tips</span>
              </div>
              <ul className="space-y-2.5">
                {plan.tips.map((tip, ti) => (
                  <li key={ti} className="flex gap-2.5 text-xs text-gray-400 leading-relaxed">
                    <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.hiddenGems?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={13} className="text-purple-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hidden Gems</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {plan.hiddenGems.map((gem, gi) => (
                  <span
                    key={gi}
                    className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-lg border border-purple-500/20 font-medium"
                  >
                    {gem}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Footer CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-3 p-5 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-800/30 rounded-xl"
        >
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs text-gray-400 mb-0.5">Your journey is ready</p>
            <p className="text-sm font-bold text-white">Take your planning further</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/planner?prompt=${encodeURIComponent(prompt)}`)}
              className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all px-4 py-2.5 rounded-xl"
            >
              Refine in AI Planner
            </button>
            <button
              onClick={handleDownload}
              disabled={pdfLoading}
              className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all px-4 py-2.5 rounded-xl active:scale-95"
            >
              {pdfLoading ? 'Saving…' : 'Download PDF'}
            </button>
          </div>
        </motion.div>

        {/* Branding */}
        <p className="text-center text-[10px] text-gray-600 mt-6">
          Generated by Travista AI · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Flight Panel ── */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {flightOpen && (
            <FlightPanel plan={plan} onClose={() => setFlightOpen(false)} />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default PremiumTrip;
