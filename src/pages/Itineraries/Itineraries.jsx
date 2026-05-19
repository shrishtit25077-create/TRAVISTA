import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, Calendar, MapPin, DollarSign, Clock, ChevronRight, Activity, Navigation, Globe, Plus, AlertCircle } from 'lucide-react';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';

const TripCard = ({ trip, idx, confirmDelete, navigate }) => {
  const { photoUrl } = useDestinationPhoto(trip.destination?.split(',')[0]);
  
  const daysArray = Array.isArray(trip.days) ? trip.days : [];
  const dayCount = daysArray.length;
  const activityCount = daysArray.reduce((acc, d) => acc + (Array.isArray(d.activities) ? d.activities.length : 0), 0);
  
  const budgetFormatted = (trip.budget && typeof trip.budget.total === 'number' && !isNaN(trip.budget.total)) 
    ? `₹ ${trip.budget.total.toLocaleString('en-IN')}` 
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.05 }}
      onClick={() => navigate(`/itinerary/${trip.id}`)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Premium Image Header */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={trip.destination} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-900/40 group-hover:scale-105 transition-transform duration-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.id}`); }}
            className="w-8 h-8 bg-white/20 hover:bg-white text-white hover:text-emerald-600 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); confirmDelete(trip); }}
            className="w-8 h-8 bg-white/20 hover:bg-white text-white hover:text-rose-500 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
            {trip.destination}
          </h3>
          <p className="text-white/80 text-sm font-medium mt-1 flex items-center gap-1.5 drop-shadow-md">
            <Calendar size={14} /> {dayCount} Days <span className="mx-1 opacity-50">•</span> {activityCount} Activities
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 bg-white relative z-10">
        {/* Timeline Preview */}
        <div className="space-y-3 flex-1 mb-6">
          {daysArray.slice(0, 3).map((d, i) => (
            <div key={i} className="flex gap-3 items-start group/item">
              <div className="w-8 h-8 bg-slate-50 text-slate-400 group-hover/item:bg-emerald-50 group-hover/item:text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                D{d.day}
              </div>
              <p className="text-sm font-medium text-slate-600 line-clamp-2 pt-1">
                {d.activities?.[0]?.title || 'Explore local sights'}
              </p>
            </div>
          ))}
          {dayCount > 3 && (
            <div className="pl-11 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+ {dayCount - 3} more days</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
          {budgetFormatted ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <DollarSign size={14} />
                <span className="text-xs font-bold">{budgetFormatted} est.</span>
              </div>
              {trip.savedAt && (
                <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
                  <Clock size={10} />
                  Saved {new Date(trip.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock size={16} />
              <span className="text-xs font-bold">Budget Pending</span>
            </div>
          )}

          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.id}`); }}
            className="text-xs font-bold text-slate-900 hover:text-emerald-600 uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            Open <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Itineraries() {
  const { itineraries, deleteItinerary, loading } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTripToDelete, setSelectedTripToDelete] = useState(null);

  // Strictly valid trips (removing broken/corrupted data)
  // Removed overzealous deduplication so all saved trips stay persistent
  const validTrips = useMemo(() => {
    if (!itineraries) return [];
    return itineraries.filter(trip => {
      if (!trip || !trip.destination || trip.destination.trim() === '') return false;
      const daysArray = Array.isArray(trip.days) ? trip.days : [];
      if (daysArray.length === 0) return false;
      return true;
    });
  }, [itineraries]);

  // Derived Stats
  const totalTrips = validTrips.length;
  const uniqueCountries = new Set(validTrips.map(t => {
    const parts = t.destination.split(',');
    return parts[parts.length - 1].trim();
  })).size;
  const totalDays = validTrips.reduce((acc, t) => acc + (Array.isArray(t.days) ? t.days.length : 0), 0);

  const confirmDelete = (trip) => {
    setSelectedTripToDelete(trip);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (selectedTripToDelete) {
      deleteItinerary(selectedTripToDelete.id);
      setShowDeleteModal(false);
      setSelectedTripToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16 space-y-10 md:space-y-16">
        
        {/* ─── PREMIUM HEADER & STATS ────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Travel Wallet
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              My Itineraries
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl">
              Manage your upcoming adventures, past journeys, and AI-curated travel plans securely in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 lg:gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex flex-col justify-center min-w-[120px] shadow-sm">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{totalTrips}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Planned Trips</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex flex-col justify-center min-w-[120px] shadow-sm">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{uniqueCountries}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Destinations</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 flex flex-col justify-center min-w-[120px] shadow-sm">
              <span className="text-3xl font-black text-emerald-600 leading-none mb-1">{totalDays}</span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Travel Days</span>
            </div>
          </div>
        </div>

        {/* ─── LOADING STATE ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 h-[400px] flex flex-col">
                <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6"></div>
                <div className="w-3/4 h-6 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-800 rounded mb-8"></div>
                <div className="space-y-3 mt-auto">
                  <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : validTrips.length === 0 ? (
          
          /* ─── PREMIUM EMPTY STATE ──────────────────────────────────────────── */
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-12 md:p-24 text-center relative overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[500px]"
          >
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10 w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-slate-700 shadow-sm">
              <Globe className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              No journeys planned yet.
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md mx-auto mb-10 leading-relaxed">
              Start creating your dream adventure with Travista AI. Generate personalized, day-by-day itineraries instantly.
            </p>
            
            <button
              onClick={() => navigate('/planner')}
              className="relative z-10 px-8 py-4 bg-slate-900 dark:bg-emerald-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-800 dark:hover:bg-emerald-400 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 active:scale-[0.98]"
            >
              <Plus size={16} /> Create New Trip
            </button>
          </motion.div>
        ) : (

          /* ─── GRID LAYOUT ──────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence>
              {validTrips.map((trip, idx) => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  idx={idx} 
                  confirmDelete={confirmDelete} 
                  navigate={navigate} 
                />
              ))}
            </AnimatePresence>
            
            {/* Quick Add Card */}
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => navigate('/planner')}
              className="group bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[400px] text-center p-8"
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 text-slate-400">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-700 transition-colors">Plan Another Trip</h3>
              <p className="text-slate-500 text-sm font-medium px-4">Use AI to generate a brand new personalized itinerary.</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* ─── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && selectedTripToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-500/20">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Delete Itinerary?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                Are you sure you want to permanently delete your trip to <strong className="text-slate-900 dark:text-white">"{selectedTripToDelete.destination}"</strong>? This cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 text-sm uppercase tracking-widest"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
