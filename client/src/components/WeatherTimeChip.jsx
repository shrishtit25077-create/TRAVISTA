import React from 'react';
import { Moon, Sun } from 'lucide-react';

const WeatherTimeChip = ({ userWeather, destWeather, destTime, isDay, loading }) => {
  if (loading) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-md rounded-full px-4 py-2 w-[90%] max-w-[320px] h-[40px] z-20 border border-white/10 animate-pulse flex items-center justify-between">
        <div className="w-16 h-4 bg-white/20 rounded"></div>
        <div className="w-[1px] h-6 bg-white/20 mx-3 shrink-0" />
        <div className="w-16 h-4 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (!userWeather || !destWeather) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-between bg-black/55 backdrop-blur-md rounded-full px-4 py-2 w-[90%] max-w-[320px] text-white z-20 border border-white/10 shadow-lg">
      
      {/* Left side: User location */}
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <img src={userWeather.icon} alt="user weather" className="w-5 h-5 opacity-90 shrink-0" />
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider leading-none mb-0.5 truncate">{userWeather.city}</span>
          <span className="text-xs font-bold leading-none">{userWeather.temp}°C</span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-[1px] h-6 bg-white/20 mx-3 shrink-0" />

      {/* Right side: Destination */}
      <div className="flex items-center gap-2 flex-1 justify-end overflow-hidden">
        <div className="flex flex-col items-end overflow-hidden">
          <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider leading-none mb-0.5 flex items-center gap-1">
            {destTime} {isDay ? <Sun className="w-2.5 h-2.5 text-amber-300 shrink-0" /> : <Moon className="w-2.5 h-2.5 text-blue-300 shrink-0" />}
          </span>
          <span className="text-xs font-bold leading-none flex items-center gap-1">
            {destWeather.temp}°C
          </span>
        </div>
        <img src={destWeather.icon} alt="dest weather" className="w-5 h-5 opacity-90 shrink-0" />
      </div>
      
    </div>
  );
};

export default WeatherTimeChip;
