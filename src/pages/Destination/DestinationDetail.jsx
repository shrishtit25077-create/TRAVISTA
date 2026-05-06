import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MapPin, Star, Sparkles, Navigation, Calendar, Wallet, ArrowRight, Type, Check, Users, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { track } from '../../services/trackingService';
import { generateCaptions } from '../../services/ai';

const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
async function callAI(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'mistralai/mistral-7b-instruct', messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

const DestinationDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { savedPlaces, toggleSave, addItinerary } = useAuth();
  const data = location.state;
  const { photoUrl, loading: photoLoading } = useDestinationPhoto(data?.name);

  // Tabs: Overview | Solo vs Group
  const [activeTab, setActiveTab] = useState('overview');

  // Solo vs Group state (Feature 6)
  const [soloGroupData, setSoloGroupData] = useState('');
  const [loadingSG, setLoadingSG] = useState(false);
  const [sgLoaded, setSgLoaded] = useState(false);

  React.useEffect(() => {
    if (!data) return;
    const start = Date.now();
    return () => {
      track.timeSpent(data.name, Math.floor((Date.now() - start) / 1000));
    };
  }, [data]);

  // Switch to Solo vs Group tab + load AI
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'sologroup' && !sgLoaded) {
      setLoadingSG(true);
      const prompt = `Compare solo travel vs group travel in ${data.name}. Give 4 bullet points for each in this format:
SOLO TRAVEL:
• point 1
• point 2
• point 3
• point 4

GROUP TRAVEL:
• point 1
• point 2
• point 3
• point 4

Keep each bullet under 15 words.`;
      const res = await callAI(prompt);
      setSoloGroupData(res);
      setSgLoaded(true);
      setLoadingSG(false);
    }
  };

  if (!data) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
       <div className="text-center space-y-4">
          <Navigation className="w-12 h-12 text-slate-200 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black text-slate-800">Destination Not Found</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold">Go Home</button>
       </div>
    </div>
  );

  const isSaved = savedPlaces.some(p => p.id === data.id);

  const handleQuickPlan = () => {
    const newTrip = {
      id: Date.now(),
      destination: data.name,
      createdAt: new Date().toISOString(),
      budget: { stay: 18000, food: 6000, travel: 12000, activities: 5000, total: 41000 },
      days: [{ day: 1, activities: [
        { id: `a-${Date.now()}-1`, time: 'Morning', title: `Arrival in ${data.name} & Check-in` },
        { id: `a-${Date.now()}-2`, time: 'Afternoon', title: 'Explore Local Landmarks' },
        { id: `a-${Date.now()}-3`, time: 'Evening', title: 'Traditional Dinner Experience' },
      ]}]
    };
    addItinerary(newTrip);
    navigate(`/itinerary/${newTrip.id}`);
  };

  // Caption generator (Feature 5)
  const [captions, setCaptions] = useState([]);
  const [loadingCaptions, setLoadingCaptions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleGenerateCaptions = async () => {
    setLoadingCaptions(true);
    try {
      const result = await generateCaptions(data.name);
      setCaptions(Array.isArray(result) ? result : [result]);
    } catch (e) { console.error(e); }
    finally { setLoadingCaptions(false); }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse Solo vs Group response into two columns
  const parseSoloGroup = (text) => {
    if (!text) return { solo: [], group: [] };
    const soloMatch = text.match(/SOLO TRAVEL:([\s\S]*?)(?:GROUP TRAVEL:|$)/i);
    const groupMatch = text.match(/GROUP TRAVEL:([\s\S]*?)$/i);
    const extractBullets = (match) =>
      (match?.[1] || '').split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    return { solo: extractBullets(soloMatch), group: extractBullets(groupMatch) };
  };

  const { solo, group } = parseSoloGroup(soloGroupData);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden group">
        {photoLoading ? (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ) : (
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={photoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt={data.name}
            onError={(e) => { e.target.src = `https://picsum.photos/seed/${encodeURIComponent(data.name)}/1600/900`; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-black/40 z-[1]" />
        
        {/* Top Actions */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => toggleSave(data)} className={`w-12 h-12 backdrop-blur-xl rounded-full flex items-center justify-center border transition-all ${isSaved ? 'bg-red-500 text-white border-red-500' : 'bg-white/20 text-white border-white/20 hover:bg-white hover:text-red-500'}`}>
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-8 -translate-y-20 relative z-10 pb-20">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] w-fit">
               <Sparkles className="w-3 h-3" /> Editorial Pick
            </div>
            <div className="flex justify-between items-start">
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{data.name}</h1>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-black text-slate-800 dark:text-white">{data.rating}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-sm uppercase tracking-widest">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {data.category}</span>
              <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-sky-500" /> Starting from {data.price}</span>
            </div>
          </div>

          {/* Tabs (Feature 6) */}
          <div className="flex gap-2 border-b border-slate-100 dark:border-slate-700 pb-0">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sologroup', label: '👤 Solo vs 👥 Group' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase">About the Journey</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Experience the magic of {data.name}. This destination offers a unique blend of {data.tags?.join(', ')} and stunning landscapes. Whether you're looking for a peaceful retreat or an adventurous getaway, {data.name.split(',')[0]} has something for everyone.
                    </p>

                    {/* AI Captions (Feature 5) */}
                    <div className="pt-4">
                      <button
                        onClick={handleGenerateCaptions}
                        disabled={loadingCaptions}
                        className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-100 dark:border-emerald-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Type className="w-4 h-4" />
                        {loadingCaptions ? 'Writing...' : '📸 Generate IG Captions'}
                      </button>

                      {captions.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {captions.map((cap, i) => (
                            <div key={i} className="flex justify-between items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic">"{cap}"</p>
                              <button onClick={() => handleCopy(cap, i)} className="shrink-0 text-slate-400 hover:text-emerald-500 transition-all p-1">
                                {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] font-bold uppercase tracking-wider">Copy</span>}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Estimated Budget</h4>
                        <span className="text-emerald-600 font-black">{data.price}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400"><span>Accommodation</span><span>₹15k+</span></div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full w-[70%]" /></div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400"><span>Flights</span><span>₹25k+</span></div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden"><div className="bg-sky-400 h-full w-[45%]" /></div>
                      </div>
                    </div>

                    <button onClick={handleQuickPlan} className="w-full py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-3">
                      Plan Itinerary to {data.name.split(',')[0]} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="sologroup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {loadingSG ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-500 font-medium text-sm">AI is comparing...</span>
                  </div>
                ) : soloGroupData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Solo Column */}
                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-3xl p-6 border border-sky-100 dark:border-sky-800">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-sky-100 dark:bg-sky-800 rounded-2xl flex items-center justify-center">
                          <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h3 className="text-sm font-black text-sky-700 dark:text-sky-300 uppercase tracking-widest">Solo Travel</h3>
                      </div>
                      <ul className="space-y-3">
                        {solo.map((pt, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <span className="mt-1 w-5 h-5 bg-sky-200 dark:bg-sky-700 rounded-full flex items-center justify-center text-[10px] font-black text-sky-700 dark:text-sky-200 shrink-0">{i + 1}</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Group Column */}
                    <div className="bg-violet-50 dark:bg-violet-900/20 rounded-3xl p-6 border border-violet-100 dark:border-violet-800">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-violet-100 dark:bg-violet-800 rounded-2xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-sm font-black text-violet-700 dark:text-violet-300 uppercase tracking-widest">Group Travel</h3>
                      </div>
                      <ul className="space-y-3">
                        {group.map((pt, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <span className="mt-1 w-5 h-5 bg-violet-200 dark:bg-violet-700 rounded-full flex items-center justify-center text-[10px] font-black text-violet-700 dark:text-violet-200 shrink-0">{i + 1}</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">No data available</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
