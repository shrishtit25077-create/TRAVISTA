import React from 'react';
import { Heart, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDestinationPhotos, useWeather } from '../../hooks/useTravista';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';
import { track } from '../../services/trackingService';

const ExploreCard = ({ dest, priority = false, onPlanTrip }) => {
  const navigate = useNavigate();
  const { savedPlaces, toggleSave } = useAuth();
  const isSaved = savedPlaces?.some(p => p.id === dest.id);

  const { photoUrl, loading: photoLoading } = useDestinationPhoto(dest.name);
  const { weather } = useWeather(dest.name);


  const catColors = {
    'Relaxing Beach':     'bg-blue-500/80 text-blue-100',
    'Mountain Adventure': 'bg-amber-500/80 text-amber-100',
    'Cultural History':   'bg-purple-500/80 text-purple-100',
    'Food Tour':          'bg-orange-500/80 text-orange-100',
    'Spiritual':          'bg-pink-500/80 text-pink-100',
    'Hill Stations':      'bg-teal-500/80 text-teal-100',
  };
  const badgeClass = catColors[dest.category] || 'bg-gray-500/80 text-gray-100';

  const handleClick = () => {
    track.viewed(dest.name);
    if (onPlanTrip) {
      onPlanTrip(dest);
    } else {
      navigate(`/destination/${dest.id}`, { state: dest });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={handleClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-shadow"
      style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: priority ? '4/3' : '3/4' }}
      >
        {photoLoading ? (
          <div className="absolute inset-0 shimmer" />
        ) : (
          <img
            src={photoUrl}
            alt={dest.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${encodeURIComponent(dest.name)}/800/600`;
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${badgeClass} relative z-[2]`}>
            {dest.category}
          </span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); toggleSave(dest); track.saved(dest.name); }}
          className={`absolute top-3 right-3 z-[10] w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all relative z-[2] ${
            isSaved ? 'bg-red-500/90 text-white' : 'bg-black/30 text-white hover:bg-[#1D9E75]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4 z-[10] relative z-[2]">
          {weather && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit mb-2">
              <img src={weather.icon} alt="" className="w-4 h-4" />
              <span className="text-white text-[11px] font-bold">{weather.temp}°C</span>
            </div>
          )}
          <h3 className="text-white font-bold text-lg leading-tight group-hover:text-[#1D9E75] transition-colors">
            {dest.name}
          </h3>
          <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {dest.country} {dest.flag}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white text-sm font-bold">
              {dest.price} <span className="text-white/50 text-xs font-normal">/ person</span>
            </span>
            <div className="flex items-center gap-1 bg-[#1D9E75] text-white text-[11px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExploreCard;
