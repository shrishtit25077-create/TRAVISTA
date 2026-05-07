import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft, Trash2, Edit2, Check, X, Calendar, MapPin, Sparkles,
  Plus, GripVertical, Clock, Share2, Download, Map as MapIcon,
  ChevronRight, Wallet, RotateCcw, Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Time slot options ────────────────────────────────────────────────────────
const TIME_SLOTS = ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'];

const TIME_COLORS = {
  'Early Morning': 'bg-violet-50 text-violet-600 border-violet-100',
  'Morning':       'bg-amber-50 text-amber-600 border-amber-100',
  'Afternoon':     'bg-sky-50 text-sky-600 border-sky-100',
  'Evening':       'bg-orange-50 text-orange-600 border-orange-100',
  'Night':         'bg-indigo-50 text-indigo-600 border-indigo-100',
};

// ─── Activity card ────────────────────────────────────────────────────────────
const ActivityCard = ({ act, dayIndex, actIndex, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(act.title);
  const [time, setTime] = useState(act.time);

  const save = () => {
    onEdit(dayIndex, actIndex, { ...act, title, time });
    setEditing(false);
  };

  return (
    <Reorder.Item value={act} id={act.id} className="cursor-grab active:cursor-grabbing">
      <motion.div
        layout
        className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="text-slate-300 mt-1 shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 space-y-1.5">
          {editing ? (
            <div className="space-y-2">
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-emerald-400"
              >
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
              />
            </div>
          ) : (
            <>
              <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${TIME_COLORS[act.time] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {act.time}
              </span>
              <p className="text-slate-700 font-semibold text-sm leading-snug">{act.title}</p>
            </>
          )}
        </div>

        <div className={`flex gap-1 shrink-0 ${editing ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          {editing ? (
            <>
              <button onClick={save} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => setEditing(false)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all">
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={() => onDelete(dayIndex, actIndex)} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

// ─── Budget card ──────────────────────────────────────────────────────────────
const BudgetBar = ({ label, amount = 0, total = 0, color }) => {
  const safeAmount = amount || 0;
  const safeTotal = total || 1; // Prevent division by zero
  const pct = Math.round((safeAmount / safeTotal) * 100);
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold text-slate-500">
        <span>{label}</span><span>₹{safeAmount.toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteItinerary, setItineraries } = useAuth();

  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editingDest, setEditingDest] = useState(false);
  const [destInput, setDestInput] = useState('');

  // Load from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('itineraries')) || [];
    const found = data.find(t => String(t.id) === String(id));
    if (found) {
      if (found.plan && !found.days) {
        const safePlan = Array.isArray(found.plan) ? found.plan : [];
        found.days = safePlan.map((text, i) => ({
          day: i + 1,
          activities: [{ id: `${found.id}-${i}-0`, time: 'Morning', title: typeof text === 'string' ? text.replace(/^Day \d+:\s*/, '') : 'Activity' }]
        }));
        found.budget = { stay: 18000, food: 6000, travel: 12000, activities: 5000, total: 41000 };
      }
      setTrip(found);
      setDestInput(found.destination);
    }
  }, [id]);

  // Persist changes
  const persist = useCallback((updatedTrip) => {
    const data = JSON.parse(localStorage.getItem('itineraries')) || [];
    const updated = data.map(t => String(t.id) === String(id) ? updatedTrip : t);
    localStorage.setItem('itineraries', JSON.stringify(updated));
    setItineraries(updated);
  }, [id, setItineraries]);

  const saveAndUpdate = (updatedTrip) => {
    setTrip(updatedTrip);
    persist(updatedTrip);
  };

  // ── Activity CRUD ──────────────────────────────────────────────────────────
  const addActivity = (dayIndex) => {
    const days = (Array.isArray(trip.days) ? trip.days : []).map((d, i) => i === dayIndex
      ? { ...d, activities: [...(Array.isArray(d.activities) ? d.activities : []), { id: `a-${Date.now()}`, time: 'Morning', title: 'New Activity' }] }
      : d
    );
    saveAndUpdate({ ...trip, days });
  };

  const editActivity = (dayIndex, actIndex, updated) => {
    const days = (Array.isArray(trip.days) ? trip.days : []).map((d, i) => {
      if (i !== dayIndex) return d;
      const activities = (Array.isArray(d.activities) ? d.activities : []).map((a, ai) => ai === actIndex ? updated : a);
      return { ...d, activities };
    });
    saveAndUpdate({ ...trip, days });
    toast.success('Activity updated');
  };

  const deleteActivity = (dayIndex, actIndex) => {
    const days = (Array.isArray(trip.days) ? trip.days : []).map((d, i) => {
      if (i !== dayIndex) return d;
      return { ...d, activities: (Array.isArray(d.activities) ? d.activities : []).filter((_, ai) => ai !== actIndex) };
    });
    saveAndUpdate({ ...trip, days });
    toast.success('Activity removed');
  };

  const reorderActivities = (dayIndex, newOrder) => {
    const days = (Array.isArray(trip.days) ? trip.days : []).map((d, i) => i === dayIndex ? { ...d, activities: newOrder } : d);
    saveAndUpdate({ ...trip, days });
  };

  // ── Add Day ───────────────────────────────────────────────────────────────
  const addDay = () => {
    const safeDays = Array.isArray(trip.days) ? trip.days : [];
    const newDay = {
      day: safeDays.length + 1,
      activities: [{ id: `a-${Date.now()}`, time: 'Morning', title: 'Plan an activity' }]
    };
    saveAndUpdate({ ...trip, days: [...safeDays, newDay] });
    setActiveDay(safeDays.length);
    toast.success('Day added!');
  };

  // ── Delete trip ───────────────────────────────────────────────────────────
  const handleDelete = () => {
    deleteItinerary(Number(id));
    navigate('/itineraries');
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // ── Export (print) ────────────────────────────────────────────────────────
  const handleExport = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // ── Save destination name ─────────────────────────────────────────────────
  const saveDest = () => {
    saveAndUpdate({ ...trip, destination: destInput });
    setEditingDest(false);
    toast.success('Destination updated!');
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Trip not found.</h2>
          <button onClick={() => navigate('/itineraries')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all">
            Back to Itineraries
          </button>
        </div>
      </div>
    );
  }

  const currentDay = trip.days[activeDay];

  return (
    <div className="min-h-screen bg-[#fcfdfe] print:bg-white flex flex-col">
      <div className="flex-1 min-w-0 w-full px-4 md:px-8 py-12 pb-40 space-y-8">

        {/* Back */}
        <button onClick={() => navigate('/itineraries')}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-sm transition-colors group print:hidden">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Itineraries
        </button>

        {/* ── Banner Image ─────────────────────────────────────────────────── */}
        {trip.images && trip.images[0] && (
          <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-md">
            <img src={trip.images[0]} alt={trip.destination} className="w-full h-full object-cover" />
          </div>
        )}

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                <Sparkles className="w-3 h-3" /> AI Generated
              </div>

              {editingDest ? (
                <div className="flex gap-2 items-center">
                  <input autoFocus value={destInput} onChange={e => setDestInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveDest()}
                    className="text-3xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-400 flex-1" />
                  <button onClick={saveDest} className="p-2 bg-emerald-500 text-white rounded-xl"><Check className="w-5 h-5" /></button>
                  <button onClick={() => setEditingDest(false)} className="p-2 bg-slate-100 text-slate-500 rounded-xl"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <button onClick={() => setEditingDest(true)}
                  className="text-4xl font-black text-slate-900 tracking-tight capitalize hover:text-emerald-700 transition-colors text-left">
                  {trip.destination}
                </button>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Calendar className="w-4 h-4" /> {(Array.isArray(trip.days) ? trip.days : []).length} Days
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Clock className="w-4 h-4" />
                  {(Array.isArray(trip.days) ? trip.days : []).reduce((acc, d) => acc + (Array.isArray(d.activities) ? d.activities.length : 0), 0)} Activities
                </span>
                {trip.budget && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <Wallet className="w-4 h-4" /> ₹{trip.budget.total.toLocaleString('en-IN')} est.
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0 print:hidden">
              <button onClick={handleShare} title="Share" className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-emerald-600 transition-all">
                <Share2 className="w-4 h-4" />
              </button>
              <button onClick={handleExport} title="Export / Print" className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-emerald-600 transition-all">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => setShowMap(v => !v)} title="Toggle Map" className={`p-3 rounded-xl transition-all ${showMap ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-emerald-600'}`}>
                <MapIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} title="Delete" className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Map View ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm print:hidden"
            >
              <div className="bg-slate-800 h-72 flex items-center justify-center relative">
                <iframe
                  title="Trip Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(trip.destination)}&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Planner ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

          {/* Day Switcher */}
          <div className="space-y-2 print:hidden">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-2 mb-3">Days</p>
            {(Array.isArray(trip.days) ? trip.days : []).map((d, i) => (
              <button key={i} onClick={() => setActiveDay(i)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeDay === i
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                }`}>
                <span>Day {d.day}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeDay === i ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                  {d.activities.length}
                </span>
              </button>
            ))}
            <button onClick={addDay}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all font-bold text-sm">
              <Plus className="w-4 h-4" /> Add Day
            </button>
          </div>

          {/* Activities Panel */}
          <AnimatePresence mode="wait">
            {currentDay && (
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Day {currentDay.day}</h2>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">{(Array.isArray(currentDay.activities) ? currentDay.activities : []).length} activities planned</p>
                  </div>
                  <button onClick={() => addActivity(activeDay)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 print:hidden">
                    <Plus className="w-4 h-4" /> Add Activity
                  </button>
                </div>

                {/* Drag-to-reorder activity list */}
                <Reorder.Group
                  axis="y"
                  values={Array.isArray(currentDay.activities) ? currentDay.activities : []}
                  onReorder={(newOrder) => reorderActivities(activeDay, newOrder)}
                  className="space-y-3"
                >
                  {(Array.isArray(currentDay.activities) ? currentDay.activities : []).map((act, actIndex) => (
                    <ActivityCard
                      key={act.id}
                      act={act}
                      dayIndex={activeDay}
                      actIndex={actIndex}
                      onEdit={editActivity}
                      onDelete={deleteActivity}
                    />
                  ))}
                </Reorder.Group>

                {(Array.isArray(currentDay.activities) ? currentDay.activities : []).length === 0 && (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No activities yet.</p>
                    <button onClick={() => addActivity(activeDay)}
                      className="mt-3 px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all">
                      + Add First Activity
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Budget Breakdown ────────────────────────────────────────────── */}
        {trip.budget && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Budget Estimate</h3>
              <span className="text-2xl font-black text-emerald-600">₹{trip.budget.total.toLocaleString('en-IN')}</span>
            </div>
            <div className="space-y-4">
              <BudgetBar label="Stay / Accommodation" amount={trip.budget.stay} total={trip.budget.total} color="bg-emerald-400" />
              <BudgetBar label="Food & Dining" amount={trip.budget.food} total={trip.budget.total} color="bg-amber-400" />
              <BudgetBar label="Travel & Transport" amount={trip.budget.travel} total={trip.budget.total} color="bg-sky-400" />
              <BudgetBar label="Activities & Experiences" amount={trip.budget.activities} total={trip.budget.total} color="bg-violet-400" />
            </div>
          </div>
        )}

        {/* ── Print-only full view ─────────────────────────────────────────── */}
        <div className="hidden print:block space-y-6">
          <h1 className="text-4xl font-black">{trip.destination} — Travel Itinerary</h1>
          {(Array.isArray(trip.days) ? trip.days : []).map((d) => (
            <div key={d.day}>
              <h2 className="text-xl font-bold border-b pb-2 mb-3">Day {d.day}</h2>
              {(Array.isArray(d.activities) ? d.activities : []).map((act, i) => (
                <p key={i} className="text-sm mb-1"><strong>{act.time}:</strong> {act.title}</p>
              ))}
            </div>
          ))}
        </div>

      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900">Delete this trip?</h3>
                <p className="text-slate-400 text-sm font-medium">
                  "<span className="font-bold text-slate-700">{trip.destination}</span>" will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryDetail;
