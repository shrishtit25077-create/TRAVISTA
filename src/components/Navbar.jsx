import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MapPin, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchLocations } from '../data/locations';
import { useTheme } from '../context/ThemeContext';

import { smartSearch } from '../services/ai';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2) {
        // Quick local search
        const localResults = searchLocations(searchTerm);
        setSuggestions(localResults);
        setShowSuggestions(true);

        // If it's a longer descriptive query, trigger AI search
        if (searchTerm.length > 10 && !searchTerm.includes(',')) {
          setIsSearchingAI(true);
          const aiResults = await smartSearch(searchTerm);
          if (aiResults && aiResults.length > 0) {
            // Merge unique
            const merged = [...localResults];
            aiResults.forEach(aiItem => {
              if (!merged.find(m => m.name === aiItem.name)) {
                merged.push(aiItem);
              }
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

    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <div className="top-navbar relative flex gap-4" ref={wrapperRef}>
      <div className="navbar-search relative flex-1">
        <Search className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => { if(searchTerm.length >= 2) setShowSuggestions(true); }}
          placeholder="Search destinations, states, countries..."
          className="w-full bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
        
        {showSuggestions && (suggestions.length > 0 || isSearchingAI) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-3 flex justify-between items-center">
                <span>{isSearchingAI ? "✨ AI is thinking..." : "Global Destinations"}</span>
              </div>
              
              {suggestions.map((sug, idx) => (
                <button
                  key={`${sug.name}-${idx}`}
                  onClick={() => handleSelect(sug)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">{sug.name}</div>
                    <div className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <span>{sug.flag}</span>
                      <span>{sug.hierarchy}</span>
                    </div>
                  </div>
                </button>
              ))}

              {isSearchingAI && (
                <div className="px-4 py-3 flex items-center gap-3 animate-pulse">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700" />
                   <div className="space-y-2">
                     <div className="w-24 h-3 bg-slate-100 dark:bg-slate-700 rounded-full" />
                     <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full" />
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="w-[38px] h-[38px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow-sm text-slate-400 hover:text-emerald-500 transition-all"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        <button className="w-[38px] h-[38px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow-sm text-slate-400 hover:text-emerald-500 transition-all">
          <Bell size={16} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
