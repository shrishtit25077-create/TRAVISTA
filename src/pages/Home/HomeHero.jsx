import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Globe, Mountain, Landmark, Palmtree, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

const chips = [
  'All',
  'Relaxing Beach',
  'Mountain Adventure',
  'Cultural History',
  'Food Tour',
  'Weekend Getaway',
  'Hill Stations',
  'Spiritual',
  'Budget ₹'
];

const suggestions = [
  { label: 'Budget Himachal', icon: Mountain },
  { label: 'Kyoto Culture Tour', icon: Landmark },
  { label: 'Goa Weekend', icon: Palmtree },
];

const placeholders = ['Manali', 'Bali', 'Kyoto', 'Santorini', 'Goa'];

export default function HomeHero({ activeCategory, setActiveCategory, searchQuery, setSearchQuery }) {
  const [phIdx, setPhIdx] = useState(0);
  const navigate = useNavigate();
  const { addItinerary, addToHistory } = useAuth();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    addToHistory(searchQuery);

    const newTrip = {
      id: Date.now(),
      destination: searchQuery,
      days: 3,
      plan: [
        "Day 1: Arrival & local exploration",
        "Day 2: Main attractions",
        "Day 3: Relax & return"
      ]
    };
    
    addItinerary(newTrip);

    navigate('/planner', { state: { destination: searchQuery } });
  };

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % placeholders.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-wrapper">
      <div className="hero-image-box">
        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=90&w=2000"
          alt="Beach"
          className="hero-bg-img"
        />
        <div className="hero-gradient" />

        {/* Main content floats on image — LEFT ALIGNED, NO GLASS CARD */}
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="hero-eyebrow">TRAVISTA · EDITORIAL COLLECTION</div>

          <div className="hero-heading-white">Curate your</div>
          <div className="hero-heading-teal">perfect journey.</div>

          <p className="hero-sub">
            Discover destinations, plan itineraries, and explore<br />
            the world effortlessly.
          </p>

          {/* Search bar */}
          <div className="hero-search-bar">
            <Search size={15} color="#94a3b8" style={{ marginRight: 8, flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder={`Try: ${placeholders[phIdx]}...`}
            />
            <Globe size={17} className="hero-search-globe" />
            <button className="hero-search-btn" onClick={handleSearch}>
              Generate Trip <Sparkles size={14} />
            </button>
          </div>

          {/* Chips — 4 per row */}
          <div className="chips-row">
            {chips.slice(0, 4).map((c, i) => (
              <motion.button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`chip ${activeCategory === c ? 'active' : ''}`}
                style={activeCategory === c ? { background: 'linear-gradient(135deg, #00c6ff, #00f2a1)', color: 'white', border: 'none' } : {}}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                {c}
              </motion.button>
            ))}
          </div>
          <div className="chips-row">
            {chips.slice(4).map((c, i) => (
              <motion.button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`chip ${activeCategory === c ? 'active' : ''}`}
                style={activeCategory === c ? { background: 'linear-gradient(135deg, #00c6ff, #00f2a1)', color: 'white', border: 'none' } : {}}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Scroll hint — perfectly centered */}
        <div className="scroll-hint">
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown size={16} className="scroll-arrow" />
        </div>
      </div>
    </div>
  );
}
