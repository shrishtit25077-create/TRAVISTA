import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIArchitect = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-sm border border-emerald-100">
          <Sparkles className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          AI Travel Architect
        </h1>
        
        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          The next generation of automated itinerary building is under development. Our architect is busy crafting a more robust engine for your future travels.
        </p>
        
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-2xl font-medium shadow-lg">
            Coming Soon
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AIArchitect;
