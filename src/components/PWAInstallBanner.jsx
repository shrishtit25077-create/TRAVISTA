import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already dismissed in this session or permanently
    const dismissed = localStorage.getItem('travista_pwa_dismissed');
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Add a slight delay before showing the popup for a more premium feel
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if the app is already installed
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for 7 days (or just use a simple flag)
    localStorage.setItem('travista_pwa_dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-8 md:right-8 md:left-auto z-[9999] md:w-[400px] md:p-0"
        >
          {/* Glassmorphism Container */}
          <div className="relative overflow-hidden group">
            {/* Top-right floating dismiss button */}
            <button 
              onClick={handleDismiss} 
              className="absolute top-2 right-2 z-20 p-1.5 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all border border-white/5"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>

            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="bg-slate-900/80 backdrop-blur-xl border-t md:border border-white/10 rounded-t-[32px] md:rounded-[24px] p-6 md:p-5 shadow-[0_-10px_50px_rgba(0,0,0,0.4),0_20px_50px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05),0_0_20px_rgba(16,185,129,0.05)] flex items-center gap-5">
              
              {/* App Icon / Logo */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Smartphone className="text-white" size={24} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base leading-tight tracking-tight">
                  Travista App
                </h3>
                <p className="text-slate-400 text-xs font-medium mt-1 line-clamp-1">
                  Install for a faster, premium experience.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0 pr-2">
                <button
                  onClick={handleInstall}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Install
                </button>
              </div>
            </div>

            {/* Subtle Top Indicator for Mobile Bottom Sheet */}
            <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/10 rounded-full" />
            
            {/* Bottom Glow Effect (Desktop Only) */}
            <div className="hidden md:block absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
