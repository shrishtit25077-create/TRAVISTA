import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, MapPin, Calendar, Wallet, 
  Utensils, Bed, Info, Cloud, ArrowRight, 
  RefreshCcw, User, Bot, Mic, ChevronRight,
  Heart, Download, Map, Share2, Compass,
  AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { generateNewTrip } from '../../services/ai';
import toast from 'react-hot-toast';

// ─── Sub-Components ─────────────────────────────────────────────────────────

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className="p-8 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-soft hover:border-emerald-200 transition-all text-left group"
  >
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-base font-black text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const TimelineItem = ({ day }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    className="relative pl-12 pb-8 last:pb-0"
  >
    {/* Visual Line */}
    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent" />
    
    {/* Day Indicator */}
    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-lg z-10">
      <span className="text-[10px] font-black text-emerald-600">{day.day}</span>
    </div>

    <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-[2rem] p-6 md:p-8 shadow-soft hover:shadow-xl transition-all group">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-xl md:text-2xl font-black text-gray-900 italic tracking-tight">{day.title}</h3>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-emerald-50 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100/50">
            {day.food.split(' ')[0]} Focus
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          { time: 'Morning', icon: '🌅', text: day.morning, color: 'text-orange-500', bg: 'bg-orange-50' },
          { time: 'Afternoon', icon: '☀️', text: day.afternoon, color: 'text-blue-500', bg: 'bg-blue-50' },
          { time: 'Evening', icon: '🌙', text: day.evening, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((act, i) => (
          <div key={i} className="space-y-3">
            <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center text-xl`}>
              {act.icon}
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${act.color} block mb-1`}>{act.time}</span>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                <StreamingText text={act.text} speed={10} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100/50 flex flex-wrap gap-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
            <Bed size={18} />
          </div>
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Recommended Stay</span>
            <span className="text-sm font-bold text-gray-800">{day.stay}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
            <Utensils size={18} />
          </div>
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Dining Experience</span>
            <span className="text-sm font-bold text-gray-800">{day.food}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const LoadingBubble = () => (
  <div className="flex justify-start items-start gap-4 py-8">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
      <RefreshCcw size={24} className="text-emerald-500 animate-spin" />
    </div>
    <div className="space-y-4 flex-1 max-w-lg">
      <div className="bg-white/60 backdrop-blur-md border border-gray-100 rounded-[2rem] p-6 space-y-3">
        <div className="flex gap-2 mb-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="h-3 bg-gray-100 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse" />
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic pt-2">
          Crafting your bespoke journey...
        </p>
      </div>
    </div>
  </div>
);

const StreamingText = ({ text, speed = 20, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <span>{displayedText}</span>;
};

// ─── Main Component ──────────────────────────────────────────────────────────

const AIPlanner = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('travista_ai_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentPrompts, setRecentPrompts] = useState(() => {
    const saved = localStorage.getItem('travista_recent_prompts');
    return saved ? JSON.parse(saved) : [];
  });
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('travista_ai_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('travista_recent_prompts', JSON.stringify(recentPrompts));
  }, [recentPrompts]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleGenerate = async (overriddenQuery = null) => {
    const finalQuery = overriddenQuery || query;
    if (!finalQuery.trim() || loading) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: finalQuery }]);
    setQuery('');
    setLoading(true);

    try {
      const plan = await generateNewTrip(finalQuery);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: plan }]);
      
      // Save to recent prompts if it's a new one
      if (!recentPrompts.includes(finalQuery)) {
        setRecentPrompts(prev => [finalQuery, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error("[AI Planner] Generation error:", err);
      // generateNewTrip now handles fallback internally, so this catch is just for extreme cases
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-60 relative overflow-hidden bg-slate-50/50">
      
      {/* Ambient Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-teal-200/20 blur-[120px] rounded-full pointer-events-none" />

      {/* 1. Hero Section */}
      <section className="pt-24 pb-20 px-6 text-center max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full text-emerald-600 border border-emerald-100/50 shadow-sm">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Travista AI Architect Pro</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight leading-[0.9] lg:leading-[0.85]">
            Plan Your Perfect <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 italic pb-2">
              Journey with AI
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Experience the next generation of travel design. Describe your mood, and we'll craft a bespoke itinerary in real-time.
          </p>
        </motion.div>
      </section>

      {/* 2. Chat / Content Workspace */}
      <main className="max-w-5xl mx-auto px-6 relative z-10">
        
        <div className="space-y-16 mb-32">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4"
              >
                <FeatureCard icon={Compass} title="Bespoke Routes" desc="Routes hand-crafted for your specific travel personality." />
                <FeatureCard icon={Wallet} title="Financial Clarity" desc="Complete budget breakdowns for total peace of mind." />
                <FeatureCard icon={Sparkles} title="Luxury Stays" desc="Curated hotel suggestions matching your preferred tier." />
                <FeatureCard icon={Utensils} title="Culinarty Trips" desc="Discover authentic dining spots known only to locals." />
                <FeatureCard icon={Map} title="Visual Timelines" desc="A clear, chronological flow of your upcoming adventure." />
                <FeatureCard icon={CheckCircle2} title="Verified Tips" desc="Pro travel advice verified by our global network." />
              </motion.div>
            ) : (
              <div className="space-y-24">
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] md:max-w-[100%] ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                      
                      {msg.type === 'user' ? (
                        <div className="bg-gray-900 text-white px-10 py-6 rounded-[3rem] rounded-tr-lg inline-block shadow-2xl shadow-gray-200">
                          <p className="text-lg font-bold italic tracking-wide">{msg.content}</p>
                        </div>
                      ) : (
                        <div className="space-y-12">
                          {/* Bot Branding */}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white text-emerald-500 rounded-2xl flex items-center justify-center shadow-sm border border-gray-50">
                              <Bot size={24} />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest italic">AI Architect</h4>
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimized Itinerary</p>
                            </div>
                          </div>

                          {/* Success Card */}
                          <motion.div 
                            layoutId={`plan-${msg.id}`}
                            className="bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 shadow-soft relative overflow-hidden group/card"
                          >
                            {/* Ambient Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/30 blur-[80px] rounded-full group-hover/card:bg-emerald-200/40 transition-colors duration-700" />
                            
                            <div className="relative z-10 space-y-6 md:space-y-8">
                              <div className="space-y-3 md:space-y-4">
                                <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight italic leading-tight">
                                  <StreamingText text={msg.content.title} speed={30} />
                                </h2>
                                <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-3xl">
                                  <StreamingText text={msg.content.summary} speed={10} />
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                  <Calendar size={16} className="text-emerald-500" /> {msg.content.bestSeason}
                                </div>
                                <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                  <Wallet size={16} className="text-emerald-500" /> {msg.content.budget}
                                </div>
                                <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                  <Cloud size={16} className="text-emerald-500" /> {msg.content.weather}
                                </div>
                              </div>
                            </div>
                            <Sparkles className="absolute top-[-40px] right-[-40px] w-96 h-96 text-emerald-500 opacity-[0.03] rotate-12" />
                          </motion.div>

                          {/* Timeline Section */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] pl-1 mb-6 flex items-center gap-4">
                              <Clock size={14} /> Chronological Flow
                            </h4>
                            <motion.div 
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: { transition: { staggerChildren: 0.3 } }
                              }}
                              className="space-y-2"
                            >
                              {msg.content.days?.map((day, di) => (
                                <TimelineItem key={di} day={day} />
                              ))}
                            </motion.div>
                          </div>

                          {/* Summary & Footer */}
                          <div className="bg-gray-900 rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                              <div>
                                <h4 className="text-2xl font-black italic mb-8 flex items-center gap-3">
                                  <Sparkles size={24} className="text-emerald-400" /> Insider Tips
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                  {msg.content.tips?.map((tip, ti) => (
                                    <div key={ti} className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10">
                                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_#34d399]" />
                                      <p className="text-sm text-gray-300 font-medium leading-relaxed">{tip}</p>
                                    </div>
                                  ))}
                                </div>

                                {msg.content.hiddenGems && (
                                  <div className="space-y-4">
                                    <h5 className="text-xs font-black uppercase tracking-widest text-emerald-400">💎 Hidden Gems</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {msg.content.hiddenGems.map((gem, gi) => (
                                        <span key={gi} className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold text-emerald-100 border border-white/5">
                                          {gem}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col justify-center lg:items-end space-y-6 md:space-y-8">
                                <div className="text-right">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1 md:mb-2">Final Step</p>
                                  <h5 className="text-2xl md:text-3xl font-black italic">Ready for takeoff?</h5>
                                </div>
                                <div className="flex flex-wrap justify-end gap-3 md:gap-4">
                                  <button className="px-8 md:px-10 py-4 md:py-5 bg-white text-gray-900 rounded-2xl md:rounded-[1.5rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all shadow-xl">
                                    Download PDF
                                  </button>
                                  <button className="px-8 md:px-10 py-4 md:py-5 bg-gray-800 text-white rounded-2xl md:rounded-[1.5rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all border border-white/10">
                                    Share Trip
                                  </button>
                                </div>
                              </div>
                            </div>
                            <Bot className="absolute bottom-[-60px] left-[-60px] w-[500px] h-[500px] text-white/[0.02] -rotate-12 pointer-events-none" />
                          </div>

                        </div>
                      )}

                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {loading && <LoadingBubble />}

          <div ref={chatEndRef} className="h-10" />
        </div>

        {/* 3. Floating Input */}
        <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
          <div className="max-w-5xl mx-auto px-6 pb-10 md:pb-16 pt-10 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent">
            <div className="pointer-events-auto relative">
              
              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8 max-w-4xl mx-auto px-4">
                {(recentPrompts.length > 0 ? recentPrompts : ['7-day Japan itinerary', 'Luxury Paris escape', 'Budget Bali adventure']).map(text => (
                  <button 
                    key={text}
                    onClick={() => handleGenerate(text)}
                    className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-white border border-gray-100 text-[9px] md:text-[11px] font-black text-gray-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-2 md:gap-3 uppercase tracking-widest whitespace-nowrap"
                  >
                    <Compass size={12} className="text-emerald-400 md:w-3.5 md:h-3.5" />
                    {text}
                  </button>
                ))}
              </div>

              {/* Main Search */}
              <div className="relative group max-w-3xl mx-auto px-4 md:px-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-[2rem] md:rounded-[3rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-1000 animate-pulse" />
                <div className="relative bg-white border border-gray-100 rounded-3xl md:rounded-[3rem] p-2 md:p-4 pr-2 md:pr-4 pl-6 md:pl-10 shadow-2xl flex items-center gap-3 md:gap-4 group-focus-within:border-emerald-200 transition-all">
                  <Sparkles className="text-emerald-500 shrink-0 w-5 h-5 md:w-6 md:h-6" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Describe your perfect trip..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 font-bold placeholder-gray-300 py-3 md:py-4 text-sm md:text-lg"
                  />
                  <button 
                    onClick={() => handleGenerate()}
                    disabled={loading || !query.trim()}
                    className="h-12 md:h-16 px-6 md:px-10 bg-gray-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase text-[9px] md:text-[11px] tracking-[0.2em] hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center gap-2 md:gap-3 disabled:opacity-30"
                  >
                    {loading ? 'Designing...' : 'Generate'}
                    <ChevronRight size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};

export default AIPlanner;
