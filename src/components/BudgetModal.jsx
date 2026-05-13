import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Sparkles } from 'lucide-react';
import { useDestinationPhoto } from '../hooks/useDestinationPhoto';
import { useNavigate } from 'react-router-dom';

const BudgetModal = ({ destination, onClose }) => {
  const navigate = useNavigate();
  const { photoUrl } = useDestinationPhoto(destination.name);

  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState(5);
  const [travellerType, setTravellerType] = useState('Solo');

  // ESC key close + body scroll lock
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const budgetChips = [
    { label: 'Budget', value: 15000 },
    { label: 'Standard', value: 40000 },
    { label: 'Mid-Range', value: 80000 },
    { label: 'Luxury', value: 150000 },
  ];

  const buildPrompt = () => {
    const budgetNum = Number(budget);
    const budgetLabel =
      budgetNum <= 20000 ? 'ultra budget' :
      budgetNum <= 50000 ? 'budget-friendly' :
      budgetNum <= 100000 ? 'mid-range' :
      'premium luxury';

    return [
      `Plan a ${duration}-day ${travellerType.toLowerCase()} trip to ${destination.name}, ${destination.country}`,
      `with a total budget of ₹${budgetNum.toLocaleString('en-IN')} (${budgetLabel}).`,
      `Include day-wise itinerary, top attractions, local food recommendations, hotel suggestions,`,
      `hidden gems, insider travel tips, and budget breakdown.`,
      `Tailor the experience for a ${travellerType.toLowerCase()} traveller.`,
    ].join(' ');
  };

  const handleGenerate = () => {
    if (!budget) return;
    const prompt = buildPrompt();
    onClose();
    // Directly navigate to AI Planner
    navigate(`/planner?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero Header */}
        <div className="relative h-44 w-full">
          <img src={photoUrl} alt={destination.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-6 left-8">
            <h2 className="text-white text-2xl font-black tracking-tight">{destination.name} {destination.flag}</h2>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">{destination.country}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Budget Section */}
          <div className="space-y-4">
            <h3 className="text-center text-lg font-black text-slate-900">What's your trip budget?</h3>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-6 pl-14 pr-6 text-3xl font-black text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-200 text-center"
              />
            </div>
            
            {/* Single-row Budget Presets */}
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
              {budgetChips.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => setBudget(chip.value)}
                  className={`shrink-0 flex-1 min-w-[85px] py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap px-2 ${
                    Number(budget) === chip.value 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  ₹{chip.value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Config row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Duration</label>
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 border border-slate-100">
                <button onClick={() => setDuration(d => Math.max(1, d - 1))} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all"><Minus size={14} /></button>
                <span className="text-xs font-black text-slate-900">{duration} Days</span>
                <button onClick={() => setDuration(d => Math.min(30, d + 1))} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all"><Plus size={14} /></button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Traveler</label>
              <select 
                value={travellerType}
                onChange={e => setTravellerType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-xs font-black text-slate-900 outline-none focus:border-emerald-500 transition-all appearance-none text-center h-[52px]"
              >
                {['Solo', 'Couple', 'Family', 'Group'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleGenerate}
            disabled={!budget}
            className="w-full group relative overflow-hidden bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 text-white py-6 rounded-[2rem] transition-all duration-500 shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="font-black text-sm uppercase tracking-widest">Design My Trip</span>
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BudgetModal;
