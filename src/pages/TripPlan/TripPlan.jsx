import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, MapPin, Calendar, Users, 
  Wallet, Hotel, Car, Utensils, Info, Check, 
  ChevronDown, ChevronUp, ExternalLink, Lightbulb,
  AlertTriangle, RefreshCw, Save, Cloud, Navigation
} from 'lucide-react';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { useWeather, useForecast } from '../../hooks/useTravista';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import BudgetModal from '../../components/BudgetModal';
import { fetchHotels } from '../../services/hotelService';
import { searchLocation } from '../../services/freeLocation';
import MapView from '../../components/MapView';
import toast from 'react-hot-toast';

const TripPlan = () => {
  const { destination: destParam } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Params
  const saved = JSON.parse(localStorage.getItem('travista_trip_params') || '{}');
  const destination = destParam || location.state?.destination || saved.destination || 'Destination';
  const budget = Number(searchParams.get('budget') || saved.budget || 50000);
  const duration = Number(searchParams.get('duration') || saved.duration || 5);
  const travellerType = searchParams.get('type') || saved.travellerType || 'Solo';
  const preferences = location.state?.preferences || saved.preferences || 'Balanced';

  // State
  const [loading, setLoading] = useState(true);
  const [dataState, setDataState] = useState({
    location: null,
    aiPlan: null
  });
  const plan = dataState.aiPlan;
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved

  const { photoUrl } = useDestinationPhoto(destination);

  // ── Weather + Forecast (safe — both default to null/[]) ──
  const { weather } = useWeather(destination);
  const { forecast } = useForecast(destination);

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const errorMessages = {
    quota: { icon: '⏳', title: 'Rate limit hit', msg: 'Rate limit hit — wait 60 seconds and try again' },
    api_error: { icon: '🌐', title: 'API Error', msg: 'Gemini API error — check console for details' },
    parse_error: { icon: '🔧', title: 'Parse error', msg: 'Could not read AI response — try again' },
    unknown: { icon: '❌', title: 'Something went wrong', msg: 'Check the browser console for details.' },
  };

  const loadingMessages = [
    `Analysing your ₹${budget?.toLocaleString()} budget...`,
    `Finding best stays in ${destination}...`,
    `Planning your ${duration} days...`,
    'Almost ready...'
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading, loadingMessages.length]);

  const generatePlan = useCallback(async () => {
    if (location.state?.aiPlan) {
      setLoading(false);
      const locData = await searchLocation(destination).catch(() => null);
      setDataState({ location: locData, aiPlan: location.state.aiPlan });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const locData = await searchLocation(destination).catch(() => null);
      
      const { generateAITrip } = await import('../../services/ai');
      let fetchedPlan = await generateAITrip({
        destination,
        budget,
        days: duration,
        type: travellerType
      });

      if (!fetchedPlan) {
        const { generateTrip } = await import('../../services/tripEngine');
        fetchedPlan = generateTrip({ destination, budget, days: duration, type: travellerType });
      }
      
      setDataState({ location: locData, aiPlan: fetchedPlan });
    } catch (e) {
      console.error('Trip plan error:', e);
      setError('parse_error');
    } finally {
      setLoading(false);
    }
  }, [destination, budget, duration, travellerType, location.state]);

  useEffect(() => {
    generatePlan();
  }, [generatePlan]);

  const handleSavePlan = () => {
    if (saveStatus !== 'idle') return;
    setSaveStatus('saving');
    toast('Saving your itinerary...', { icon: '⏳' });
    
    // Simulate save delay & mock local persistence
    setTimeout(() => {
      try {
        const existing = JSON.parse(localStorage.getItem('travista_saved_plans') || '[]');
        const newTrip = {
          id: Date.now(),
          destination,
          budget,
          duration,
          savedAt: new Date().toISOString(),
          planData: plan,
          photoUrl
        };
        localStorage.setItem('travista_saved_plans', JSON.stringify([newTrip, ...existing]));
        
        setSaveStatus('saved');
        toast.success('Trip saved successfully', { duration: 4000 });
        
        // Reset button after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus('idle');
        toast.error('Unable to save plan');
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
        {photoUrl && <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover opacity-10" alt="" />}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl z-0" />
        <div className="relative z-10 flex flex-col items-center gap-8 bg-white/70 backdrop-blur-xl border border-gray-200 p-12 rounded-[3rem] shadow-2xl">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1D9E75] rounded-full animate-spin" />
          <div className="space-y-2 text-center">
            <motion.p 
              key={loadingMsgIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-800 text-xl font-black tracking-wide"
            >
              {loadingMessages[loadingMsgIdx]}
            </motion.p>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errInfo = errorMessages[error] || errorMessages.unknown;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center relative">
        <div className="bg-white/70 backdrop-blur-xl border border-gray-200 p-12 rounded-[3rem] shadow-xl max-w-md w-full relative z-10">
          <div className="text-[60px] mb-6">{errInfo.icon}</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">{errInfo.title}</h2>
          <p className="text-slate-500 mb-8 font-medium">{errInfo.msg}</p>
          <div className="flex flex-col gap-4">
            <button onClick={generatePlan} className="w-full bg-[#1D9E75] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#15825f] transition-all shadow-md">
              Try Again
            </button>
            <button onClick={() => navigate(-1)} className="w-full bg-white border border-gray-200 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  // Format forecast for chart — safe: forecast defaults to []
  const forecastData = Array.isArray(forecast)
    ? forecast.map(f => ({
        name: new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: f.temp
      }))
    : [];

  // Safe tier extraction from plan
  const tier = plan?.tier || 'Standard';

  const vibeTags = plan?.tags || [preferences, travellerType, 'AI Optimised'].filter(Boolean);
  const totalSpent = (plan?.totalBreakdown?.stay||0)+(plan?.totalBreakdown?.food||0)+(plan?.totalBreakdown?.transport||0)+(plan?.totalBreakdown?.activities||0);
  const budgetUsed = totalSpent > 0 ? Math.min(Math.round((totalSpent/budget)*100),100) : 72;
  const breakdownItems = [
    { label:'Stay',       val: plan?.totalBreakdown?.stay       || Math.round(budget*0.40), icon:Hotel,     color:'#3b82f6', bg:'#eff6ff', pct:40 },
    { label:'Food',       val: plan?.totalBreakdown?.food       || Math.round(budget*0.25), icon:Utensils,  color:'#f97316', bg:'#fff7ed', pct:25 },
    { label:'Transport',  val: plan?.totalBreakdown?.transport  || Math.round(budget*0.20), icon:Car,       color:'#8b5cf6', bg:'#f5f3ff', pct:20 },
    { label:'Activities', val: plan?.totalBreakdown?.activities || Math.round(budget*0.15), icon:Sparkles,  color:'#ec4899', bg:'#fdf2f8', pct:15 },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>

      {/* ══ CINEMATIC HERO — full width, taller on desktop ══ */}
      <div className="relative overflow-hidden shadow-2xl"
        style={{ height: 'clamp(200px, 38vh, 420px)' }}>
        {photoUrl
          ? <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scale(1.04)' }} alt={destination} />
          : <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent z-[1]" />

        {/* Hero top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-5">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/12 backdrop-blur-lg border border-white/20 rounded-xl text-white text-sm font-semibold hover:bg-white/22 transition-all">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex flex-wrap gap-2">
            <button onClick={generatePlan}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/12 backdrop-blur-lg border border-white/20 rounded-xl text-white text-sm font-semibold hover:bg-white/22 transition-all">
              <RefreshCw size={13} /> Regenerate
            </button>
            <button onClick={handleSavePlan} disabled={saveStatus !== 'idle'}
              className={`flex items-center gap-2 px-4 py-2.5 backdrop-blur-lg border rounded-xl text-white text-sm font-bold transition-all ${
                saveStatus === 'saved' ? 'bg-emerald-600/90 border-emerald-500/50' : 'bg-[#15803d]/85 border-green-400/30 hover:bg-[#15803d]'
              }`}>
              {saveStatus === 'saving' ? <RefreshCw size={13} className="animate-spin" /> : saveStatus === 'saved' ? <Check size={13} /> : <Save size={13} />}
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save Trip'}
            </button>
          </div>
        </div>

        {/* Hero body */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-10 pb-8 sm:pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 bg-[#15803d]/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              <Sparkles size={9} /> AI Optimised
            </span>
            {weather && (
              <span className="flex items-center gap-1.5 bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">
                <Cloud size={9} /> {weather.temp}° {weather.condition}
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}>{destination}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {[`${tier} Budget`, `₹${budget.toLocaleString()}`, `${duration} Days`, travellerType, ...vibeTags.slice(0, 2)].map((tag, i) => (
              <span key={i} className="bg-white/15 backdrop-blur-sm border border-white/25 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">{tag}</span>
            ))}
          </div>
          <div style={{ maxWidth: 280 }}>
            <div className="flex justify-between text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
              <span>Budget used</span><span>{budgetUsed}%</span>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${budgetUsed}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN WORKSPACE ══ */}
      <div className="flex-1 min-w-0 w-full" style={{ padding: 'clamp(16px, 3vw, 40px)', paddingTop: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: 28 }}
          className="xl:grid-flow-col xl:[grid-template-columns:360px_minmax(0,1fr)]">

          {/* ─── LEFT SIDEBAR ─── */}
          <div className="flex flex-col gap-5 xl:max-w-[360px] w-full">

            {/* Plan summary */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Plan</p>
                  <h2 className="text-xl font-black text-slate-900">{plan?.tier || 'Smart Itinerary'}</h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {plan?.summary || `A curated ${duration}-day journey through ${destination}.`}
                  </p>
                </div>
                <div className="shrink-0 w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
                  <Sparkles size={20} className="text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Budget breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={14} className="text-emerald-600" /> Budget
                </h3>
                <span className="text-lg font-black text-emerald-600">₹{budget.toLocaleString()}</span>
              </div>
              <div className="space-y-4">
                {breakdownItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                          <item.icon size={13} style={{ color: item.color }} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-bold text-slate-900">₹{item.val.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 ml-1">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: item.color }}
                        initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.7, delay: i * 0.1 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Cloud size={14} className="text-blue-500" /> Weather
                </h3>
                {weather && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">{weather.temp}°</span>
                    <span className="text-[11px] text-slate-400 font-semibold">{weather.condition}</span>
                  </div>
                )}
              </div>
              {forecastData.length > 0 ? (
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Area type="monotone" dataKey="temp" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" dot={{ fill: '#15803d', strokeWidth: 0, r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-20 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl flex items-center justify-center">
                  <p className="text-sm text-slate-400 font-medium">Loading forecast…</p>
                </div>
              )}
            </div>

            {/* Local Insights */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500" /> Local Insights
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '🗓️', label: 'Best Season', val: plan?.bestSeason || 'Oct – Mar' },
                  { icon: '👥', label: 'Crowd Level', val: plan?.crowdLevel || 'Moderate' },
                  { icon: '🛡️', label: 'Safety',      val: plan?.safetyScore || 'High' },
                  { icon: '💱', label: 'Currency',    val: 'INR (₹)' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="flex items-center gap-2 text-sm text-slate-500"><span>{icon}</span>{label}</span>
                    <span className="text-sm font-semibold text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {dataState.location && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden" style={{ minHeight: 260 }}>
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-600" /> Destination Map
                  </h3>
                </div>
                <div style={{ minHeight: 220 }}>
                  <MapView location={dataState.location} />
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT MAIN CONTENT ─── */}
          <div className="flex flex-col gap-5 min-w-0 w-full">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                AI Generated <span className="text-emerald-600">Itinerary</span>
              </h2>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all">
                <RefreshCw size={13} /> Edit Trip
              </button>
            </div>

            {/* Day cards */}
            <div className="space-y-3">
              {(plan?.days || []).map((day, i) => {
                const dayNum = day.day || i + 1;
                const isOpen = expandedDay === dayNum;
                const activities = [
                  day.morning   && { time: 'Morning',   emoji: '🌅', text: day.morning,   color: '#f97316' },
                  day.afternoon && { time: 'Afternoon',  emoji: '☀️', text: day.afternoon, color: '#3b82f6' },
                  day.evening   && { time: 'Evening',    emoji: '🌙', text: day.evening,   color: '#8b5cf6' },
                ].filter(Boolean);

                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button onClick={() => setExpandedDay(isOpen ? null : dayNum)}
                      className="w-full px-6 py-5 flex items-center gap-5 hover:bg-slate-50/80 transition-colors text-left">
                      <div className="shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black"
                        style={{ background: 'linear-gradient(135deg,#15803d,#059669)' }}>
                        <span className="text-[9px] uppercase tracking-widest opacity-80">Day</span>
                        <span className="text-2xl leading-tight">{dayNum}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-black text-slate-900 truncate">{day.title || `Day ${dayNum} — Explore`}</h4>
                        <div className="flex items-center flex-wrap gap-3 mt-1">
                          <span className="text-xs font-semibold text-emerald-600">₹{(day.cost || Math.round(budget / (duration || 1))).toLocaleString()}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-xs text-slate-400 font-medium">{activities.length} activities</span>
                        </div>
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                          <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                            <div className="relative pl-5">
                              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-orange-300 via-blue-300 to-purple-300" />
                              <div className="space-y-4">
                                {activities.map((act, ai) => (
                                  <div key={ai} className="relative flex gap-4 items-start">
                                    <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" style={{ background: act.color }} />
                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-base">{act.emoji}</span>
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{act.time}</span>
                                      </div>
                                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{act.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 flex-wrap">
                              <span className="flex items-center gap-1.5 text-xs text-slate-500"><Hotel size={12} className="text-blue-400" /> {plan?.accommodation?.type || 'Hotel'}</span>
                              <span className="flex items-center gap-1.5 text-xs text-slate-500"><Utensils size={12} className="text-orange-400" /> {plan?.food?.style || 'Local cuisine'}</span>
                              <span className="flex items-center gap-1.5 text-xs text-slate-500"><Car size={12} className="text-purple-400" /> {plan?.transport?.mode || 'Auto / Taxi'}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Food + Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Utensils size={13} className="text-orange-500" /> Food Plan
                </h4>
                <p className="text-base font-bold text-slate-800 mb-1">{plan?.food?.style || 'Local Dining'}</p>
                <p className="text-sm text-slate-500 mb-3">Avg meal: <span className="font-bold text-slate-700">₹{plan?.food?.avgMeal || Math.round(budget * 0.008)}</span></p>
                <div className="flex flex-wrap gap-1.5">
                  {['Street Food', 'Local Dhabas', 'Cafés'].map(t => (
                    <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-semibold">{t}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Lightbulb size={13} className="text-amber-500" /> Pro Tips
                </h4>
                <ul className="space-y-2.5">
                  {(plan?.tips || ['Book hotels early for savings', 'Use local transport', 'Carry cash for street food']).slice(0, 3).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-wrap gap-3 items-center justify-between">
              <p className="text-sm text-slate-400 font-medium hidden sm:block">✦ AI plan ready for {destination}</p>
              <div className="flex flex-wrap gap-3 ml-auto">
                <button onClick={generatePlan}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all">
                  <RefreshCw size={13} /> Regenerate
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all">
                  <ExternalLink size={13} /> Export PDF
                </button>
                <button onClick={handleSavePlan} disabled={saveStatus !== 'idle'}
                  className={`flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-sm transition-all ${
                    saveStatus === 'saved' ? 'bg-emerald-600' : 'bg-[#15803d] hover:bg-[#166534]'
                  }`}>
                  {saveStatus === 'saving' ? <RefreshCw size={13} className="animate-spin" /> : saveStatus === 'saved' ? <Check size={13} /> : <Save size={13} />}
                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <BudgetModal destination={{ name: destination }} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default TripPlan;

