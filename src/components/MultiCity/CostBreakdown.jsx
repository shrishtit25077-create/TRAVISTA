import React from 'react';
import { Wallet } from 'lucide-react';

export const CostBreakdown = ({ budget, breakdown }) => {
  if (!breakdown) return null;

  const chartData = [
    { label: 'Transport', value: breakdown.transport || 0, color: '#6366f1' },
    { label: 'Accommodation', value: breakdown.accommodation || 0, color: '#10b981' },
    { label: 'Food', value: breakdown.food || 0, color: '#f59e0b' },
    { label: 'Activities', value: breakdown.activities || 0, color: '#ec4899' },
    { label: 'Misc', value: breakdown.misc || 0, color: '#94a3b8' },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
        <Wallet size={16} className="text-[#1D9E75]" /> Cost Breakdown
      </h3>
      
      {/* Custom Progress Bar Chart */}
      <div className="flex h-4 rounded-full overflow-hidden mb-6">
        {chartData.map(item => (
          <div 
            key={item.label} 
            style={{ 
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color 
            }} 
            className="h-full transition-all duration-500"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {chartData.map((item) => (
          <div key={item.label} className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
              <span className="text-xs font-bold text-slate-900">₹{Number(item.value || 0).toLocaleString()}</span>
              <span className="text-[9px] font-bold text-slate-400">{((item.value / total) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Budget</span>
          <span className="text-sm font-bold text-slate-500">₹{Number(budget || 0).toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-[#1D9E75] uppercase tracking-widest block mb-1">Estimated Total</span>
          <span className="text-2xl font-black text-slate-900">₹{Number(total || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
