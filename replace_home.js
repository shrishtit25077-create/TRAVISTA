const fs = require('fs');

const code = `import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ArrowRight, MapPin, Star, MessageSquare, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { destinations as allDestinations } from '../../data/destinations';
import HomeHero from './HomeHero';
import { useDestinationPhotos, usePlace, useWeather } from '../../hooks/useTravista';

export const DestinationCard = ({ item, size = 'medium', layout = 'grid' }) => {
  const navigate = useNavigate();
  const { savedPlaces, toggleSave } = useAuth();
  
  const isSaved = savedPlaces.some((p) => p.id === item.id);

  const { photos } = useDestinationPhotos(item.name, 1);
  const { place } = usePlace(item.name);
  const { weather } = useWeather(item.name);

  const imageUrl = photos?.[0]?.url || item.image; 
  const rating = place?.rating || item.rating;
  const temp = weather?.temp ? \`\${weather.temp}°C\` : '';

  const handleClick = () => {
    navigate(\`/destination/\${item.id}\`, { state: item });
  };

  const catColors = {
    'Beach': 'bg-blue-500/80 text-blue-100',
    'Culture': 'bg-purple-500/80 text-purple-100',
    'Weekend': 'bg-teal-500/80 text-teal-100',
    'Adventure': 'bg-amber-500/80 text-amber-100',
  };
  const badgeClass = catColors[item.category] || 'bg-gray-500/80 text-gray-100';

  let containerClass = 'h-[320px]'; // hidden gems
  if (layout === 'luxury') containerClass = 'h-[500px]';
  else if (layout === 'trending' || layout === 'personalized') containerClass = 'h-[400px]';

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.02, filter: 'brightness(1.05)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={\`relative rounded-[1.5rem] overflow-hidden cursor-pointer group shadow-xl flex flex-col \${containerClass} bg-[#1e293b]\`}
    >
      <img
        src={imageUrl}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        alt={item.name}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

      {/* Top Left: Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className={\`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md \${badgeClass}\`}>
          {item.category}
        </span>
      </div>

      {/* Top Right: Actions */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSave(item); }}
          className={\`w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-all \${isSaved ? 'bg-red-500/90 text-white' : 'bg-black/40 text-white hover:bg-[#1D9E75]'}\`}
        >
          <Heart className={\`w-4 h-4 \${isSaved ? 'fill-current' : ''}\`} />
        </button>
        <button
          className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#1D9E75] transition-all"
          onClick={(e) => { e.stopPropagation(); navigate(\`/map?focus=\${item.id}\`); }}
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-10">
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg w-fit mb-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-white">{rating}</span>
          </div>
        )}

        <h3 className="text-xl font-bold text-white tracking-wide group-hover:text-[#1D9E75] transition-colors">
          {item.name}
        </h3>
        <p className="text-sm font-medium text-white/70 line-clamp-1 mt-1">
          {item.description || item.location}
        </p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-sm font-bold text-white">{item.price} <span className="text-white/50 text-xs font-normal">per person</span></p>
          {temp && (
             <p className="text-sm font-bold text-teal-300">{temp}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SectionRow = ({ title, data, subtitle, layout }) => {
  let gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  if (layout === 'luxury') gridClass = "grid grid-cols-1 md:grid-cols-2 gap-8";
  else if (layout === 'hidden') gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && (
            <span className="text-[10px] font-bold bg-[#1D9E75]/20 text-[#1D9E75] px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#1D9E75]/30">
              {subtitle}
            </span>
          )}
        </div>
        <button className="text-sm font-medium text-white/60 hover:text-[#1D9E75] transition-colors flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className={gridClass}>
        {data.map((item) => (
          <DestinationCard key={item.id} item={item} layout={layout} />
        ))}
      </div>
    </div>
  );
};

const AIBar = ({ onSuggest }) => {
  return (
    <div className="max-w-[1400px] mx-auto px-6 mt-8 mb-16">
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1D9E75]/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#1D9E75]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Ask AI — plan your trip instantly</h3>
            <p className="text-white/60 text-sm mt-0.5">Describe your dream trip and Claude will build a full itinerary</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 flex-1 justify-center lg:justify-start">
          {[
            "7 days in Rajasthan under ₹50k",
            "Beach honeymoon in December",
            "Solo backpacking Southeast Asia",
            "Family trip to Himachal"
          ].map((sug) => (
            <button 
              key={sug}
              onClick={() => onSuggest(sug)}
              className="bg-white/5 border border-white/10 hover:border-[#1D9E75]/50 hover:bg-[#1D9E75]/10 text-white/80 hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              {sug}
            </button>
          ))}
        </div>

        <button 
          onClick={() => onSuggest("")}
          className="shrink-0 bg-[#1D9E75] hover:bg-[#15825f] text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(29,158,117,0.3)]"
        >
          Plan with AI <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AITripPlanner = ({ initialMessage, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialMessage || "");
  const [isOpen, setIsOpen] = useState(!!initialMessage);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialMessage && !isOpen) {
      setIsOpen(true);
      setInput(initialMessage);
    }
  }, [initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (e, forcedInput) => {
    e?.preventDefault();
    const messageToSend = forcedInput || input;
    if (!messageToSend.trim() || loading) return;

    const userMsg = { role: "user", content: messageToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!forcedInput) setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("Missing VITE_ANTHROPIC_API_KEY in .env");
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: "You are Travista's AI trip planner. When a user describes their trip, respond with a concise day-by-day itinerary including top attractions, local food recommendations, and a rough budget breakdown in INR. Keep responses friendly and under 150 words. Always ask one follow-up question at the end.",
          messages: newMessages
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to fetch from Claude");
      }

      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.content[0].text };
      setMessages([...newMessages, assistantMsg]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: \`Error: \${err.message}\` }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialMessage && messages.length === 0) {
      sendMessage(null, initialMessage);
    }
  }, [isOpen, initialMessage]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1D9E75] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-[#111827] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="bg-[#1D9E75] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold">AI Trip Planner</h3>
        </div>
        <button onClick={() => { setIsOpen(false); onClose?.(); }} className="text-white/80 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1120] text-white">
        {messages.length === 0 && !loading && (
          <div className="text-center mt-10 space-y-4">
            <p className="text-white/50 text-sm">Start by describing your dream trip!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                "Adventure in Manali",
                "Luxury stay in Maldives",
                "Spiritual journey in Varanasi"
              ].map(sug => (
                <button
                  key={sug}
                  onClick={() => setInput(sug)}
                  className="bg-white/5 border border-white/10 hover:border-[#1D9E75]/50 hover:bg-[#1D9E75]/10 text-white/80 hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`max-w-[85%] rounded-2xl px-4 py-2 text-sm \${
              msg.role === 'user' 
                ? 'bg-[#1D9E75] text-white rounded-br-none' 
                : 'bg-white/10 text-white rounded-bl-none border border-white/5 whitespace-pre-wrap'
            }\`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white/70 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 border border-white/5">
              <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#111827] border-t border-white/10">
        <form onSubmit={(e) => sendMessage(e)} className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="E.g. 5 days in Kerala..."
            className="w-full bg-[#0B1120] text-white text-sm rounded-full pl-4 pr-12 py-3 outline-none border border-white/10 focus:border-[#1D9E75]/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categoryMap = {
    "Relaxing Beach": "Beach",
    "Mountain Adventure": "Adventure",
    "Cultural History": "Culture",
    "Food Tour": "Food",
    "Weekend Getaway": "Weekend",
    "Hill Stations": "Hill",
    "Spiritual": "Spiritual",
    "Budget ₹": "Budget"
  };

  const filteredData = useMemo(() => {
    let data = allDestinations;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.category.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q)) ||
        (q === 'budget' && d.numericPrice < 50000) ||
        (q === 'luxury' && d.numericPrice > 150000)
      );
    }

    if (activeCategory !== 'All') {
      const cat = categoryMap[activeCategory];
      if (cat === 'Budget') {
        data = data.filter(d => d.numericPrice < 50000);
      } else {
        data = data.filter(d => d.category === cat);
      }
    }

    return data;
  }, [activeCategory, debouncedSearch]);

  const sections = useMemo(() => {
    if (filteredData.length === 0) return [];

    const trending = [...filteredData].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 6);
    const luxury = filteredData.filter(d => d.numericPrice > 140000).slice(0, 4);
    const gems = filteredData.filter(d => (d.popularity || 0) < 85 && d.rating >= 4.7).slice(0, 8);
    
    const interests = user?.preferences?.interests || ['beach', 'culture'];
    const personalized = filteredData.filter(d => 
      d.tags?.some(t => interests.includes(t)) || 
      interests.includes(d.type)
    ).slice(0, 6);

    const result = [];
    if (trending.length > 0) result.push({ id: 'trending', title: 'Trending Now', data: trending, layout: 'trending' });
    if (personalized.length > 0) result.push({ id: 'personalized', title: \`Because you like Discovery\`, subtitle: 'Personalized', data: personalized, layout: 'personalized' });
    if (luxury.length > 0) result.push({ id: 'luxury', title: 'Luxury Escapes', data: luxury, layout: 'luxury' });
    if (gems.length > 0) result.push({ id: 'gems', title: 'Hidden Gems', data: gems, layout: 'hidden' });

    return result;
  }, [filteredData, user]);

  return (
    <div className="bg-[#0B1120] min-h-screen">
      <div className="pt-8">
        <div className="max-w-7xl mx-auto px-8">
          <HomeHero 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>

      <AIBar onSuggest={(msg) => setAiSuggestion(msg)} />

      <div className="space-y-24 pb-40">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="max-w-[1400px] mx-auto px-6 space-y-12 py-10"
            >
              <div className="h-10 bg-white/10 rounded-full w-1/4 animate-pulse mb-8" />
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[400px] h-[400px] bg-white/5 rounded-[1.5rem] animate-pulse" />
                ))}
              </div>
            </motion.div>
          ) : sections.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Navigation className="w-10 h-10 text-white/20 transform -rotate-45" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight italic mb-2">No destinations found.</h3>
              <p className="text-white/40 font-medium max-w-sm mx-auto">Try adjusting your search or filters to explore more places.</p>
            </motion.div>
          ) : (
            sections.map((section) => (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <SectionRow title={section.title} subtitle={section.subtitle} data={section.data} layout={section.layout} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AITripPlanner initialMessage={aiSuggestion} onClose={() => setAiSuggestion(null)} />
    </div>
  );
};

export default Home;
`
fs.writeFileSync('src/pages/Home/Home.jsx', code);
