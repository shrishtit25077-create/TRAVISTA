import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MapPin, Moon, Sun, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchLocations } from '../data/locations';
import { useTheme } from '../context/ThemeContext';
import { smartSearch } from '../services/ai';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ searchTerm, setSearchTerm, onMenuClick }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2) {
        const localResults = searchLocations(searchTerm);
        setSuggestions(localResults);
        setShowSuggestions(true);

        if (searchTerm.length > 10 && !searchTerm.includes(',')) {
          setIsSearchingAI(true);
          const aiResults = await smartSearch(searchTerm);
          if (aiResults?.length > 0) {
            const merged = [...localResults];
            aiResults.forEach(aiItem => {
              if (!merged.find(m => m.name === aiItem.name)) merged.push(aiItem);
            });
            setSuggestions(merged);
          }
          setIsSearchingAI(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when mobile search opens
  useEffect(() => {
    if (showMobileSearch) inputRef.current?.focus();
  }, [showMobileSearch]);

  const handleSelect = (sug) => {
    setSearchTerm(sug.name);
    setShowSuggestions(false);
    setShowMobileSearch(false);
  };

  const SuggestionDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-[200] max-h-80 overflow-y-auto border"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
      <div className="p-2">
        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 mb-1"
          style={{ color: 'var(--text-secondary)' }}>
          {isSearchingAI ? '✨ AI is thinking...' : 'Destinations'}
        </div>
        {suggestions.map((sug, idx) => (
          <button
            key={`${sug.name}-${idx}`}
            onClick={() => handleSelect(sug)}
            className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MapPin size={13} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{sug.name}</div>
              <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <span>{sug.flag}</span><span className="truncate">{sug.hierarchy}</span>
              </div>
            </div>
          </button>
        ))}
        {isSearchingAI && (
          <div className="px-3 py-2.5 flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700" />
            <div className="space-y-1.5">
              <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full" />
              <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Main Navbar */}
      <div className="top-navbar sticky top-0 z-[100] flex items-center gap-3 px-4 md:px-6 py-3 border-b"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>

        {/* Hamburger — mobile/tablet only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop search — hidden on mobile */}
        <div className="hidden md:flex flex-1 relative" ref={wrapperRef}>
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => { if (searchTerm.length >= 2) setShowSuggestions(true); }}
              placeholder="Search destinations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm font-medium border outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
            {showSuggestions && (suggestions.length > 0 || isSearchingAI) && <SuggestionDropdown />}
          </div>
        </div>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Logo label — mobile only, centered */}
        <span className="md:hidden font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>Travista</span>
        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch(s => !s)}
            className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Search"
          >
            {showMobileSearch ? <X size={18} /> : <Search size={18} />}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border text-slate-500 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-400 transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="p-2 rounded-xl border text-slate-500 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-400 transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            onClick={() => navigate('/alerts')}
            aria-label="Alerts"
          >
            <Bell size={16} />
          </button>
        </div>
      </div>

      {/* Mobile search bar — slides down */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden z-[99] sticky top-[57px] border-b"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
          >
            <div className="p-3 relative" ref={wrapperRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm.length >= 2) setShowSuggestions(true); }}
                  placeholder="Search destinations, countries..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium border outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                />
              </div>
              {showSuggestions && (suggestions.length > 0 || isSearchingAI) && <SuggestionDropdown />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
