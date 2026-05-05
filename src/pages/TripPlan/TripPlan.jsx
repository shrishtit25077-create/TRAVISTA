import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, MapPin, Calendar, Users, 
  Wallet, Hotel, Car, Utensils, Info, Check, 
  ChevronDown, ChevronUp, ExternalLink, Lightbulb,
  AlertTriangle, RefreshCw, Save
} from 'lucide-react';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import BudgetModal from '../../components/BudgetModal';

ChartJS.register(ArcElement, Tooltip, Legend);

function safeParseJSON(text) {
  try {
    console.log('Attempting to parse JSON...');
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    // Find first { and last } to extract just the JSON
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      console.error('No JSON object found in text:', text);
      throw new Error('No JSON object found');
    }
    
    const jsonStr = cleaned.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    console.log('Successfully parsed JSON:', parsed);
    return parsed;
  } catch (err) {
    console.error('JSON parse failed:', err, 'Text was:', text);
    throw err;
  }
}

const TripPlan = () => {
  const { destination: destParam } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get params from multiple sources for robustness
  const storedParams = JSON.parse(localStorage.getItem('travista_trip_params') || '{}');
  
  const destination = destParam || location.state?.destination || storedParams.destination || 'Destination';
  const budget = parseInt(searchParams.get('budget')) || location.state?.totalBudget || storedParams.totalBudget || 50000;
  const duration = parseInt(searchParams.get('duration')) || location.state?.duration || storedParams.duration || 5;
  const travellerType = searchParams.get('type') || location.state?.travellerType || storedParams.travellerType || 'Solo';
  const tier = location.state?.tier || storedParams.tier || 'Budget';
  const originalData = location.state?.originalData || storedParams.originalData;

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [alternatives, setAlternatives] = useState([]);

  const { photoUrl } = useDestinationPhoto(destination);

  const loadingMessages = [
    `Analysing your budget of ₹${budget}...`,
    `Finding best stays in ${destination}...`,
    `Designing your ${duration}-day itinerary...`,
    'Almost ready — putting it all together!'
  ];

  const generatePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    
    try {
      console.log('Starting trip plan generation...');
      console.log('Destination:', destination);
      console.log('Budget:', budget);
      console.log('Duration:', duration);
      console.log('Gemini Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY);

      const prompt = `You are a budget travel expert for Indian travellers.
Design a complete ${duration}-day trip to ${destination} for ${travellerType}
with a TOTAL budget of ₹${budget}.

Budget tier: ${tier}

IMPORTANT RULES:
- Every recommendation MUST fit within the total budget of ₹${budget}
- Show exact costs for everything so total adds up to ≤ ₹${budget}
- All prices in INR
- Keep the days array to maximum ${Math.min(duration, 7)} days.

Return ONLY valid JSON, no markdown, no backticks, no explanation.
Start your response with { and end with }

JSON structure:
{
  "tier": "Ultra Budget | Budget | Mid Range | Premium",
  "tierEmoji": "🎒 | 💚 | ⭐ | 👑",
  "summary": "2-sentence overview",
  "warning": "null or string",
  "totalCostBreakdown": {"transport": number, "accommodation": number, "food": number, "activities": number, "misc": number},
  "accommodation": {"type": "string", "name": "string", "pricePerNight": number, "area": "string"},
  "transport": {"toDestination": "string", "localTransport": "string"},
  "foodPlan": {"style": "string", "avgMealCost": number, "mustTry": ["string"]},
  "days": [{"day": number, "title": "string", "morning": {"activity": "string", "cost": number, "tip": "string"}, "afternoon": {"activity": "string", "cost": number, "tip": "string"}, "evening": {"activity": "string", "cost": number, "tip": "string"}, "dayTotal": number}],
  "budgetTips": ["string"],
  "freeTips": ["string"],
  "bookingLinks": {"flights": "string", "hotels": "string"}
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;
      
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 2000 },
        }),
      });

      console.log('Response status:', response.status);

      if (response.status === 429) {
        setError('quota');
        return;
      }

      const data = await response.json();
      console.log('Raw Gemini response:', JSON.stringify(data));

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      const text = data.candidates[0].content.parts[0].text;
      console.log('Extracted text:', text);

      const parsedPlan = safeParseJSON(text);
      setPlan(parsedPlan);
      localStorage.setItem('travista_last_trip', JSON.stringify(parsedPlan));

      // Fetch alternatives if budget is very low
      if (budget / duration < 1000) {
        const altPrompt = `What are 3 destinations in India where ₹${budget} for ${duration} days is actually comfortable? Return ONLY a JSON array: [{"name":"...","why":"...","estimatedDailyBudget":number}]`;
        const altRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: altPrompt }] }],
          }),
        });
        const altData = await altRes.json();
        if (altData.candidates?.[0]?.content?.parts?.[0]?.text) {
          const altText = altData.candidates[0].content.parts[0].text;
          setAlternatives(safeParseJSON(altText));
        }
      }

    } catch (err) {
      console.error('TRIP PLAN ERROR:', err.message, err.stack);
      setError('general');
    } finally {
      setLoading(false);
    }
  }, [destination, budget, duration, travellerType, tier]);

  useEffect(() => {
    generatePlan();
    
    const msgTimer = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(msgTimer);
  }, [generatePlan]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040d1a] flex flex-col items-center justify-center relative overflow-hidden">
        {photoUrl && <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" alt="" />}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="w-20 h-20 border-4 border-[#1D9E75]/20 border-t-[#1D9E75] rounded-full animate-spin" />
          <div className="space-y-2 text-center">
            <motion.p 
              key={loadingMsgIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white text-xl font-black italic tracking-wide"
            >
              {loadingMessages[loadingMsgIdx]}
            </motion.p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Powered by Travista AI</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center">
        <div className="text-[80px] mb-6">
          {error === 'quota' ? '⏳' : '🔧'}
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          {error === 'quota' ? 'API limit reached — try again in a minute' : 'Something went wrong generating your plan'}
        </h2>
        <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
          {error === 'quota' 
            ? 'Gemini has a free request limit. We recommend waiting 60 seconds before retrying.' 
            : 'This was likely caused by a temporary connection issue. Your parameters are saved, please try again.'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <button 
            onClick={generatePlan} 
            className="flex-1 bg-[#1D9E75] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#15825f] transition-all shadow-xl shadow-[#1D9E75]/20"
          >
            🔄 Try Again
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const chartData = {
    labels: ['Transport', 'Accommodation', 'Food', 'Activities', 'Misc'],
    datasets: [
      {
        data: [
          plan.totalCostBreakdown?.transport || 0,
          plan.totalCostBreakdown?.accommodation || 0,
          plan.totalCostBreakdown?.food || 0,
          plan.totalCostBreakdown?.activities || 0,
          plan.totalCostBreakdown?.misc || 0,
        ],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#94a3b8'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₹${ctx.raw.toLocaleString()}`,
        },
      },
    },
  };

  const isUltraLow = (budget / duration) < 800;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header Section */}
      <div className="relative h-[55vh] overflow-hidden">
        {photoUrl && <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover" alt={destination} />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-black/40 z-[1]" />
        
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/40 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="absolute bottom-12 left-12 z-20 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{destination}</span>
            <span className="text-4xl">{originalData?.flag}</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/90 backdrop-blur text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              {plan.tierEmoji} {plan.tier}
            </span>
            <span className="bg-[#1D9E75] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Wallet size={14} /> ₹{budget.toLocaleString()}
            </span>
            <span className="bg-black/40 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> {duration} Days
            </span>
            <span className="bg-black/40 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> {travellerType}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Core Info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Budget Warning */}
          {(plan.warning || isUltraLow) && (
            <div className={`p-6 rounded-[2.5rem] border-2 ${isUltraLow ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} space-y-4 shadow-xl shadow-amber-500/5`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUltraLow ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-widest ${isUltraLow ? 'text-red-900' : 'text-amber-900'}`}>
                    {isUltraLow ? 'Shoestring Budget' : 'Budget Warning'}
                  </h4>
                  <p className={`text-xs font-medium mt-1 leading-relaxed ${isUltraLow ? 'text-red-700' : 'text-amber-700'}`}>
                    {plan.warning || "This is a very tight budget for this destination. We've optimized for the essentials."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  isUltraLow ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                Change my budget <Sparkles size={14} />
              </button>
            </div>
          )}

          {/* Cost Breakdown Chart */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Wallet size={16} className="text-[#1D9E75]" /> Cost Breakdown
            </h3>
            <div className="relative h-64 flex items-center justify-center">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">₹{budget.toLocaleString()}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {chartData.labels.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                    <span className="text-xs font-bold text-slate-900">₹{chartData.datasets[0].data[i].toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodation Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Hotel size={16} className="text-[#1D9E75]" /> Accommodation
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Check size={20} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{plan.accommodation?.type}</span>
                  <h4 className="text-lg font-black text-slate-900 mt-1 leading-tight">{plan.accommodation?.name}</h4>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {plan.accommodation?.area}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Night</p>
                  <p className="text-lg font-black text-slate-900">₹{plan.accommodation?.pricePerNight.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Stay</p>
                  <p className="text-lg font-black text-[#1D9E75]">₹{(plan.accommodation?.pricePerNight * duration).toLocaleString()}</p>
                </div>
              </div>
              <a 
                href={plan.bookingLinks?.hotels || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 rounded-xl border-2 border-slate-100 text-slate-600 hover:border-[#1D9E75] hover:text-[#1D9E75] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                Search Accommodation <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Itinerary */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Your Curated <span className="text-[#1D9E75]">Itinerary.</span></h2>
          </div>

          <div className="space-y-4">
            {plan.days?.map((day) => (
              <div key={day.day} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <button 
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Day</span>
                      <span className="text-2xl font-black">{day.day}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-black text-slate-900">{day.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold text-[#1D9E75]">₹{day.dayTotal?.toLocaleString()}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planned Activities</span>
                      </div>
                    </div>
                  </div>
                  {expandedDay === day.day ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
                </button>

                <AnimatePresence>
                  {expandedDay === day.day && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 pt-0 space-y-8 border-t border-slate-50">
                        {['morning', 'afternoon', 'evening'].map((time) => (
                          day[time] && (
                            <div key={time} className="flex gap-6 relative">
                              <div className="w-px bg-slate-100 absolute left-4 top-10 bottom-0 last:hidden" />
                              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 z-10">
                                {time === 'morning' ? '🌅' : time === 'afternoon' ? '☀️' : '🌙'}
                              </div>
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
                                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">₹{day[time].cost}</span>
                                </div>
                                <h5 className="text-sm font-black text-slate-800">{day[time].activity}</h5>
                                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 flex items-start gap-3">
                                  <Lightbulb size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                                  <p className="text-xs text-emerald-700 font-medium leading-relaxed">{day[time].tip}</p>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Food Plan */}
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Utensils size={16} className="text-[#1D9E75]" /> Food Plan
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style</span>
                     <span className="text-xs font-bold text-slate-900">{plan.foodPlan?.style}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Meal</span>
                     <span className="text-xs font-bold text-[#1D9E75]">₹{plan.foodPlan?.avgMealCost}</span>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Must Try Dishes</p>
                     <div className="flex flex-wrap gap-2">
                       {plan.foodPlan?.mustTry?.map(dish => (
                         <span key={dish} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-600">{dish}</span>
                       ))}
                     </div>
                   </div>
                </div>
             </div>

             {/* Free Things */}
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={16} className="text-[#1D9E75]" /> Free Experiences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.freeTips?.map(tip => (
                    <span key={tip} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      {tip}
                    </span>
                  ))}
                </div>
             </div>
          </div>

          {/* Budget Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plan.budgetTips?.map((tip, i) => (
              <div key={i} className="bg-[#1D9E75]/5 border border-[#1D9E75]/10 p-6 rounded-[2.5rem] space-y-2">
                <Lightbulb size={20} className="text-[#1D9E75]" />
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>

          {/* Alternatives for ultra low budget */}
          {isUltraLow && alternatives.length > 0 && (
            <div className="space-y-6 pt-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic">More Comfortable <span className="text-[#1D9E75]">Alternatives.</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {alternatives.map(alt => (
                  <div key={alt.name} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-[#1D9E75] transition-colors">{alt.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{alt.why}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Budget</span>
                      <span className="text-sm font-black text-[#1D9E75]">₹{alt.estimatedDailyBudget}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Actions */}
          <div className="flex flex-wrap gap-4 pt-10">
            <button 
              onClick={() => setShowModal(true)}
              className="px-10 py-5 bg-white border-2 border-slate-100 rounded-3xl font-black text-xs uppercase tracking-widest text-slate-900 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} /> Change Budget
            </button>
            <button className="flex-1 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200">
               <Save size={18} /> Save Full Trip
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <BudgetModal 
            destination={originalData} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripPlan;
