import React from 'react';
import {
  Compass, Map, Sparkles, Calendar, Heart,
  User, Settings, LogOut, Globe, Bell, X
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
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 group border-l-2 ${
        active
          ? 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
      }`}
    >
      <Icon
        size={15}
        className={`shrink-0 transition-all duration-150 ${
          active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
        }`}
      />
      <span className="truncate leading-none">{label}</span>
    </button>
  );
};

// ─── Section Label ───────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="mt-4 first:mt-2">
    <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest"
      style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
      {title}
    </div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

// ─── Sidebar Content (shared between desktop + drawer) ───────────────────────
const SidebarContent = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full select-none"
      style={{ background: 'var(--card-bg)', borderRight: '1px solid var(--border)' }}>

      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => { navigate('/'); onClose?.(); }}
        >
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow shadow-emerald-600/30 group-hover:scale-105 transition-transform shrink-0">
            <Compass size={14} className="text-white" />
          </div>
          <span className="font-black text-[17px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Travista
          </span>
        </div>

        {/* Close — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-3">
        <Section title="Discover">
          <NavItem icon={Compass} label="Inspiration" path="/"          onClose={onClose} />
          <NavItem icon={Map}     label="Explore"     path="/map"        onClose={onClose} />
        </Section>

        <Section title="Plan">
          <NavItem icon={Sparkles} label="AI Planner"  path="/planner"    onClose={onClose} />
          <NavItem icon={Globe}    label="Translator"   path="/translator"  onClose={onClose} />
        </Section>

        <Section title="Trips">
          <NavItem icon={Calendar} label="Itineraries" path="/itineraries" onClose={onClose} />
          <NavItem icon={Heart}    label="Saved"        path="/saved"       onClose={onClose} />
          <NavItem icon={Bell}     label="Alerts"       path="/alerts"      onClose={onClose} />
        </Section>

        <Section title="Account">
          <NavItem icon={User}     label="Profile"   path="/profile"   onClose={onClose} />
          <NavItem icon={Settings} label="Settings"  path="/settings"  onClose={onClose} />
        </Section>
      </div>

      {/* ── User Footer ── */}
      <div className="px-2 pb-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors group"
          style={{ ':hover': { background: 'var(--bg-secondary)' } }}
          onClick={() => { navigate('/profile'); onClose?.(); }}
        >
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'Traveller'}
            </div>
            <div className="text-[10px] truncate leading-tight" style={{ color: 'var(--text-secondary)' }}>
              {user?.email || 'View profile'}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar (exported) ──────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => (
  <>
    {/* Desktop — fixed, always visible */}
    <div className="hidden lg:block fixed top-0 left-0 h-screen w-[220px] z-50">
      <SidebarContent />
    </div>

    {/* Mobile / Tablet — animated drawer */}
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
