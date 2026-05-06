import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Check, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  // ── Profile State ────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    location: '',
    phoneNumber: '',
  });

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem('profile'));
    if (storedProfile) {
      setProfile(storedProfile);
    } else {
      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        location: user?.location || '',
        phoneNumber: user?.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateProfile(profile);
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 2000);
    } catch(err) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    const storedProfile = JSON.parse(localStorage.getItem('profile'));
    if (storedProfile) {
      setProfile(storedProfile);
      toast('Changes reverted.', { icon: '↩️' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] px-8 py-16 pb-32">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12 space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            My <span className="text-emerald-600">Profile.</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">Manage your personal identity and contact info.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
            <div className="relative group">
              <div className="w-28 h-28 rounded-[2rem] bg-emerald-100 flex items-center justify-center text-emerald-700 text-4xl font-black border-4 border-white shadow-xl transition-transform group-hover:scale-105">
                {profile.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'T'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{profile.name || user?.name || 'Explorer'}</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Travista Elite Member</p>
              <div className="flex items-center gap-4 mt-3">
                 <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                   {profile.location || 'Location not set'}
                 </div>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Full Name" name="name" value={profile.name} onChange={handleChange} placeholder="Jane Doe" />
            <Field label="Email Address" name="email" type="email" value={profile.email} onChange={handleChange} placeholder="jane@example.com" />
            <Field label="Home Location" name="location" value={profile.location} onChange={handleChange} placeholder="Mumbai, India" />
            <Field label="Phone Number" name="phoneNumber" type="tel" value={profile.phoneNumber} onChange={handleChange} placeholder="+91 98765 43210" />
          </div>

          {/* Bio / Bio placeholder since we want to expand but keep same UI feel */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bio & Travel Philosophy</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm placeholder-slate-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all h-32"
              placeholder="Tell us about your travel style..."
              defaultValue="Passionate explorer seeking authentic experiences and hidden gems across the globe. Always ready for the next adventure."
            ></textarea>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-slate-400 font-bold text-sm hover:text-red-500 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 sm:flex-none px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${
                  saved
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-200'
                }`}
              >
                {saved ? <><Check className="w-4 h-4" /> Updated!</> : 'Update Profile'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
