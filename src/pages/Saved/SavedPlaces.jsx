import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Sparkles, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Masonry from 'react-masonry-css';

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
          <Masonry
            breakpointCols={masonryBreakpoints}
            className="flex -ml-8 w-auto"
            columnClassName="pl-8 bg-clip-padding"
          >
            {savedPlaces.map((place, i) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
                className="relative h-[320px] rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-slate-100 mb-8"
              >
                <img src={place.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={place.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={(e) => handleUnsave(e, place)}
                    className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform active:scale-90"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                  </button>
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#8FDAC7] tracking-widest">{place.category}</span>
                    <h3 className="text-2xl font-black tracking-tight">{place.name}</h3>
                    <div className="flex justify-between items-center pt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                       <span className="text-lg font-bold">{place.price}</span>
                       <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/map?focus=${place.id}`); }}
                            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center hover:bg-[#1f6f63] transition-all"
                          >
                            <Navigation className="w-4 h-4" />
                          </button>
                          <button className="bg-white text-[#1f6f63] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#8FDAC7] transition-all transform active:scale-95 shadow-lg">
                            Plan Trip
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Masonry>
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
