/**
 * Travista Premium Trip Experience
 * Cinematic, immersive itinerary showcase — generated from BudgetModal params.
 * Updated to light theme to match the clean AI Planner aesthetic.
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
  <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 px-6"
    >
      <div className="relative mx-auto w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10" />
        <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-emerald-500/5 flex items-center justify-center">
          <Sparkles size={20} className="text-emerald-500" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-2 text-slate-900">
          Crafting your {destination} journey
        </h1>
        <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">
          Our AI is designing a luxury experience just for you...
        </p>
      </div>
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
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
        <div className="absolute left-[19px] -top-6 w-px h-6 bg-gradient-to-b from-emerald-500/20 to-transparent" />
      )}

      <div className="flex gap-5">
        {/* Timeline node */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 z-10">
            <span className="text-[11px] font-black text-emerald-600">{String(day.day).padStart(2,'0')}</span>
          </div>
          <div className="w-px flex-1 min-h-6 bg-gradient-to-b from-emerald-500/10 to-transparent mt-1" />
        </div>

        {/* Card */}
        <div className="flex-1 mb-10">
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between gap-3 mb-4 text-left group"
          >
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1 block">Day {day.day}</span>
              <h3 className="text-xl font-black text-slate-900 leading-tight">{day.title}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { slot: 'Morning', icon: '🌅', text: day.morning, color: 'bg-orange-50 text-orange-700 border-orange-100' },
                    { slot: 'Afternoon', icon: '☀️', text: day.afternoon, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    { slot: 'Evening', icon: '🌙', text: day.evening, color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-2xl border p-4 ${s.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{s.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{s.slot}</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  {day.stay && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Bed size={14} className="text-emerald-500" />
                      <span>{day.stay}</span>
                    </div>
                  )}
                  {day.food && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Utensils size={14} className="text-orange-500" />
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
  <div className="flex flex-col gap-1 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
      <Icon size={12} className="text-emerald-500" />{label}
    </div>
    <span className="text-sm font-black text-slate-900">{value}</span>
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
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans">

      {/* ── Ambient Glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[-10%] w-[40%] h-[40%] bg-blue-50 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pb-32">

        {/* ── Nav Header ── */}
        <div className="flex items-center justify-between py-6 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-emerald-200 group-hover:bg-emerald-50">
              <ArrowLeft size={14} />
            </div>
            Back
          </button>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => setFlightOpen(true)}
              className="hidden sm:flex items-center gap-2 text-[11px] font-black text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all px-5 py-2.5 rounded-full uppercase tracking-widest"
            >
              <Plane size={14} /> Book Flights
            </button>
            <button
              onClick={handleDownload}
              disabled={pdfLoading}
              className="flex items-center gap-2 text-[11px] font-black text-slate-600 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all px-5 py-2.5 rounded-full uppercase tracking-widest shadow-sm"
            >
              <Download size={14} /> {pdfLoading ? 'Saving...' : 'Get PDF'}
            </button>
          </div>
        </div>

        {/* ── Title Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6">
            <Sparkles size={12} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Premium Itinerary</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            {plan.title}
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            {plan.summary}
          </p>
        </motion.div>

        {/* ── Stats Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16"
        >
          {plan.bestSeason && <StatPill icon={Calendar} label="Best Time" value={plan.bestSeason} />}
          {plan.budget && <StatPill icon={Wallet} label="Budget" value={plan.budget} />}
          {plan.weather && <StatPill icon={Cloud} label="Weather" value={plan.weather} />}
        </motion.div>

        {/* ── Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          
          {/* Main Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</h4>
                <p className="text-lg font-black text-slate-900">{plan.days?.length || 0} Days Plan</p>
              </div>
            </div>

            <motion.div
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden"
              animate="visible"
            >
              {plan.days?.map((day, di) => (
                <DaySection key={di} day={day} index={di} />
              ))}
            </motion.div>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Quick Flight CTA */}
            <div className="p-6 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
              <Plane size={32} className="mb-4 opacity-50" />
              <h4 className="text-xl font-black mb-2">Ready to fly?</h4>
              <p className="text-xs font-bold text-blue-100 mb-6 leading-relaxed">Book the best flights to {dest} now with Travista.</p>
              <button 
                onClick={() => setFlightOpen(true)}
                className="w-full py-3.5 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Find Flights
              </button>
            </div>

            {/* Hidden Gems */}
            {plan.hiddenGems?.length > 0 && (
              <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-purple-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hidden Gems</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.hiddenGems.map((gem, i) => (
                    <span key={i} className="text-[10px] font-bold px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                      {gem}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Insider Tips */}
            {plan.tips?.length > 0 && (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2.5rem]">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={16} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Expert Tips</span>
                </div>
                <ul className="space-y-4">
                  {plan.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-600 leading-relaxed">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-200/50 flex items-center justify-center text-[10px] text-emerald-700">{i+1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Footer Branding ── */}
        <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Compass size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">Travista</span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            Memories start here
          </p>
          <div className="flex gap-4">
             <button
              onClick={() => navigate(`/planner?prompt=${encodeURIComponent(prompt)}`)}
              className="text-[10px] font-black text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
            >
              Refine in Planner
            </button>
            <span className="text-slate-200">/</span>
            <button
              onClick={handleDownload}
              className="text-[10px] font-black text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

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
