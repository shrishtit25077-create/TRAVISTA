import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Heart, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');

  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Preferences', icon: Heart },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: Shield },
    { name: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 space-y-2">
        {tabs.map(tab => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all ${activeTab === tab.name ? 'bg-teal text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.name ? 'rotate-90' : ''}`} />
          </button>
        ))}
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all mt-10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-8">
        <h2 className="text-3xl font-bold">{activeTab} Settings</h2>

        {activeTab === 'Profile' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-3xl space-y-10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-teal/10 flex items-center justify-center text-teal text-4xl font-black overflow-hidden border-4 border-white shadow-xl">
                  {user?.name?.[0] || 'T'}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-all">
                  <User className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-2xl font-bold">{user?.name || 'Traveler'}</h3>
                <p className="text-gray-500">{user?.email || 'traveler@example.com'}</p>
                <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-teal/10 text-teal text-xs font-bold rounded-full w-fit mx-auto md:mx-0">
                  <Shield className="w-3 h-3" /> VERIFIED ACCOUNT
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <input type="text" className="w-full input-field" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Email</label>
                <input type="email" className="w-full input-field" defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Location</label>
                <input type="text" className="w-full input-field" placeholder="London, UK" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                <input type="tel" className="w-full input-field" placeholder="+44 7123 456789" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button className="px-8 py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 transition-all">Cancel</button>
              <button className="btn-primary px-8 py-3">Save Changes</button>
            </div>
          </motion.div>
        )}

        {activeTab === 'Preferences' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-3xl space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Heart className="text-teal w-6 h-6" /> Travel Interests
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Culture', 'Adventure', 'Food', 'Relaxation', 'Luxury', 'Budget', 'Nightlife', 'Hiking', 'Photography'].map(item => (
                  <label key={item} className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl cursor-pointer hover:bg-teal/5 transition-all border border-transparent hover:border-teal/20">
                    <input type="checkbox" className="w-5 h-5 accent-teal" defaultChecked={['Culture', 'Food'].includes(item)} />
                    <span className="font-bold text-gray-600">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="text-teal w-6 h-6" /> Home Base
              </h3>
              <input type="text" className="w-full input-field" placeholder="Which city do you usually fly from?" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
