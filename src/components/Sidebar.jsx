import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass, Map as MapIcon, Heart, Calendar,
  Settings, Plane, LogOut, User,
  LayoutGrid, MessageSquare, ClipboardList,
  ChevronLeft, Sparkles, PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className="outline-none"
  >
    {({ isActive }) => (
      <div className={`
        relative flex items-center gap-3 px-5 py-3 rounded-full
        transition-all duration-300 group
        ${isActive
          ? 'sidebar-pill-active shadow-sm'
          : 'text-[#6b7280] hover:bg-slate-50 hover:text-[#2F7F6D]'
        }
      `}>
        <Icon
          strokeWidth={1.5}
          className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#2F7F6D]' : ''}`}
        />
        <span className="text-[14px] tracking-tight">{label}</span>
      </div>
    )}
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-slate-100 flex flex-col z-[100]"
    >
      {/* Brand Header */}
      <div className="p-8 flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
        <div className="w-9 h-9 rounded-xl bg-[#2F7F6D] flex items-center justify-center text-white shadow-lg shadow-emerald-900/10 transition-transform hover:scale-105">
          <Plane strokeWidth={1.5} className="w-5 h-5 -rotate-45" />
        </div>
        <span className="font-bold text-xl tracking-tighter text-slate-900 uppercase italic">Travista</span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-5 text-[10px] font-black text-[#9ca3af] uppercase tracking-[0.3em] mb-3 mt-4">Discover</div>
        <SidebarLink to="/" icon={PlusCircle} label="Inspiration" />
        <SidebarLink to="/explore" icon={MapIcon} label="Explore Map" />

        <div className="px-5 text-[10px] font-black text-[#9ca3af] uppercase tracking-[0.3em] mb-3 mt-8">My Trips</div>
        <SidebarLink to="/saved" icon={Heart} label="Saved Places" />
        <SidebarLink to="/bookings" icon={ClipboardList} label="Itineraries" />
        <SidebarLink to="/ai-planner" icon={MessageSquare} label="AI Planner" />
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-6 border-t border-slate-50">
        <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/settings')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#2F7F6D]/30">
              <User strokeWidth={1.5} className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900 leading-tight">Demo User</p>
              <p className="text-[11px] font-medium text-slate-400">View profile</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); logout(); navigate('/login'); }}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors focus:ring-2 focus:ring-red-500/20 rounded-lg outline-none"
          >
            <LogOut strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
