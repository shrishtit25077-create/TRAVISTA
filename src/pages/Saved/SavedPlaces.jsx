import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Sparkles, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DestinationCard from '../../components/DestinationCard';

const SavedPlaces = () => {
  const { savedPlaces, toggleSave } = useAuth();
  const navigate = useNavigate();

  const handleUnsave = (e, place) => {
    e.stopPropagation();
    toggleSave(place);
  };

  const masonryBreakpoints = {
    default: 4,
    1400: 3,
    1000: 2,
    700: 1
  };

  return (
    <div className="min-h-full bg-[#fcfdfe] px-8 py-16 pb-32">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full text-red-500 border border-red-100 mb-2"
          >
            <Heart className="w-4 h-4 fill-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Your Private Collection</span>
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">
            Saved <span className="text-[#1f6f63]">Wonders</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-xl">
            A curated list of destinations that caught your eye. Ready to turn these dreams into itineraries?
          </p>
        </div>

        {savedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {savedPlaces.map((place, i) => (
                <DestinationCard 
                  key={place.id} 
                  item={place} 
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-12 h-12 text-slate-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Your heart is still wandering.</h3>
              <p className="text-slate-400 font-medium">Save destinations you love and they will appear here for planning.</p>
            </div>
            <button 
              onClick={() => navigate('/explore')}
              className="px-10 py-5 bg-[#1f6f63] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#165a50] transition-all"
            >
              Start Exploring
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedPlaces;
