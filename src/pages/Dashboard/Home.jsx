import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Search, MapPin, Star, Heart, Map, Sparkles } from 'lucide-react';
import HeroSection from '../../components/HeroSection';

const heroImages = {
  'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000',
  'mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000',
  'culture': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=2000',
  'food': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2000'
};

const preloadImages = () => {
  Object.values(heroImages).forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};

const DestinationCard = ({ image, name, location, rating, price, description, onAddToTrip, onHover, id, isSaved, toggleSaved, index, visa, season, food, flights }) => (
  <div 
    className="group cursor-pointer transition-all duration-500 mb-2"
    onMouseEnter={() => onHover && onHover(id)}
    onMouseLeave={() => onHover && onHover(null)}
  >
    <div className="relative h-[240px] md:h-[280px] lg:h-[320px] rounded-3xl overflow-hidden mb-3 shadow-soft group-hover:shadow-float transition-all duration-500 bg-surface-hover">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-text-main/90 via-text-main/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Visa Tag */}
      {visa && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm border border-white/20 text-white ${visa.toLowerCase().includes('free') || visa.toLowerCase() === 'no visa' ? 'bg-accent-lightSage' : visa.toLowerCase().includes('easy') ? 'bg-accent-sand' : 'bg-black/60'}`}>
            {visa}
          </span>
        </div>
      )}

      {/* Heart icon */}
      <motion.button 
        onClick={(e) => { e.stopPropagation(); toggleSaved(id); }}
        className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-accent-sage transition-all duration-300 active:scale-95 z-10 border border-white/20"
        whileTap={{ scale: 0.9 }}
      >
        <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'fill-accent-sage text-accent-sage' : ''}`} />
      </motion.button>

      {/* Info on hover/bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5 z-10">
        <div className="flex items-center justify-between text-white mb-0.5">
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide"><Star className="w-3 h-3 fill-accent-sand text-accent-sand" /> {rating}</span>
          <span className="text-xs font-black tracking-tight">{price}</span>
        </div>
        <h3 className="text-xl font-black text-white tracking-tighter leading-tight line-clamp-1">{name}</h3>
        
        <div className="flex flex-wrap gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {season && <span className="text-[8px] font-bold tracking-wide px-2 py-0.5 rounded bg-black/40 text-white border border-white/10">{season}</span>}
          {food && <span className="text-[8px] font-bold tracking-wide px-2 py-0.5 rounded bg-black/40 text-white border border-white/10">{food}</span>}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onAddToTrip({ id, name, image, price }); }}
          className="mt-2 w-full py-2.5 bg-white text-text-main text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        >
          + Add to Trip
        </button>
      </div>
    </div>
  </div>
);



const TripBuilder = ({ tripDays, onRemove, onDrop }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-primary-border shadow-soft p-8 sticky top-32">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text-main tracking-tight">My Itinerary</h2>
        <span className="text-xs font-bold text-accent-sage bg-accent-sage/10 px-3 py-1.5 rounded-full">{tripDays.reduce((acc, day) => acc + day.items.length, 0)} spots</span>
      </div>
      
      <div className="space-y-8">
        {tripDays.map((day, dayIndex) => (
          <div 
            key={day.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const data = e.dataTransfer.getData('destination');
              if (data) {
                onDrop(dayIndex, JSON.parse(data));
              }
            }}
            className="relative"
          >
            {dayIndex !== 0 && <div className="absolute -top-4 left-4 right-4 h-[1px] bg-primary-border/50" />}
            <h3 className="text-sm font-bold text-accent-sage uppercase tracking-widest mb-4">Day {dayIndex + 1}</h3>
            
            <div className={`space-y-3 min-h-[80px] bg-primary/30 rounded-[1.5rem] p-3 border border-transparent transition-all duration-300 hover:bg-primary/60 ${day.items.length === 0 ? 'flex items-center justify-center border-dashed border-primary-border hover:border-accent-lightSage/50' : ''}`}>
              {day.items.length === 0 ? (
                <div className="text-sm text-text-muted text-center font-medium italic">
                  Drag destinations here
                </div>
              ) : (
                <AnimatePresence>
                  {day.items.map((item, itemIndex) => (
                    <motion.div 
                      key={`${item.id}-${itemIndex}`}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-4 bg-white p-2.5 rounded-[1.25rem] shadow-sm border border-primary-border/50 group hover:shadow-md transition-shadow"
                    >
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-main truncate">{item.name}</p>
                      </div>
                      <button 
                        onClick={() => onRemove(dayIndex, itemIndex)}
                        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 pt-6 border-t border-primary-border/60">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Est. Budget:</span>
          <span className="text-xl font-bold text-accent-sage">
            ₹{tripDays.reduce((acc, day) => acc + day.items.reduce((sum, item) => sum + parseInt((item.price || "0").replace(/[^\d]/g, '') || 0), 0), 0).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Duration:</span>
          <span className="text-sm font-bold text-text-main">{tripDays.length} Days</span>
        </div>
        
        {/* Travel Tip */}
        <div className="bg-accent-lightSage/10 border border-accent-lightSage/20 p-4 rounded-[1.5rem] mb-6">
          <p className="text-sm text-accent-lightSage font-medium leading-relaxed">💡 <span className="font-bold">Pro Tip:</span> Book international flights 3-4 weeks in advance to avoid currency surcharges.</p>
        </div>

        <button className="w-full py-4 bg-accent-sage text-white rounded-full font-bold text-sm hover:bg-accent-sageHover transition-all active:scale-95 shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-accent-sage/20">
          Review & Finalize
        </button>
      </div>
    </div>
  )
}

const destinationsData = [
  {
    id: 'd1',
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800",
    name: "Maldives",
    location: "Island Paradise",
    rating: 4.9,
    price: "₹85,000",
    description: "Crystal clear waters and overwater bungalows.",
    mapX: "68%",
    mapY: "58%",
    visa: "Visa-free",
    season: "Best: Nov-Apr",
    food: "Halal, Non-Veg",
    flights: "Direct from BOM/DEL (4h)"
  },
  {
    id: 'd2',
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    name: "Kyoto, Japan",
    location: "Culture & Heritage",
    rating: 4.8,
    price: "₹1,20,000",
    description: "Ancient temples and beautiful gardens.",
    mapX: "85%",
    mapY: "35%",
    visa: "Visa required",
    season: "Best: Mar-May",
    food: "Pure Veg Options",
    flights: "Via BKK/SIN (9h)"
  },
  {
    id: 'd3',
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800",
    name: "Santorini, Greece",
    location: "Scenic Beauty",
    rating: 4.7,
    price: "₹1,50,000",
    description: "Iconic white architecture and sunsets.",
    mapX: "55%",
    mapY: "40%",
    visa: "Visa required",
    season: "Best: Jun-Sep",
    food: "Non-Veg",
    flights: "Via DXB/DOH (12h)"
  },
  {
    id: 'd4',
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800",
    name: "Swiss Alps",
    location: "Nature & Adventure",
    rating: 4.9,
    price: "₹2,10,000",
    description: "Snow-capped peaks and skiing.",
    mapX: "52%",
    mapY: "32%",
    visa: "Visa required",
    season: "Best: Dec-Mar",
    food: "Jain, Pure Veg",
    flights: "Via ZRH (10h)"
  },
  {
    id: 'd5',
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800",
    name: "Goa, India",
    location: "Beaches & Nightlife",
    rating: 4.6,
    price: "₹15,000",
    description: "Vibrant beaches and Portuguese heritage.",
    mapX: "70%",
    mapY: "50%",
    visa: "No visa",
    season: "Warning: Monsoon (Jun-Aug)",
    food: "Pure Veg, Non-Veg",
    flights: "Direct from DEL/BOM (2h)"
  },
  {
    id: 'd6',
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=800",
    name: "Dubai, UAE",
    location: "Luxury & Shopping",
    rating: 4.8,
    price: "₹45,000",
    description: "Modern architecture and desert safaris.",
    mapX: "63%",
    mapY: "45%",
    visa: "Easy visa",
    season: "Warning: Extreme Heat (May-Sep)",
    food: "Halal, Pure Veg",
    flights: "Direct from DEL/BOM (3h)"
  }
];

const allSuggestions = [
  // Locations
  { type: 'Location', id: 'loc-1', icon: '📍', title: 'Paris, France', subtitle: 'City of Light', category: 'culture' },
  { type: 'Location', id: 'loc-2', icon: '📍', title: 'Bali, Indonesia', subtitle: 'Tropical Paradise', category: 'beach' },
  { type: 'Location', id: 'loc-3', icon: '📍', title: 'Kyoto, Japan', subtitle: 'Ancient Temples', category: 'culture' },
  { type: 'Location', id: 'loc-4', icon: '📍', title: 'Swiss Alps', subtitle: 'Mountain Escapes', category: 'mountain' },
  { type: 'Location', id: 'loc-5', icon: '📍', title: 'Amalfi Coast, Italy', subtitle: 'Coastal Beauty', category: 'beach' },
  
  // Categories
  { type: 'Category', id: 'cat-1', icon: '🌍', title: 'Beach Destinations', subtitle: 'Relax by the ocean', category: 'beach' },
  { type: 'Category', id: 'cat-2', icon: '🌍', title: 'Budget Trips', subtitle: 'Affordable travel', category: 'culture' },
  { type: 'Category', id: 'cat-3', icon: '🌍', title: 'Adventure Travel', subtitle: 'Thrill-seeking', category: 'mountain' },
  
  // Experiences
  { type: 'Experience', id: 'exp-1', icon: '🍜', title: 'Food Tours', subtitle: 'Culinary adventures', category: 'food' },
  { type: 'Experience', id: 'exp-2', icon: '🍸', title: 'Nightlife', subtitle: 'Best bars & clubs', category: 'culture' },
  { type: 'Experience', id: 'exp-3', icon: '🏛️', title: 'Cultural Exploration', subtitle: 'Historical sites', category: 'culture' },
];

const defaultSuggestions = [
  { type: 'Suggestion', id: 'def-1', icon: '💸', title: 'Try: Trips under ₹50,000', subtitle: 'Budget friendly getaways', category: 'beach' },
  { type: 'Suggestion', id: 'def-2', icon: '🛂', title: 'Try: Visa-free countries', subtitle: 'Hassle-free for Indians', category: 'culture' },
  { type: 'Suggestion', id: 'def-3', icon: '🚗', title: 'Try: Weekend from Mumbai', subtitle: 'Quick escapes nearby', category: 'mountain' }
];

const surpriseDestinations = [
  { title: 'Bali, Indonesia', category: 'beach' },
  { title: 'Maldives', category: 'beach' },
  { title: 'Dubai, UAE', category: 'culture' },
  { title: 'Goa, India', category: 'beach' },
  { title: 'Kerala, India', category: 'mountain' }
];

// Reusable scroll-reveal wrapper
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {

  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  
  const [isSurprising, setIsSurprising] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // New State for Map and Trip Builder
  const [tripDays, setTripDays] = useState([
    { id: 'day1', items: [] },
    { id: 'day2', items: [] },
    { id: 'day3', items: [] },
  ]);
  const [savedDests, setSavedDests] = useState(new Set());

  const handleAddToTrip = (dest) => {
    const newDays = [...tripDays];
    newDays[0].items.push(dest);
    setTripDays(newDays);
  };

  const handleDropToDay = (dayIndex, dest) => {
    const newDays = [...tripDays];
    newDays[dayIndex].items.push(dest);
    setTripDays(newDays);
  };

  const handleRemoveFromTrip = (dayIndex, itemIndex) => {
    const newDays = [...tripDays];
    newDays[dayIndex].items.splice(itemIndex, 1);
    setTripDays(newDays);
  };

  const toggleSaved = (id) => {
    setSavedDests(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    preloadImages(); // Preload all hero images for smooth switching
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    if (!debouncedSearchValue.trim()) {
      setSuggestions(defaultSuggestions);
      setSelectedIndex(-1);
      return;
    }
    
    const query = debouncedSearchValue.toLowerCase();
    const filtered = allSuggestions.filter(item => 
      item.title.toLowerCase().includes(query) || 
      (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
      item.type.toLowerCase().includes(query)
    );
    setSuggestions(filtered);
    setSelectedIndex(-1);
  }, [debouncedSearchValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    const cleanTitle = suggestion.title.startsWith('Try: ') ? suggestion.title.replace('Try: ', '') : suggestion.title;
    setSearchValue(cleanTitle);
    if (suggestion.category) {
      setActiveTheme(suggestion.category);
    }
    setIsSearchFocused(false);
  };

  const handleKeyDown = (e) => {
    if (!isSearchFocused) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (searchValue.trim()) {
        setIsSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const handleSurpriseMe = () => {
    setIsSurprising(true);
    setShowToast(false);
    
    // Pick random destination
    const randomIndex = Math.floor(Math.random() * surpriseDestinations.length);
    const dest = surpriseDestinations[randomIndex];
    
    // Micro delay for animation effect
    setTimeout(() => {
      setSearchValue(dest.title);
      setActiveTheme(dest.category);
      setIsSearchFocused(false);
      setShowToast(true);
    }, 150);

    setTimeout(() => {
      setIsSurprising(false);
    }, 500);

    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  const chips = [
    { id: 'beach', icon: '🏖️', label: 'Relaxing Beach' },
    { id: 'mountain', icon: '🏔️', label: 'Mountain Adventure' },
    { id: 'culture', icon: '🏛️', label: 'Cultural History' },
    { id: 'food', icon: '🍜', label: 'Food Tour' },
  ];

  return (
    <div className="pb-24 animate-fade-in relative z-10 bg-primary min-h-screen">

      {/* ── Hero Section ── */}
      <HeroSection
        activeTheme={activeTheme} setActiveTheme={setActiveTheme}
        searchValue={searchValue} setSearchValue={setSearchValue}
        isSearchFocused={isSearchFocused} setIsSearchFocused={setIsSearchFocused}
        suggestions={suggestions} debouncedSearchValue={debouncedSearchValue}
        selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}
        handleSelectSuggestion={handleSelectSuggestion} handleKeyDown={handleKeyDown}
        isSurprising={isSurprising} showToast={showToast} handleSurpriseMe={handleSurpriseMe}
        searchContainerRef={searchContainerRef}
      />



      {/* Main Content Area: Map, Destinations, and Trip Builder */}
      <section className="px-6 md:px-12 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-[1600px] mx-auto">
        <div className="lg:col-span-8 space-y-12">
          


          {/* Destinations Grid (Masonry) */}
          <div className="pt-8 border-t border-primary-border/60">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-text-main tracking-tight">Curated Escapes</h2>
                <p className="text-text-muted mt-2 text-lg font-light">Handpicked for the discerning Indian traveler</p>
              </div>
              <button className="font-semibold text-accent-sage hover:text-accent-sageHover transition-colors text-sm border-b-2 border-accent-sage pb-1 self-start lg:self-end">Explore all</button>
            </div>
            
            {/* Filter Section */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-6 mb-10 pb-6 border-b border-primary-border/40 overflow-x-auto scrollbar-hide">
              {/* Trip Type */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Type:</span>
                {['Family', 'Honeymoon', 'Solo', 'Friends'].map(type => (
                  <button key={type} className="px-5 py-2 rounded-full border border-transparent text-sm font-medium text-text-main hover:bg-accent-sage hover:text-white transition-colors bg-primary-border/30 shadow-sm whitespace-nowrap">{type}</button>
                ))}
              </div>
              
              {/* Diet */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Dietary:</span>
                {['Pure Veg', 'Non-Veg', 'Halal', 'Jain'].map(diet => (
                  <button key={diet} className="px-5 py-2 rounded-full border border-transparent text-sm font-medium text-text-main hover:bg-accent-lightSage hover:text-white transition-colors bg-primary-border/30 shadow-sm whitespace-nowrap">{diet}</button>
                ))}
              </div>

              {/* Budget */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Budget:</span>
                <select className="px-5 py-2 rounded-full border border-transparent text-sm font-medium text-text-main bg-primary-border/30 shadow-sm outline-none hover:border-accent-sand transition-colors cursor-pointer appearance-none pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%232B2D2F%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-no-repeat bg-[position:right_12px_center]">
                  <option>Any Budget</option>
                  <option>Under ₹50,000</option>
                  <option>₹50,000 - ₹1,00,000</option>
                  <option>Above ₹1,00,000</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {destinationsData.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <DestinationCard 
                    {...dest}
                    index={index}
                    isSaved={savedDests.has(dest.id)}
                    toggleSaved={toggleSaved}
                    onAddToTrip={handleAddToTrip}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Trip Builder Sidebar */}
        <div className="lg:col-span-4">
          <TripBuilder tripDays={tripDays} onRemove={handleRemoveFromTrip} onDrop={handleDropToDay} />
        </div>
      </section>

    </div>
  );
};

export default Home;
