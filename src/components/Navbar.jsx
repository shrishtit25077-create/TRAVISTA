import React from 'react';
import { Search, Bell } from 'lucide-react';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-50 bg-transparent">
      {/* Search Architecture */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destinations, stays, experiences..."
            className="w-full bg-white border border-slate-100 rounded-full pl-11 pr-4 py-2 text-[13px] font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-100 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all group shadow-sm">
          <Bell className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
