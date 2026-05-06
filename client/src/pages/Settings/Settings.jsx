import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Heart, MapPin, LogOut, ChevronRight, Check, Sun, Moon, Smartphone, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Reusable Toggle Switch ──────────────────────────────────────────────────
const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
  >
    <span
      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'left-7' : 'left-1'}`}
    />
  </button>
);

// ─── Field Input ─────────────────────────────────────────────────────────────
const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm placeholder-slate-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Preferences');

  // ── Settings State ───────────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: false,
    locationServices: true,
    travelAlerts: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('settings'));
    if (storedSettings) setSettings(storedSettings);
  }, []);

  const toggleSetting = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('settings', JSON.stringify(updated));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${updated[key] ? 'enabled' : 'disabled'}`);
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate('/login');
  };

  const tabs = [
    { name: 'Preferences', icon: Heart },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] px-8 py-16 pb-32">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12 space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            App <span className="text-emerald-600">Settings.</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">Configure how Travista works for you.</p>
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
                    ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-600'
                    : 'text-slate-500 hover:bg-slate-100 border-l-4 border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}

            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all border-l-4 border-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Content Panel */}
          <div className="flex-1">
            <AnimatePresence mode="wait">

              {/* ── PREFERENCES TAB ─────────────────────────────────── */}
              {activeTab === 'Preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8"
                >
                  <h3 className="font-black text-slate-900 text-xl">App Preferences</h3>

                  {[
                    { key: 'darkMode', label: 'Dark Mode', desc: 'Switch to a dark interface theme', icon: Moon },
                    { key: 'locationServices', label: 'Location Services', desc: 'Allow Travista to use your location for better suggestions', icon: Globe },
                    { key: 'travelAlerts', label: 'Travel Alerts', desc: 'Get notified about price drops and availability', icon: Bell },
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between py-4 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{label}</p>
                          <p className="text-slate-400 text-xs font-medium mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <Toggle enabled={settings[key]} onToggle={() => toggleSetting(key)} />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ── NOTIFICATIONS TAB ───────────────────────────────── */}
              {activeTab === 'Notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6"
                >
                  <h3 className="font-black text-slate-900 text-xl">Notification Settings</h3>

                  {[
                    { key: 'notifications', label: 'Push Notifications', desc: 'Receive in-app notifications for activity', icon: Bell },
                    { key: 'emailUpdates', label: 'Email Updates', desc: 'Get product updates via email', icon: Globe },
                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A curated roundup of travel inspiration every week', icon: Smartphone },
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between py-4 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{label}</p>
                          <p className="text-slate-400 text-xs font-medium mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <Toggle enabled={settings[key]} onToggle={() => toggleSetting(key)} />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ── SECURITY TAB ────────────────────────────────────── */}
              {activeTab === 'Security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8"
                >
                  <h3 className="font-black text-slate-900 text-xl">Security</h3>

                  <div className="space-y-4">
                    <Field label="Current Password" name="currentPassword" type="password" value="" onChange={() => {}} placeholder="••••••••••" />
                    <Field label="New Password" name="newPassword" type="password" value="" onChange={() => {}} placeholder="••••••••••" />
                    <Field label="Confirm New Password" name="confirmPassword" type="password" value="" onChange={() => {}} placeholder="••••••••••" />
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-amber-700 text-sm font-bold">⚠ Password changes are not persisted in demo mode.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out & Clear Session
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
