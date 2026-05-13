import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, ArrowLeft } from 'lucide-react';
import MapView from '../../components/Explore/MapView';
import { exploreDestinations } from '../../data/exploreDestinations';
import { useNavigate } from 'react-router-dom';
const MapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#F8FAFC]">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-[60] bg-white/90 backdrop-blur-lg border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Map className="text-emerald-500" size={20} />
            Explore <span className="text-emerald-600">Map</span>
          </h1>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-0 relative">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-73px)] w-full relative z-0">
          <MapView 
            destinations={exploreDestinations} 
            onPlanTrip={(d) => navigate(`/destination/${d.id}`, { state: d })}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;
