import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Wallet, Users, Heart, Send, CheckCircle2, Plane, Sparkles, Loader2, Clock, Navigation, Hotel } from 'lucide-react';
import { generateDetailedItinerary } from '../../services/aiService';
import { fetchFlights, fetchHotels } from '../../services/travelApi';
import PlanMap from '../../components/PlanTrip/PlanMap';
import MagneticButton from '../../components/UI/MagneticButton';
import TypingText from '../../components/UI/TypingText';
import toast from 'react-hot-toast';

const PlanTrip = () => {
  const [formData, setFormData] = useState({
    destination: '',
    dates: '',
    budget: 'Medium',
    travelers: 1,
    interests: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [logistics, setLogistics] = useState({ flights: [], hotels: [] });
  const [generationProgress, setGenerationProgress] = useState(0);

  const interestsList = ['Culture', 'Adventure', 'Food', 'Relaxation', 'Nightlife', 'Shopping'];

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerate = async () => {
    if (!formData.destination) return;

    setIsGenerating(true);
    setItinerary([]);
    setLogistics({ flights: [], hotels: [] });
    setGenerationProgress(0);

    try {
      const [fullItinerary, flights, hotels] = await Promise.all([
        generateDetailedItinerary(formData),
        fetchFlights("DEL", formData.destination.slice(0, 3).toUpperCase(), "2026-05-10"),
        fetchHotels(formData.destination.slice(0, 3).toUpperCase())
      ]);

      setLogistics({ flights, hotels });

      for (let i = 0; i < fullItinerary.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setItinerary(prev => [...prev, fullItinerary[i]]);
        setGenerationProgress(((i + 1) / fullItinerary.length) * 100);
      }

      toast.success("Journey Architected!");
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-32 px-2">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Panel: Clean Studio */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:w-[40%] bg-white rounded-[3rem] p-12 shadow-soft border border-gray-100 space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic">Itinerary <br/> <span className="text-emerald-500">Architect</span></h2>
              </div>
              <p className="text-gray-500 font-medium text-lg leading-relaxed">
                Define your travel vibe. Our AI engine will architect a bespoke discovery path for your next escape.
              </p>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination</label>
                <input type="text" placeholder="e.g. Kyoto, Japan" className="input-premium w-full bg-gray-50/50 border-gray-100" value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Launch Date</label>
                  <input type="date" className="input-premium w-full bg-gray-50/50 border-gray-100" value={formData.dates} onChange={(e) => setFormData({...formData, dates: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Travelers</label>
                  <input type="number" className="input-premium w-full bg-gray-50/50 border-gray-100" value={formData.travelers} onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget Strategy</label>
                <div className="flex gap-4">
                  {['Low', 'Medium', 'Luxury'].map(b => (
                    <button key={b} onClick={() => setFormData({...formData, budget: b})} className={`flex-1 py-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest ${formData.budget === b ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-200'}`}>{b}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interests</label>
                <div className="flex flex-wrap gap-2.5">
                  {interestsList.map(interest => (
                    <button key={interest} onClick={() => toggleInterest(interest)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${formData.interests.includes(interest) ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-900'}`}>{interest}</button>
                  ))}
                </div>
              </div>

              <MagneticButton className="w-full">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.destination}
                  className="w-full btn-premium py-6 flex items-center justify-center gap-4"
                >
                  {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> ARCHITECTING...</> : <>GENERATE JOURNEY <Send className="w-4 h-4" /></>}
                </button>
              </MagneticButton>
            </div>
          </motion.div>

          {/* Right Panel: Live Generative Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:w-[60%] bg-white rounded-[3rem] shadow-soft border border-gray-100 flex flex-col min-h-[900px] overflow-hidden sticky top-32"
          >
            <div className="p-10 border-b border-gray-50">
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tighter text-gray-900 italic uppercase">Live <span className="text-emerald-500">Architecture</span></h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">Generative Insight Engine</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {isGenerating ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /> : <Sparkles className="w-6 h-6 text-gray-300" />}
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${generationProgress}%` }} className="h-full bg-emerald-500" />
              </div>
            </div>
            
            <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {itinerary.length > 0 ? (
                  <div className="space-y-12">
                    <div className="h-[400px] rounded-[2.5rem] overflow-hidden border border-gray-100 relative shadow-inner">
                      <PlanMap itinerary={itinerary} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      <div className="space-y-10">
                        {itinerary.map((day, i) => (
                          <motion.div key={day.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative pl-10">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100" />
                            <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-emerald-500" />
                            <h5 className="font-black text-emerald-600 mb-6 text-[11px] uppercase tracking-widest">Day 0{day.day} — {day.title}</h5>
                            <div className="space-y-4">
                              {day.activities.map((act, idx) => (
                                <div key={idx} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                  <div className="flex items-center gap-2 mb-2">
                                     <Clock className="w-4 h-4 text-gray-300" />
                                     <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{act.time}</span>
                                  </div>
                                  <h6 className="font-bold text-gray-900 text-lg mb-2">{act.title}</h6>
                                  <TypingText text={act.description} className="text-sm text-gray-500 font-medium leading-relaxed" delay={15} />
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-8">
                         <div className="bg-gray-50/50 border border-gray-100 p-8 space-y-6 rounded-[2.5rem]">
                            <div className="flex items-center gap-3">
                               <Plane className="w-5 h-5 text-emerald-500" />
                               <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Flight Logistics</span>
                            </div>
                            {logistics.flights.map((f, i) => (
                              <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                                 <div>
                                    <p className="font-bold text-gray-900 text-base">{f.airline}</p>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase mt-1">{f.duration} • Direct</p>
                                 </div>
                                 <span className="text-xl font-black text-emerald-600">{f.price}</span>
                              </div>
                            ))}
                         </div>

                         <div className="bg-gray-50/50 border border-gray-100 p-8 space-y-6 rounded-[2.5rem]">
                            <div className="flex items-center gap-3">
                               <Hotel className="w-5 h-5 text-emerald-500" />
                               <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Curated Stays</span>
                            </div>
                            {logistics.hotels.map((h, i) => (
                              <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                                 <div>
                                    <p className="font-bold text-gray-900 text-base">{h?.name?.split(' ').slice(0, 2).join(' ') || 'Hotel'}</p>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase mt-1">★ {h.rating || '4.8'} • Boutique</p>
                                 </div>
                                 <span className="text-xl font-black text-emerald-600">{h.price}</span>
                              </div>
                            ))}
                         </div>

                         <MagneticButton className="w-full">
                            <button className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200">
                               Complete Journey Booking
                            </button>
                         </MagneticButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-20">
                    <div className="w-40 h-40 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                      <Plane className="w-16 h-16 text-gray-200 -rotate-12" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-3xl font-black text-gray-300 tracking-tighter italic uppercase">Waiting for architect input</h4>
                      <p className="text-gray-400 font-bold text-sm max-w-xs mx-auto uppercase tracking-widest leading-loose">Enter your travel vibe to witness the discovery process in real-time.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlanTrip;
