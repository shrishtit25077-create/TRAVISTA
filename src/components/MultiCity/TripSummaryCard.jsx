import React from 'react';
import { Calendar, Users, MapPin, Wallet } from 'lucide-react';

export const TripSummaryCard = ({ plan, budget, duration, travelers, destination }) => {
  if (!plan) return null;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Trip Summary</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">{plan.summary}</p>
        </div>
        <div className="bg-[#1D9E75]/10 px-4 py-2 rounded-2xl border border-[#1D9E75]/20 flex items-center gap-2">
          <span className="text-lg">{plan.tierEmoji}</span>
          <span className="text-xs font-black text-[#1D9E75] uppercase tracking-widest">{plan.tier}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
        <div className="bg-slate-50 rounded-2xl p-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
             <MapPin size={12} /> Destination
           </span>
           <span className="text-sm font-black text-slate-900">{Array.isArray(destination) ? `${destination.length} Cities` : destination}</span>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
             <Calendar size={12} /> Duration
           </span>
           <span className="text-sm font-black text-slate-900">{duration} Days</span>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
             <Users size={12} /> Travelers
           </span>
           <span className="text-sm font-black text-slate-900">{travelers} {travelers > 1 ? 'People' : 'Person'}</span>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
             <Wallet size={12} /> Per Person / Day
           </span>
           <span className="text-sm font-black text-[#1D9E75]">
              ₹{Math.round((plan.totalCostBreakdown?.transport + plan.totalCostBreakdown?.accommodation + plan.totalCostBreakdown?.food + plan.totalCostBreakdown?.activities + plan.totalCostBreakdown?.misc) / (duration * travelers)).toLocaleString() || '?'}
           </span>
        </div>
      </div>
    </div>
  );
};
