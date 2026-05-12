import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, Map, Calendar, Users, DollarSign, Clock, CheckSquare, ChevronRight, Activity, Navigation, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const CountdownBanner = ({ itineraries }) => {
  const [closestTrip, setClosestTrip] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('travista_checklist');
      if (stored) setCheckedItems(JSON.parse(stored));
    } catch (e) { }
  }, []);

  const toggleCheck = (id) => {
    const newChecked = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newChecked);
    localStorage.setItem('travista_checklist', JSON.stringify(newChecked));
  };

  useEffect(() => {
    // find upcoming trip
    const tripsWithDates = itineraries.filter(t => t.travelDate);
    if (!tripsWithDates.length) {
      setClosestTrip(null);
      return;
    }

    const now = new Date();
    let closest = null;
    let minDiff = Infinity;

    tripsWithDates.forEach(t => {
      const date = new Date(t.travelDate);
      const diff = date - now;
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        closest = { ...t, diff };
      }
    });

    setClosestTrip(closest);
  }, [itineraries]);

  useEffect(() => {
    if (!closestTrip) return;
    const interval = setInterval(() => {
      const now = new Date();
      const date = new Date(closestTrip.travelDate);
      const diff = date - now;
      if (diff <= 0) {
        setTimeLeft('Trip Started!');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [closestTrip]);

  if (!closestTrip) return null;

  const daysUntil = Math.floor(closestTrip.diff / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-900/10 text-white relative overflow-hidden group mb-12 border border-slate-800">
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg shadow-black/20">
              <Clock className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Next Adventure</h3>
              <p className="text-2xl font-bold text-white capitalize">{closestTrip.destination}</p>
            </div>
          </div>
          <div className="bg-black/20 rounded-3xl p-6 border border-white/5 backdrop-blur-sm">
             <div className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 drop-shadow-sm">{timeLeft || 'Calculating...'}</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 backdrop-blur-md">
          <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Smart Checklist
          </h4>
          <div className="space-y-4">
            <label className={`flex items-start gap-4 cursor-pointer group/chk ${daysUntil <= 28 ? 'opacity-100' : 'opacity-40 select-none'}`}>
              <div className="mt-0.5"><input type="checkbox" disabled={daysUntil > 28} checked={checkedItems['chk1'] || false} onChange={() => toggleCheck('chk1')} className="w-5 h-5 accent-emerald-500 rounded-lg cursor-pointer" /></div>
              <span className="font-bold text-sm text-slate-200 group-hover/chk:text-white transition-colors">4+ weeks before: Book flights & hotels</span>
            </label>
            <label className={`flex items-start gap-4 cursor-pointer group/chk ${daysUntil <= 14 ? 'opacity-100' : 'opacity-40 select-none'}`}>
              <div className="mt-0.5"><input type="checkbox" disabled={daysUntil > 14} checked={checkedItems['chk2'] || false} onChange={() => toggleCheck('chk2')} className="w-5 h-5 accent-emerald-500 rounded-lg cursor-pointer" /></div>
              <span className="font-bold text-sm text-slate-200 group-hover/chk:text-white transition-colors">2 weeks before: Apply for visa, get travel insurance</span>
            </label>
            <label className={`flex items-start gap-4 cursor-pointer group/chk ${daysUntil <= 7 ? 'opacity-100' : 'opacity-40 select-none'}`}>
              <div className="mt-0.5"><input type="checkbox" disabled={daysUntil > 7} checked={checkedItems['chk3'] || false} onChange={() => toggleCheck('chk3')} className="w-5 h-5 accent-emerald-500 rounded-lg cursor-pointer" /></div>
              <span className="font-bold text-sm text-slate-200 group-hover/chk:text-white transition-colors">1 week before: Pack clothes, download offline maps</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Itineraries() {
  const { itineraries, deleteItinerary, setItineraries, loading } = useAuth();
  const navigate = useNavigate();

  // Deduplicate and filter out corrupted trips
  const validTrips = React.useMemo(() => {
    if (!itineraries) return [];
    
    // Filter corrupted/empty
    const filtered = itineraries.filter(trip => {
      if (!trip || !trip.destination || trip.destination.trim() === '') return false;
      const daysArray = Array.isArray(trip.days) ? trip.days : [];
      if (daysArray.length === 0) return false;
      return true;
    });

    // Deduplicate by destination + roughly same dates (or just ID dedupe)
    // We will deduplicate exactly identical destinations generated recently to avoid spam.
    const seen = new Set();
    const unique = [];
    for (const trip of filtered) {
      const dedupeKey = trip.destination.toLowerCase().trim();
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        unique.push(trip);
      }
    }
    
    return unique;
  }, [itineraries]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTripToDelete, setSelectedTripToDelete] = useState(null);

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

  // Format currency securely
  const formatBudget = (budgetObj) => {
    if (!budgetObj || typeof budgetObj.total !== 'number' || isNaN(budgetObj.total)) return null;
    return `₹ ${budgetObj.total.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 py-8 md:py-16 pb-24 md:pb-32 bg-[#fafaf9] transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-12">

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-slate-900">
            My <span className="text-emerald-600">Itineraries</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl">
            Your personalized travel plans and upcoming adventures safely stored in your travel wallet.
          </p>
        </div>

        {/* Countdown Banner */}
        <CountdownBanner itineraries={validTrips} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl p-8 border border-slate-100 h-80">
                <div className="w-1/2 h-8 bg-slate-100 rounded-lg mb-4"></div>
                <div className="w-full h-4 bg-slate-50 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-slate-50 rounded mb-8"></div>
                <div className="w-full h-24 bg-slate-50 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : validTrips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="py-24 md:py-32 text-center space-y-8 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl shadow-slate-200/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-50" />
            <div className="relative z-10 w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-slate-200/50 border border-slate-50 rotate-3 hover:rotate-0 transition-transform">
              <Map className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="relative z-10 space-y-3">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">No trips planned yet.</h3>
              <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">Design your first premium itinerary using our AI-powered trip architect.</p>
            </div>
            <button
              onClick={() => navigate('/planner')}
              className="relative z-10 mt-4 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 mx-auto active:scale-95"
            >
              Create First Journey <ChevronRight size={18} />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {validTrips.map((trip, idx) => {
                const daysArray = Array.isArray(trip.days) ? trip.days : [];
                const dayCount = daysArray.length;
                const activityCount = daysArray.reduce((acc, d) => acc + (Array.isArray(d.activities) ? d.activities.length : 0), 0);
                const budgetFormatted = formatBudget(trip.budget);

                return (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                    className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/30 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full"
                  >
                    {/* Hover Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="space-y-3">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {trip.destination}
                        </h2>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="flex items-center gap-1.5 text-slate-600 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> {dayCount} Days
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-600 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">
                            <Activity className="w-3 h-3" /> {activityCount} Activities
                          </span>
                        </div>
                      </div>

                      {/* Floating Actions */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-2 -mr-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-100">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.id}`); }}
                          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); confirmDelete(trip); }}
                          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Timeline */}
                    <div className="space-y-3 relative z-10 flex-1">
                      {daysArray.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                          <div className="w-12 shrink-0 pt-0.5">
                            <span className="font-black text-emerald-600 text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">D{d.day}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-700 font-bold text-sm line-clamp-1">{d.activities?.[0]?.title || 'Explore local sights'}</p>
                          </div>
                        </div>
                      ))}
                      {dayCount > 3 && (
                        <div className="text-center pt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+ {dayCount - 3} more days</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative z-10">
                      
                      {/* Dynamic Budget Badge */}
                      {budgetFormatted ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">{budgetFormatted} est.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-50 text-slate-500 px-4 py-2 rounded-xl border border-slate-200">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">Budget Pending</span>
                        </div>
                      )}

                      <button onClick={(e) => { e.stopPropagation(); navigate('/planner', { state: { tripId: trip.id } }); }}
                        className="w-full xl:w-auto text-[10px] font-black bg-slate-900 text-white hover:bg-emerald-600 uppercase tracking-widest px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        Open Planner <ExternalLink size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && selectedTripToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900">Delete this trip?</h3>
                <p className="text-slate-400 text-sm font-medium">
                  "<span className="font-bold text-slate-700">{selectedTripToDelete.destination}</span>" will be permanently removed.
                </p>
                <p className="text-[10px] uppercase tracking-widest font-black text-red-400 pt-2">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm">
                  Delete Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
