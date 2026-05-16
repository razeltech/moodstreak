import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-[#2C2C2C]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] border border-[var(--border-color)] shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={variant === 'danger' ? "p-3 bg-red-50 text-red-400 rounded-2xl" : "p-3 bg-amber-50 text-amber-400 rounded-2xl"}>
                   <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-playfair font-black italic text-ink tracking-tight">{title}</h3>
              </div>
              
              <p className="text-ink-light font-bold leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={onCancel}
                  className="py-3 px-4 bg-cream hover:bg-stone-50 text-ink font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-[var(--border-color)] shadow-sm active:translate-y-[1px] transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={variant === 'danger' 
                    ? "py-3 px-4 bg-red-400 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-red-500 shadow-sm active:translate-y-[1px] transition-all"
                    : "py-3 px-4 bg-rose-light hover:bg-rose-dark text-ink font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-[var(--border-color)] shadow-sm active:translate-y-[1px] transition-all"
                  }
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
