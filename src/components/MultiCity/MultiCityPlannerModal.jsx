import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, X, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { destinations } from '../../data/destinations';

const MultiCityPlannerModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [budget, setBudget] = useState(150000);
  const [duration, setDuration] = useState(10);
  const [travelers, setTravelers] = useState(2);
  const [startCity, setStartCity] = useState('');

  const availableDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) && !cities.includes(d.name)
  );

  const addCity = (cityName) => {
    if (cities.length < 5) {
      setCities([...cities, cityName]);
      setSearch('');
      if (cities.length === 0) setStartCity(cityName);
    }
  };

  const removeCity = (cityName) => {
    const newCities = cities.filter(c => c !== cityName);
    setCities(newCities);
    if (startCity === cityName) setStartCity(newCities[0] || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cities.length < 2) return;

    const tripParams = {
      cities,
      budget,
      duration,
      travelers,
      startCity
    };

    localStorage.setItem('travista_multicity_params', JSON.stringify(tripParams));
    navigate('/multi-city-plan');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 border-b border-slate-100 bg-slate-50">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Plan a <span className="text-[#1D9E75]">Multi-City</span> Trip</h2>
          <p className="text-slate-500 font-medium mt-2">Select 2 to 5 destinations and let our AI optimize your route and budget.</p>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          
          {/* Destination Selection */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Destinations ({cities.length}/5)</label>
            
            <div className="flex gap-2 flex-wrap mb-4">
              {cities.map((city, idx) => (
                <div key={city} className="bg-[#1D9E75]/10 border border-[#1D9E75]/20 text-[#1D9E75] px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold">
                  <div className="w-5 h-5 bg-[#1D9E75] text-white rounded-full flex items-center justify-center text-[10px]">{idx + 1}</div>
                  {city}
                  <button onClick={() => removeCity(city)} className="hover:text-red-500 ml-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            {cities.length < 5 && (
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search and add a city..."
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#1D9E75] focus:outline-none transition-all font-bold text-slate-700"
                />
                
                {search && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto p-2">
                    {availableDestinations.slice(0, 5).map(dest => (
                      <button
                        key={dest.id}
                        onClick={() => addCity(dest.name)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center justify-between group transition-all"
                      >
                        <span className="font-bold text-slate-700">{dest.name}</span>
                        <Plus size={16} className="text-[#1D9E75] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                    {availableDestinations.length === 0 && (
                      <div className="px-4 py-3 text-slate-400 text-sm font-medium">No destinations found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {cities.length > 0 && (
              <div className="pt-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Starting City</label>
                 <select 
                   value={startCity} 
                   onChange={(e) => setStartCity(e.target.value)}
                   className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#1D9E75]"
                 >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Wallet size={16} /> Total Budget (₹)
              </label>
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#1D9E75] focus:outline-none transition-all font-black text-xl text-slate-900"
              />
              <div className="flex gap-2">
                {[50000, 100000, 250000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setBudget(val)}
                    className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-all border border-slate-100"
                  >
                    ₹{(val/1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Calendar size={16} /> Total Days
              </label>
              <div className="flex items-center gap-4 bg-white border-2 border-slate-100 rounded-2xl p-2">
                <button 
                  onClick={() => setDuration(Math.max(3, duration - 1))}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 transition-all"
                >-</button>
                <div className="flex-1 text-center font-black text-xl text-slate-900">{duration}</div>
                <button 
                  onClick={() => setDuration(Math.min(30, duration + 1))}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 transition-all"
                >+</button>
              </div>
            </div>
            
            <div className="space-y-4 sm:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Users size={16} /> Travelers
              </label>
              <div className="flex items-center gap-4 bg-white border-2 border-slate-100 rounded-2xl p-2 max-w-[200px]">
                <button 
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 transition-all"
                >-</button>
                <div className="flex-1 text-center font-black text-xl text-slate-900">{travelers}</div>
                <button 
                  onClick={() => setTravelers(Math.min(10, travelers + 1))}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 transition-all"
                >+</button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <button 
            onClick={handleSubmit}
            disabled={cities.length < 2}
            className="w-full py-5 bg-[#1D9E75] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#15825f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#1D9E75]/20"
          >
            Generate Multi-City Trip <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MultiCityPlannerModal;
