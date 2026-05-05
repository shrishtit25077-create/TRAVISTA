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
import { generateTripPlan } from '../../services/tripPlanner';
import { fetchHotels } from '../../services/hotelService';
import { searchLocation } from '../../services/freeLocation';
import MapView from '../../components/MapView';

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

  const { photoUrl } = useDestinationPhoto(destination);

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const errorMessages = {
    missing_key: { icon: '🔑', title: 'API key missing', msg: 'Add VITE_GEMINI_API_KEY to .env and restart server' },
    invalid_key: { icon: '🔐', title: 'Invalid API key', msg: 'Invalid Gemini API key — check aistudio.google.com/apikey' },
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
    setLoading(true);
    setError(null);
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key || key.includes('your_')) { setError('missing_key'); setLoading(false); return; }

    const prompt = `Create a ${duration}-day trip to ${destination} for ${travellerType} with total budget ₹${budget}.
Return ONLY raw JSON (no markdown, no backticks). Start with { end with }:
{"tier":"Budget/Mid/Premium","summary":"one sentence","accommodation":{"type":"","pricePerNight":0,"area":""},"transport":{"to":"","local":""},"food":{"style":"","avgMeal":0,"mustTry":["","",""]},"days":[{"day":1,"title":"","morning":"","afternoon":"","evening":"","cost":0}],"tips":["","",""],"breakdown":{"transport":0,"stay":0,"food":0,"activities":0}}
Make all ${duration} days. All costs in INR. Total must be under ₹${budget}.`;

    try {
      const locData = await searchLocation(destination);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) setError('quota');
        else if (res.status === 403) setError('invalid_key');
        else setError('api_error');
        setLoading(false);
        return;
      }
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      const fetchedPlan = JSON.parse(raw.slice(start, end + 1));
      
      setDataState({ location: locData, aiPlan: fetchedPlan });
    } catch (e) {
      console.error('Trip plan error:', e);
      setError('parse_error');
    } finally {
      setLoading(false);
    }
  }, [destination, budget, duration, travellerType]);

  useEffect(() => {
    generatePlan();
  }, [generatePlan]);

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

  // Format forecast for chart
  const forecastData = forecast ? forecast.map(f => ({
    name: new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' }),
    temp: f.temp
  })) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden rounded-b-[3rem] shadow-lg">
        {photoUrl && <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover" alt={destination} />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-[1]" />
        
        <div className="absolute top-8 left-8 z-20">
          <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-white hover:bg-white/40 transition-all">
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="absolute bottom-12 left-8 md:left-12 z-20 space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">{destination}</h1>
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
               {tier} Budget
            </span>
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Wallet size={14} /> ₹{budget.toLocaleString()}
            </span>
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> {duration} Days
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-8">
        
        {/* Controls & Warning */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <button 
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-900 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} /> Edit Budget & Preferences
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Cost & Weather */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Cost Breakdown */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Wallet size={16} className="text-[#1D9E75]" /> AI Cost Breakdown
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Stay', val: plan?.totalBreakdown?.stay || 0, icon: Hotel, color: 'text-blue-500', bg: 'bg-blue-100' },
                  { label: 'Food', val: plan?.totalBreakdown?.food || 0, icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100' },
                  { label: 'Transport', val: plan?.totalBreakdown?.transport || 0, icon: Navigation, color: 'text-indigo-500', bg: 'bg-indigo-100' },
                  { label: 'Activities', val: plan?.totalBreakdown?.activities || 0, icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-100' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                        <item.icon size={14} />
                      </div>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">₹{item.val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Budget</span>
                <span className="text-2xl font-black text-[#1D9E75]">₹{budget.toLocaleString()}</span>
              </div>
            </div>

            {/* Weather & Map Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-lg space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Cloud size={16} className="text-[#1D9E75]" /> Weather Forecast
                </h3>
                {weather && (
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900">{weather.temp}°</span>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{weather.condition}</span>
                  </div>
                )}
              </div>

              {forecastData.length > 0 && (
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                      <RechartsTooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Area type="monotone" dataKey="temp" stroke="#1D9E75" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Map Section (Leaflet) */}
              <div className="mt-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">Explore Destination</h4>
                {dataState.location ? (
                  <MapView location={dataState.location} />
                ) : (
                  <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                    <p className="text-slate-400 font-medium text-sm">Location mapping unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Hotels & Itinerary */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-gray-200 shadow-md p-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">{plan?.tier || 'Your Trip Plan'}</h2>
              <p className="text-slate-500 mt-2 font-medium">{plan?.summary || ''}</p>
            </div>

            {/* AI Itinerary */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight italic mb-6">AI Generated <span className="text-[#1D9E75]">Itinerary.</span></h2>
              <div className="space-y-4">
                {(plan?.days || []).map((day, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-gray-200 shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <button 
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      className="w-full p-6 flex items-center justify-between hover:bg-white/40 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-800 shrink-0 border border-slate-200">
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Day</span>
                          <span className="text-2xl font-black">{day.day || (i+1)}</span>
                        </div>
                        <div className="text-left">
                          <h4 className="text-lg font-black text-slate-900">{day.title || 'Explore'}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs font-bold text-[#1D9E75]">₹{day.cost?.toLocaleString() || '0'}</span>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planned Activities</span>
                          </div>
                        </div>
                      </div>
                      {expandedDay === day.day ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </button>

                    <AnimatePresence>
                      {expandedDay === day.day && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-slate-50/50"
                        >
                          <div className="p-8 pt-4 space-y-6 border-t border-gray-100">
                            {day?.morning && (
                              <div className="flex gap-4 items-start">
                                <span className="text-xl">🌅</span>
                                <p className="text-sm font-medium text-slate-700">{day.morning}</p>
                              </div>
                            )}
                            {day?.afternoon && (
                              <div className="flex gap-4 items-start">
                                <span className="text-xl">☀️</span>
                                <p className="text-sm font-medium text-slate-700">{day.afternoon}</p>
                              </div>
                            )}
                            {day?.evening && (
                              <div className="flex gap-4 items-start">
                                <span className="text-xl">🌙</span>
                                <p className="text-sm font-medium text-slate-700">{day.evening}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Food & Tips Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-md">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Utensils size={14} className="text-orange-500" /> Food Plan
                </h4>
                <p className="text-sm font-bold text-slate-700 mb-2">{plan?.food?.style || "Local Dining"}</p>
                <p className="text-xs font-medium text-slate-500">Average Meal: ₹{plan?.food?.avgMeal || 0}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-md">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-[#1D9E75]" /> Pro Tips
                </h4>
                <ul className="space-y-2">
                  {(plan?.tips || []).map((tip, i) => (
                    <li key={i} className="text-xs font-medium text-slate-600 flex items-start gap-2">
                      <span className="text-[#1D9E75]">💡</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <BudgetModal 
            destination={{name: destination}} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripPlan;
