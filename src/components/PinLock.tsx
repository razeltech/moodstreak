import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Hash, X } from 'lucide-react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function PinLock({ onSuccess }: { onSuccess: () => void }) {
  const settings = useLiveQuery(() => db.settings.get(1));
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  React.useEffect(() => {
    if (pin.length === 4) {
      if (pin === settings?.pinHash) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin, settings, onSuccess]);

  if (!settings?.pinHash) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-cream z-[999] flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-xs flex flex-col items-center">
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 bg-white border border-[var(--border-color)] rounded-[30px] shadow-sm flex items-center justify-center mb-8"
        >
          {error ? <Lock size={32} className="text-red-400" /> : <Hash size={32} className="text-rose-dark" />}
        </motion.div>

        <h2 className="text-2xl font-playfair font-black italic mb-2 text-ink">Memory Vault</h2>
        <p className="text-sm font-bold text-ink-light uppercase tracking-widest mb-10 text-center">Enter PIN to Unlock</p>

        {/* Pin Dots */}
        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border border-[var(--border-color)] transition-all duration-300 ${
                pin.length > i ? 'bg-ink scale-110' : 'bg-transparent'
              }`} 
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-6 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-full py-4 text-2xl font-black rounded-2xl border border-[var(--border-color)] bg-white shadow-sm hover:bg-stone-50 active:translate-y-1 active:shadow-none transition-all text-ink"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-full py-4 text-2xl font-black rounded-2xl border border-[var(--border-color)] bg-white shadow-sm hover:bg-stone-50 active:translate-y-1 active:shadow-none transition-all text-ink"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-full py-4 flex items-center justify-center rounded-2xl border border-[var(--border-color)] bg-cream shadow-sm hover:bg-stone-100 active:translate-y-1 active:shadow-none transition-all text-ink"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
