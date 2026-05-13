import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, Heart, LogOut, Moon, Smartphone, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../../hooks/use-theme';

// ─── Premium Toggle Switch ─────────────────────────────────────────────────────
const Toggle = ({ enabled, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    className={`relative flex-shrink-0 w-[52px] h-[30px] rounded-full transition-all duration-300 ease-in-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
      enabled
        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
        : 'bg-slate-200 dark:bg-slate-600'
    }`}
  >
    <span
      className={`absolute top-[3px] w-6 h-6 bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out ${
        enabled ? 'left-[23px]' : 'left-[3px]'
      }`}
    />
  </button>
);

// ─── Field Input ──────────────────────────────────────────────────────────────
const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium text-sm placeholder-slate-300 dark:placeholder-slate-600 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all"
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Preferences');

  // Non-theme settings (location, alerts, notifications, etc.)
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    locationServices: true,
    travelAlerts: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('travista-prefs'));
    if (stored) setSettings(stored);
  }, []);

  const toggleSetting = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('travista-prefs', JSON.stringify(updated));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${updated[key] ? 'enabled' : 'disabled'}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  const tabs = [
    { name: 'Preferences', icon: Heart },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-300 px-4 sm:px-8 py-12 pb-32">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12 space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
            App <span className="text-emerald-500">Settings</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-lg transition-colors duration-300">
            Configure how Travista works for you.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {/* Left Nav */}
          <div className="w-full md:w-56 space-y-1 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === tab.name
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}

            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border-l-4 border-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Content Panel */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >

                {/* ── PREFERENCES TAB ─────────────────────────────────── */}
                {activeTab === 'Preferences' && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
                    <h3 className="font-black text-slate-900 dark:text-white text-xl mb-6 transition-colors duration-300">
                      App Preferences
                    </h3>

                    {/* Dark Mode — wired to global theme */}
                    <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50 transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center transition-colors duration-300">
                          <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm transition-colors duration-300">
                            Dark Mode
                          </p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5 transition-colors duration-300">
                            Switch to a dark interface theme
                          </p>
                        </div>
                      </div>
                      <Toggle
                        enabled={isDark}
                        onToggle={() => {
                          toggleTheme();
                          toast.success(isDark ? '☀️ Light mode enabled' : '🌙 Dark mode enabled');
                        }}
                      />
                    </div>

                    {/* Location Services */}
                    <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50 transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center transition-colors duration-300">
                          <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm transition-colors duration-300">
                            Location Services
                          </p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5 transition-colors duration-300">
                            Allow Travista to use your location for better suggestions
                          </p>
                        </div>
                      </div>
                      <Toggle
                        enabled={settings.locationServices}
                        onToggle={() => toggleSetting('locationServices')}
                      />
                    </div>

                    {/* Travel Alerts */}
                    <div className="flex items-center justify-between py-4 transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center transition-colors duration-300">
                          <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm transition-colors duration-300">
                            Travel Alerts
                          </p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5 transition-colors duration-300">
                            Get notified about price drops and availability
                          </p>
                        </div>
                      </div>
                      <Toggle
                        enabled={settings.travelAlerts}
                        onToggle={() => toggleSetting('travelAlerts')}
                      />
                    </div>
                  </div>
                )}

                {/* ── NOTIFICATIONS TAB ───────────────────────────────── */}
                {activeTab === 'Notifications' && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
                    <h3 className="font-black text-slate-900 dark:text-white text-xl mb-6 transition-colors duration-300">
                      Notification Settings
                    </h3>

                    {[
                      { key: 'notifications', label: 'Push Notifications', desc: 'Receive in-app notifications for activity', icon: Bell },
                      { key: 'emailUpdates', label: 'Email Updates', desc: 'Get product updates via email', icon: Globe },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A curated roundup of travel inspiration every week', icon: Smartphone },
                    ].map(({ key, label, desc, icon: Icon }, i, arr) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between py-4 transition-colors duration-300 ${
                          i < arr.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center transition-colors duration-300">
                            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm transition-colors duration-300">{label}</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5 transition-colors duration-300">{desc}</p>
                          </div>
                        </div>
                        <Toggle enabled={settings[key]} onToggle={() => toggleSetting(key)} />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── SECURITY TAB ────────────────────────────────────── */}
                {activeTab === 'Security' && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 transition-colors duration-300">
                    <h3 className="font-black text-slate-900 dark:text-white text-xl transition-colors duration-300">Security</h3>

                    <div className="space-y-4">
                      <Field label="Current Password" name="currentPassword" type="password" value="" onChange={() => {}} placeholder="••••••••••" />
                      <Field label="New Password" name="newPassword" type="password" value="" onChange={() => {}} placeholder="••••••••••" />
                      <Field label="Confirm New Password" name="confirmPassword" type="password" value="" onChange={() => {}} placeholder="••••••••••" />
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl transition-colors duration-300">
                      <p className="text-amber-700 dark:text-amber-400 text-sm font-bold transition-colors duration-300">
                        ⚠ Password changes are not persisted in demo mode.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out &amp; Clear Session
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
