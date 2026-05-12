import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, Map, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Clock, CheckSquare } from 'lucide-react';

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
    <div className="bg-emerald-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-800 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Your {closestTrip.destination} trip is in</h3>
            <div className="text-4xl font-black tracking-tight text-emerald-400">{timeLeft || 'Calculating...'}</div>
          </div>
        </div>

        <div className="bg-emerald-800/50 rounded-2xl p-6 border border-emerald-700/50">
          <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-300 mb-4 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Smart Packing Checklist
          </h4>
          <div className="space-y-3">
            <label className={`flex items-center gap-3 cursor-pointer ${daysUntil <= 28 ? 'opacity-100' : 'opacity-40 select-none'}`}>
              <input type="checkbox" disabled={daysUntil > 28} checked={checkedItems['chk1'] || false} onChange={() => toggleCheck('chk1')} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
              <span className="font-medium">4+ weeks before: Book flights & hotels</span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer ${daysUntil <= 14 ? 'opacity-100' : 'opacity-40 select-none'}`}>
              <input type="checkbox" disabled={daysUntil > 14} checked={checkedItems['chk2'] || false} onChange={() => toggleCheck('chk2')} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
              <span className="font-medium">2 weeks before: Apply for visa, get travel insurance</span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer ${daysUntil <= 7 ? 'opacity-100' : 'opacity-40 select-none'}`}>
              <input type="checkbox" disabled={daysUntil > 7} checked={checkedItems['chk3'] || false} onChange={() => toggleCheck('chk3')} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
              <span className="font-medium">1 week before: Pack clothes, download offline maps</span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer ${daysUntil <= 1 ? 'opacity-100' : 'opacity-40 select-none'}`}>
              <input type="checkbox" disabled={daysUntil > 1} checked={checkedItems['chk4'] || false} onChange={() => toggleCheck('chk4')} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
              <span className="font-medium">1 day before: Charge devices, print documents</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

function Itineraries() {
  const { itineraries, deleteItinerary, setItineraries } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 py-8 md:py-16 pb-24 md:pb-32 transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 min-w-0 w-full space-y-12">

        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
            My <span className="text-emerald-600">Itineraries</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Your generated travel plans and upcoming adventures.
          </p>
        </div>

        {/* Countdown Banner */}
        <CountdownBanner itineraries={itineraries} />

        {itineraries.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Map className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight italic">No trips planned yet.</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto">Use the AI Planner or search for a destination to create your first itinerary.</p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="mt-4 px-8 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all"
            >
              Start Planning
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {itineraries.map((trip, idx) => {
              // Normalise plan data — may be an array, object, or missing
              const planArray = Array.isArray(trip.plan) ? trip.plan : [];
              const daysArray = Array.isArray(trip.days) ? trip.days : [];

              // Determine format: new format has days[] of objects with .activities
              const isNewFormat = daysArray.length > 0 && typeof daysArray[0] === 'object' && daysArray[0] !== null;
              const dayCount = isNewFormat ? daysArray.length : (planArray.length || 0);
              const activityCount = isNewFormat
                ? daysArray.reduce((acc, d) => acc + (Array.isArray(d.activities) ? d.activities.length : 0), 0)
                : planArray.length;
              const previewItems = isNewFormat
                ? daysArray.slice(0, 2).map(d => ({ label: `Day ${d.day || '?'}`, text: d.activities?.[0]?.title || d.morning || '—' }))
                : planArray.slice(0, 3).map((p, i) => ({ label: `Day ${i + 1}`, text: typeof p === 'string' ? p.replace(/^Day \d+:\s*/, '') : JSON.stringify(p).slice(0, 60) }));

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => navigate(`/itinerary/${trip.id}`)}
                  className="rounded-3xl p-8 border shadow-sm hover:shadow-xl transition-all group cursor-pointer" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize">{trip.destination}</h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">
                          <Calendar className="w-3 h-3" /> {dayCount} Days
                        </span>
                        {isNewFormat && (
                          <span className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full text-xs">
                            {activityCount} Activities
                          </span>
                        )}
                        {trip.budget && (
                          <span className="flex items-center gap-1.5 text-sky-600 font-bold bg-sky-50 px-3 py-1 rounded-full text-xs">
                            ₹{(trip.budget.total / 1000).toFixed(0)}k est.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.id}`); }}
                        className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-emerald-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteItinerary(trip.id); }}
                        className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {previewItems.map((item, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-black text-emerald-600 text-xs w-12 shrink-0 pt-0.5">{item.label}</span>
                        <span className="text-slate-600 font-medium text-sm truncate">{item.text}</span>
                      </div>
                    ))}
                    {dayCount > previewItems.length && (
                      <p className="text-xs text-slate-400 font-bold text-center pt-1">
                        +{dayCount - previewItems.length} more days →
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="date"
                        value={trip.travelDate || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          const updated = itineraries.map(t => t.id === trip.id ? { ...t, travelDate: e.target.value } : t);
                          setItineraries(updated);
                        }}
                        className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 w-full"
                      />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.id}`); }}
                      className="text-xs font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors whitespace-nowrap">
                      Open Full Planner →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default Itineraries;
