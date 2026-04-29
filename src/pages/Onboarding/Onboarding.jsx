import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, MapPin, Sparkles, User, Heart, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Preferences' },
  { id: 3, title: 'Budget' },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    interests: [],
    budget: 'Medium',
  });
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    updateUser({
      name: formData.name || 'Traveler',
      interests: formData.interests,
      budget: formData.budget,
      onboardingCompleted: true
    });
    navigate('/');
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col items-center py-12 px-4">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between mb-2">
          {steps.map(step => (
            <span key={step.id} className={`text-xs font-semibold ${currentStep >= step.id ? 'text-teal-600' : 'text-gray-400'}`}>
              {step.title}
            </span>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-teal-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-white/80 backdrop-blur-xl shadow-xl p-10 rounded-3xl space-y-6 border border-white"
            >
              <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
                <User className="text-teal-500" /> Tell us about you
              </h2>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">What should we call you?</label>
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-lg"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-white/80 backdrop-blur-xl shadow-xl p-10 rounded-3xl space-y-6 border border-white"
            >
              <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
                <Heart className="text-teal-500" /> Travel Preferences
              </h2>
              <p className="text-gray-500">Select what you love most about traveling (Multi-select)</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Culture & History', icon: '🏛️' },
                  { name: 'Adventure', icon: '⛰️' },
                  { name: 'Relaxation', icon: '🏖️' },
                  { name: 'Food & Dining', icon: '🍜' },
                  { name: 'Nightlife', icon: '🥂' },
                  { name: 'Nature', icon: '🌲' }
                ].map(pref => (
                  <motion.div 
                    key={pref.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleInterest(pref.name)}
                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex items-center gap-3 ${formData.interests.includes(pref.name) ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-white'}`}
                  >
                    <span className="text-2xl">{pref.icon}</span>
                    <span className="font-semibold text-gray-700">{pref.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-white/80 backdrop-blur-xl shadow-xl p-10 rounded-3xl space-y-8 border border-white"
            >
              <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
                <Wallet className="text-teal-500" /> Budget Range
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">What's your typical travel budget?</label>
                  <div className="flex flex-col gap-4">
                    {['Budget-Friendly (Backpacker)', 'Medium (Comfortable)', 'Luxury (Premium)'].map(b => (
                      <button 
                        key={b}
                        onClick={() => setFormData({...formData, budget: b})}
                        className={`w-full py-4 px-6 rounded-2xl border-2 transition-all font-semibold text-left ${formData.budget === b ? 'border-teal-500 bg-teal-500 text-white shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="absolute bottom-[-80px] w-full flex justify-between items-center">
          <button 
            onClick={handleBack}
            className={`flex items-center gap-2 text-gray-500 font-bold transition-opacity px-6 py-3 rounded-xl hover:bg-white/50 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={handleFinish}
              className="text-gray-500 font-bold px-6 py-3 hover:bg-white/50 rounded-xl transition-colors"
            >
              Skip
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-gray-800"
            >
              {currentStep === 3 ? 'Finish & Explore' : 'Continue'} <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
