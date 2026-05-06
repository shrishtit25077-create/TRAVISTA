import React from 'react';
import { Compass, Map, Sparkles, Calendar, Heart, User, Settings, LogOut, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, path }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <button 
      onClick={() => navigate(path)}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group text-base font-medium mb-1 ${
        active 
          ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-700' 
          : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'
      }`}
    >
      <Icon 
        size={18} 
        className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'}`} 
      />
      <span>{label}</span>
    </button>
  );
};

const Section = ({ title, children }) => (
  <div className="mt-6">
    <div className="px-4 mb-3 text-xs uppercase tracking-wider text-slate-400 font-bold">
      {title}
    </div>
    <div className="px-2">
      {children}
    </div>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar-fixed flex flex-col bg-white border-r border-slate-100 h-screen w-[260px] fixed top-0 left-0 z-50">
      {/* Logo */}
      <div className="p-6 pb-2">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Compass size={20} className="text-white" />
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight">
            Travista
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        <Section title="Home">
          <NavItem icon={Compass} label="Inspiration" path="/" />
          <NavItem icon={Globe} label="Explore" path="/explore" />
          <NavItem icon={Map} label="Explore Map" path="/map" />
        </Section>

        <Section title="Plan">
          <NavItem icon={Sparkles} label="AI Planner" path="/planner" />
        </Section>

        <Section title="My Trips">
          <NavItem icon={Calendar} label="Itineraries" path="/itineraries" />
          <NavItem icon={Heart} label="Saved Places" path="/saved" />
        </Section>

        <Section title="Account">
          <NavItem icon={User} label="Profile" path="/profile" />
          <NavItem icon={Settings} label="Settings" path="/settings" />
        </Section>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div 
          className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" 
          onClick={() => navigate('/profile')}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"
              alt="Demo User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">Demo User</div>
            <div className="text-xs text-slate-400 mt-0.5 truncate">View profile</div>
          </div>
          <LogOut size={16} className="text-slate-300 hover:text-red-500 transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
