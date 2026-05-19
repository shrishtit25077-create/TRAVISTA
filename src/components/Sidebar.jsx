import React from 'react';
import {
  Compass, Map, Sparkles, Calendar, Heart,
  User, Settings, LogOut, Globe, Bell, X, Plane, TrendingDown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Nav Item ───────────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, path, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  return (
    <button
      onClick={() => { navigate(path); onClose?.(); }}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
        text-[13px] font-medium transition-all duration-200 group
        ${active
          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }
      `}
    >
      <Icon
        size={16}
        className={`shrink-0 transition-colors duration-200 ${
          active
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
        }`}
      />
      <span className="truncate">{label}</span>
    </button>
  );
};

// ─── Section Label ───────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] transition-colors duration-300">
      {title}
    </div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

// ─── Sidebar Content (shared desktop + drawer) ───────────────────────────────
const SidebarContent = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] select-none transition-colors duration-300">

      {/* ── Logo ── */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => { navigate('/'); onClose?.(); }}
        >
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105 shrink-0">
            <Compass size={14} className="text-white" />
          </div>
          <span className="font-black text-[17px] tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
            Travista
          </span>
        </div>

        {/* Close — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 py-2">
        <Section title="Discover">
          <NavItem icon={Compass} label="Inspiration" path="/" onClose={onClose} />
          <NavItem icon={Map} label="Explore" path="/explore" onClose={onClose} />
        </Section>

        <Section title="AI Travel">
          <NavItem icon={Sparkles} label="AI Planner" path="/planner" onClose={onClose} />
          <button
            onClick={() => { navigate('/flights'); onClose?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 group"
          >
            <Plane size={16} className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="truncate">Book Flights</span>
          </button>
          <NavItem icon={TrendingDown} label="Price Drops" path="/price-drops" onClose={onClose} />
        </Section>

        <Section title="My Trips">
          <NavItem icon={Calendar} label="Itineraries" path="/itineraries" onClose={onClose} />
          <NavItem icon={Heart} label="Saved" path="/saved" onClose={onClose} />
        </Section>

        <Section title="Account">
          <NavItem icon={User} label="Profile" path="/profile" onClose={onClose} />
          <NavItem icon={Settings} label="Settings" path="/settings" onClose={onClose} />
        </Section>


      </div>

      {/* ── User Footer ── */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors duration-300">
        <div
          className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
          onClick={() => { navigate('/profile'); onClose?.(); }}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-105">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate leading-tight transition-colors duration-300">
              {user?.name || 'Traveller'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5 transition-colors duration-300">
              {user?.email || 'View profile'}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => (
  <>
    {/* Desktop — fixed */}
    <div className="hidden lg:block fixed top-0 left-0 h-screen w-[220px] z-50">
      <SidebarContent />
    </div>

    {/* Mobile / Tablet — spring drawer */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="drawer"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="lg:hidden fixed top-0 left-0 h-screen w-[220px] max-w-[82vw] z-50 shadow-2xl"
        >
          <SidebarContent onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  </>
);

export default Sidebar;
