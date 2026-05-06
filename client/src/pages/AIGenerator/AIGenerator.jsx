import React, { useState } from 'react';
import { Sparkles, Navigation, Calendar, Wallet, MapPin, Search, ArrowRight, Save } from 'lucide-react';
import { generateTripPlan } from '../../services/aiService';
import ItineraryMap from '../../components/AIGenerator/ItineraryMap';
import { motion, AnimatePresence } from 'framer-motion';

const AIGenerator = () => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    setGeneratedTrip(null);
    
    try {
      // For the demo, we'll extract the destination name from the input string simple-mindedly
      const destMatch = input.match(/(Bali|Paris|Kyoto|Tokyo|London|Rome|New York|Dubai)/i);
      const destination = destMatch ? destMatch[0] : "Bali";
      
      const plan = await generateTripPlan(destination, 5, ["beach", "culture"], "mid");
      setGeneratedTrip(plan);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const SuggestionChip = ({ text }) => (
    <button 
      onClick={() => setInput(text)}
      className="px-5 py-2.5 rounded-full bg-white border border-primary-border text-sm font-bold text-slate-600 hover:border-[#1f6f63] hover:text-[#1f6f63] transition-all shadow-sm whitespace-nowrap active:scale-95"
    >
      {text}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto pb-32 pt-16 px-6">
      
      {/* Dynamic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f6f63]/5 rounded-full text-[#1f6f63] border border-[#1f6f63]/10">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">AI Co-Pilot</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Where is your <br/> heart leading <span className="text-[#1f6f63]">you?</span>
        </h1>
        <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
          Describe your dream escape, and our AI will craft a personalized journey with routes, stays, and hidden gems.
        </p>
      </motion.div>

      {/* Search Input Area */}
      <div className="max-w-3xl mx-auto mb-20 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#1f6f63]/20 to-[#8FDAC7]/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative bg-white p-4 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center gap-4 border border-primary-border/60 group">
          <div className="flex-1 w-full flex items-center px-6 gap-4">
            <Sparkles className="w-6 h-6 text-[#1f6f63]" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g. A 5-day cultural deep dive in Kyoto" 
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-300 text-xl font-bold py-2"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="w-full md:w-auto px-10 py-5 bg-[#1f6f63] text-white rounded-[1.8rem] font-black uppercase text-xs tracking-widest hover:bg-[#165a50] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                Generate Trip
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {!generatedTrip && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-wrap justify-center gap-3 mt-10"
            >
              <SuggestionChip text="A quiet beach in Bali" />
              <SuggestionChip text="Cultural tour in Kyoto" />
              <SuggestionChip text="A luxury weekend in Paris" />
              <SuggestionChip text="Adventure in the Swiss Alps" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Area */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
           <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-100 border-t-[#1f6f63] rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#1f6f63] animate-pulse" />
           </div>
           <div className="text-center">
              <p className="text-2xl font-black text-slate-900 tracking-tight">AI Co-Pilot is at work...</p>
              <p className="text-slate-400 font-medium">Analyzing destinations, calculating routes, and hand-picking stays.</p>
           </div>
        </div>
      )}

      {generatedTrip && !isGenerating && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* Left Panel: Itinerary Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl">
              <img src={generatedTrip.image} alt="Trip Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <h2 className="text-4xl font-black text-white mb-4 leading-tight">{generatedTrip.title}</h2>
                <div className="flex gap-6 text-white/90">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                    <Calendar className="w-4 h-4" /> {generatedTrip.duration}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">
                    <Wallet className="w-4 h-4" /> Est. {generatedTrip.cost}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-soft space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Your Journey</h3>
                <button className="flex items-center gap-2 text-[10px] font-black text-[#1f6f63] uppercase tracking-widest hover:underline">
                  <Save className="w-4 h-4" /> Save Itinerary
                </button>
              </div>
              
              <div className="space-y-10 relative">
                 {/* Visual timeline line */}
                 <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-50" />
                 
                 {generatedTrip.days.map((day, i) => (
                   <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 relative z-10"
                   >
                      <div className="w-12 h-12 rounded-full bg-[#1f6f63] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-[#1f6f63]/20">
                        {day.day}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-lg font-black text-slate-800 leading-tight">{day.title}</h4>
                        <p className="text-slate-400 font-medium leading-relaxed">{day.act}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Immersive Map View */}
          <div className="lg:col-span-7 space-y-8">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white border border-slate-100 rounded-[3rem] p-2 shadow-soft h-[700px] flex flex-col overflow-hidden">
                <div className="p-8 pb-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#1f6f63]/10 flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-[#1f6f63]" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Interactive Route Map</h3>
                   </div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">5 Verified Pins</div>
                </div>
                
                <div className="flex-1 p-6">
                  <ItineraryMap days={generatedTrip.days} />
                </div>

                <div className="p-8 pt-0 grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <MapPin className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Distance</p>
                      <p className="text-lg font-bold text-slate-800">42 km</p>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Navigation className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg. Travel</p>
                      <p className="text-lg font-bold text-slate-800">1.5 hrs/day</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1f6f63] rounded-[3rem] p-10 text-white flex items-center justify-between overflow-hidden relative shadow-2xl">
                 <div className="relative z-10 space-y-2">
                    <h4 className="text-2xl font-black tracking-tight">Ready for takeoff?</h4>
                    <p className="text-white/70 font-medium">Book your Bali retreat today with 15% off.</p>
                 </div>
                 <button className="relative z-10 px-8 py-4 bg-white text-[#1f6f63] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#8FDAC7] hover:text-white transition-all shadow-xl">
                    Finalize Bookings
                 </button>
                 <Sparkles className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default AIGenerator;
