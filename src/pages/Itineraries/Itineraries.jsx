import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, Map, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Itineraries() {
  const { itineraries, deleteItinerary } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcfdfe] min-h-screen px-8 py-16 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
            My <span className="text-emerald-600">Itineraries.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Your generated travel plans and upcoming adventures.
          </p>
        </div>

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
              // Support both new format (days array) and old format (plan array)
              const isNewFormat = Array.isArray(trip.days) && typeof trip.days[0] === 'object';
              const dayCount = isNewFormat ? trip.days.length : (trip.days || trip.plan?.length || 0);
              const activityCount = isNewFormat
                ? trip.days.reduce((acc, d) => acc + d.activities.length, 0)
                : (trip.plan?.length || 0);
              const previewItems = isNewFormat
                ? trip.days.slice(0, 2).map(d => ({ label: `Day ${d.day}`, text: d.activities[0]?.title || '—' }))
                : (trip.plan || []).slice(0, 3).map((p, i) => ({ label: `Day ${i+1}`, text: p.replace(/^Day \d+:\s*/, '') }));

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => navigate(`/itinerary/${trip.id}`)}
                  className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
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
                    {((isNewFormat ? trip.days.length : trip.plan?.length) || 0) > previewItems.length && (
                      <p className="text-xs text-slate-400 font-bold text-center pt-1">
                        +{((isNewFormat ? trip.days.length : trip.plan?.length) || 0) - previewItems.length} more days →
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.id}`); }}
                      className="text-xs font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">
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
