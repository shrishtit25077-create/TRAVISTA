import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Sparkles, Zap, Star } from 'lucide-react';
import { useDestinationPhoto } from '../hooks/useDestinationPhoto';
import { useNavigate } from 'react-router-dom';

const BudgetModal = ({ destination, onClose }) => {
  const navigate = useNavigate();
  const { photoUrl } = useDestinationPhoto(destination.name);

  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState(5);
  const [travellerType, setTravellerType] = useState('Solo');

  const budgetChips = [
    { label: 'Ultra Budget', value: 15000 },
    { label: 'Budget', value: 40000 },
    { label: 'Mid Range', value: 80000 },
    { label: 'Premium', value: 150000 },
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

  const handleQuickPlanner = () => {
    if (!budget) return;
    onClose();
    navigate(`/planner?prompt=${encodeURIComponent(buildPrompt())}`);
  };

  const handlePremiumExperience = () => {
    if (!budget) return;
    onClose();
    navigate(`/premium-trip?prompt=${encodeURIComponent(buildPrompt())}&dest=${encodeURIComponent(destination.name)}`);
  };

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-[480px] rounded-[2rem] overflow-hidden shadow-2xl"
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
          <div className="absolute bottom-4 left-6">
            <h2 className="text-white text-2xl font-black tracking-tight">{destination.name} {destination.flag}</h2>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{destination.country}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-black text-slate-900">Plan your trip to {destination.name}</h3>
            <p className="text-slate-400 text-sm font-medium italic">Enter your total budget and we'll design the perfect trip for you</p>
          </div>

          {/* Budget Input */}
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 pl-14 pr-6 text-3xl font-black text-slate-900 focus:border-[#1D9E75] focus:bg-white outline-none transition-all placeholder:text-slate-200"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {budgetChips.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => setBudget(chip.value)}
                  className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all"
                >
                  ₹{chip.value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Duration Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">How many days?</label>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-100">
                <button 
                  onClick={() => setDuration(d => Math.max(1, d - 1))}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-[#1D9E75] transition-all"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-black text-slate-900">{duration}</span>
                <button 
                  onClick={() => setDuration(d => Math.min(30, d + 1))}
                  className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-[#1D9E75] transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Traveller Type */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Who's going?</label>
              <div className="grid grid-cols-2 gap-2">
                {['Solo', 'Couple', 'Family', 'Group'].map(type => (
                  <button
                    key={type}
                    onClick={() => setTravellerType(type)}
                    className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      travellerType === type 
                        ? 'bg-[#1D9E75] border-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {/* Primary — Quick AI Planner */}
            <button
              onClick={handleQuickPlanner}
              disabled={!budget}
              className="w-full bg-[#1D9E75] hover:bg-[#15825f] disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-[1.25rem] font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#1D9E75]/20 active:scale-[0.98]"
            >
              <Zap size={16} />
              Quick AI Planner
            </button>

            {/* Secondary — Premium Experience */}
            <button
              onClick={handlePremiumExperience}
              disabled={!budget}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-[1.25rem] font-black text-sm flex items-center justify-center gap-2.5 transition-all border border-gray-700 active:scale-[0.98]"
            >
              <Star size={16} className="text-yellow-400" />
              Premium Experience
            </button>

            {/* Hint labels */}
            <div className="grid grid-cols-2 gap-2">
              <p className="text-[9px] text-slate-400 text-center leading-relaxed">Chat-style · Editable · Fast</p>
              <p className="text-[9px] text-slate-400 text-center leading-relaxed">Cinematic · Immersive · Shareable</p>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default BudgetModal;
