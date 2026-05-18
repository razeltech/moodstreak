import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 2. Check if user dismissed it recently (don't annoy them)
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 3 * 86400000) return; // 3 days for MoodStreak

    // 3. Handle iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !(window as any).MSStream;
    if (ios) { 
      setIsIOS(true); 
      setShow(true); 
      return; 
    }

    // 4. Handle Android/Chrome/PC
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50"
      >
        <div className="bg-page-bg border-2 border-ink rounded-[32px] shadow-[8px_8px_0px_var(--shadow-color)] p-6 flex flex-col gap-4 relative overflow-hidden group">
          {/* Decorative Sparkle */}
          <div className="absolute -top-2 -right-2 text-rose-dark opacity-20 group-hover:rotate-12 transition-transform">
            <Sparkles size={40} />
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-light/20 flex items-center justify-center flex-shrink-0 text-rose-dark border border-rose-dark/10">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-playfair font-black italic text-lg text-ink leading-tight">MoodStreak App</h4>
              {isIOS ? (
                <p className="text-[10px] font-bold text-ink-light leading-relaxed mt-1">
                  Tap <span className="text-ink">Share</span> then <br />
                  <span className="text-rose-dark">"Add to Home Screen"</span>
                </p>
              ) : (
                <p className="text-[10px] font-bold text-ink-light leading-relaxed mt-1">
                  Install for offline journaling <br />
                  & instant mood logging.
                </p>
              )}
            </div>
            <button onClick={dismiss} className="text-ink-light hover:text-ink transition-colors">
              <X size={18} />
            </button>
          </div>

          {!isIOS && (
            <button 
              onClick={install} 
              className="w-full bg-ink text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
            >
              <Download size={14} /> Install Now
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
