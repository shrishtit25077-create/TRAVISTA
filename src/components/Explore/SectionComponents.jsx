import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Navigation, Heart, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toggleSavePlace } from '../../services/userService';
import Masonry from 'react-masonry-css';

const Card = ({ data, size = 'medium' }) => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user?.preferences?.savedPlaces) {
      setIsSaved(user.preferences.savedPlaces.some(p => p.id === data.id));
    }
  }, [user, data.id]);

  const handleSave = (e) => {
    e.stopPropagation();
    toggleSavePlace(user, data, updateUser);
  };

  const heightClass = {
    small: 'h-[240px]',
    medium: 'h-[360px]',
    large: 'h-[480px]'
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-soft hover:shadow-premium transition-all duration-500 mb-8 cursor-pointer group"
    >
      <div className={`relative ${heightClass} overflow-hidden`}>
        <img 
          loading="lazy" 
          src={data.image} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt={data.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        {/* Heart Action */}
        <div className="absolute top-4 right-4 z-20">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
              isSaved 
                ? "bg-red-500 text-white" 
                : "bg-white/80 text-gray-400 hover:bg-white hover:text-gray-900"
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </motion.button>
        </div>

        {/* Floating Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1.5 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-gray-900">{data.rating}</span>
          </div>
          <div className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full shadow-sm">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">{data.category}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">
            {data.name}
          </h3>
          <span className="text-lg font-black text-emerald-600 leading-none">{data.price}</span>
        </div>
        
        <div className="flex gap-2 pt-2">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/map?focus=${data.id}`); }}
            className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5" /> Map View
          </button>
          <button className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all">
            Plan Trip
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const RowSection = ({ title, data }) => (
  <section className="space-y-6">
    <div className="flex items-center justify-between px-2">
      <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{title}</h2>
      <button className="group flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-all">
        See All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 px-2">
      {data.map(item => (
        <div key={item.id} className="min-w-[340px]">
          <Card data={item} size="small" />
        </div>
      ))}
    </div>
  </section>
);

export const GridSection = ({ title, data }) => (
  <section className="space-y-6">
    <div className="px-2">
      <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{title}</h2>
    </div>
    <Masonry
      breakpointCols={{ default: 4, 1400: 3, 1000: 2, 600: 1 }}
      className="flex -ml-8 w-auto px-2"
      columnClassName="pl-8"
    >
      {data.map((item, i) => (
        <Card 
          key={item.id} 
          data={item} 
          size={i % 5 === 0 ? 'large' : i % 3 === 0 ? 'small' : 'medium'} 
        />
      ))}
    </Masonry>
  </section>
);

export const HeroSection = ({ title, data }) => {
  const item = data[0];
  if (!item) return null;
  return (
    <section className="px-2">
      <div className="relative rounded-[3rem] overflow-hidden group shadow-soft border border-gray-100">
        <img loading="lazy" src={item.image} className="w-full h-[520px] object-cover transition-transform duration-[2s] group-hover:scale-105" alt={item.name} />
        
        {/* Soft Light Overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-md p-12 md:p-16 rounded-[3rem] shadow-premium max-w-2xl text-center space-y-8 border border-white/50"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-emerald-50 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 mx-auto">
              <Sparkles className="w-4 h-4" />
              AI Featured Experience
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]">
              Curate your <br/>
              <span className="text-emerald-500">{title}</span>
            </h2>
            
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-lg mx-auto">
              Discover unique destinations and architect your dream escape with our AI-powered discovery engine.
            </p>

            <button className="px-12 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-4 mx-auto">
              Start Exploring <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
