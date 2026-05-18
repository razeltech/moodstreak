import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../db/db';
import { BookOpen, PenTool, ArrowRight, ArrowLeft, Book, Check, Hash, X, Lock } from 'lucide-react';

const PAGE_PRESETS = [
  { id: 'A4', name: 'A4 (Standard)', w: 794, h: 1123 },
  { id: 'A5', name: 'A5 (Compact)', w: 560, h: 794 },
  { id: 'Square', name: 'Square (Social)', w: 800, h: 800 },
  { id: 'Moleskine', name: 'Moleskine (Pro)', w: 504, h: 828 },
];

const PAGE_TYPES = [
  { id: 'ruled', name: 'Ruled' },
  { id: 'grid', name: 'Grid' },
  { id: 'dotted', name: 'Dotted' },
  { id: 'blank', name: 'Blank' },
];

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_PRESETS[0]);
  const [pageType, setPageType] = useState(PAGE_TYPES[0]);
  const [pin, setPin] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleBackspace = () => setPin(prev => prev.slice(0, -1));

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await db.settings.update(1, { 
      userName: name.trim(), 
      onboarded: true,
      pageSizeId: pageSize.id,
      paperStyle: pageType.id,
      pageWidth: pageSize.w,
      pageHeight: pageSize.h,
      pinHash: pin.length === 4 ? pin : undefined
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-cream z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="w-full max-w-md py-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-page-bg border-2 border-[#2C2C2C] shadow-[12px_12px_0px_var(--shadow-color)] rounded-[40px] p-8 sm:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8D17E] border-l-2 border-b-2 border-[#2C2C2C] rounded-bl-[40px] flex items-center justify-center rotate-3 translate-x-4 -translate-y-4">
                 <div className="relative">
                    <BookOpen size={32} className="text-[#2C2C2C]" />
                    <PenTool size={16} className="text-[#2C2C2C] absolute -bottom-1 -right-1 bg-[#E8D17E] rounded-full p-0.5 border border-[#2C2C2C]" />
                 </div>
              </div>

              <h1 className="text-4xl font-black italic tracking-tight text-[#3A352F] mb-2">Greeting</h1>
              <p className="text-[#7A7366] font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-10 opacity-70">Step 1 of 3: The Beginning</p>
              
              <div className="space-y-8">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-[#7A7366] mb-3">How shall we address you?</label>
                  <input
                    autoFocus
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-cream border-2 border-[#2C2C2C] rounded-2xl px-5 py-4 font-serif text-xl focus:outline-none focus:shadow-[6px_6px_0px_#2C2C2C] transition-all placeholder:text-[#A0998E]/40"
                  />
                </div>

                <button
                  onClick={() => name.trim() && setStep(2)}
                  disabled={!name.trim()}
                  className="w-full bg-[#2C2C2C] text-page-bg py-5 rounded-2xl font-sans font-black tracking-widest text-xs flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--shadow-color)] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  NEXT STEP <ArrowRight size={18} />
                </button>
              </div>

              <div className="mt-12 pt-8 border-t-2 border-[#D9D1C1]/30">
                <p className="text-[10px] font-sans text-[#A0998E] font-bold italic leading-relaxed">
                   "A journal is your second soul, printed on paper."
                </p>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-page-bg border-2 border-[#2C2C2C] shadow-[12px_12px_0px_var(--shadow-color)] rounded-[40px] p-8 sm:p-10 relative overflow-hidden"
            >
              <button 
                onClick={() => setStep(1)}
                className="absolute top-6 left-6 p-2 hover:bg-cream rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-[#A0998E]" />
              </button>

              <div className="flex flex-col items-center mt-6 mb-8">
                 <div className="w-16 h-16 bg-cream rounded-2xl border-2 border-[#2C2C2C] flex items-center justify-center text-[#2C2C2C] mb-4 shadow-[4px_4px_0px_var(--shadow-color)]">
                    <Book size={32} />
                 </div>
                 <h2 className="text-2xl font-black italic text-[#2C2C2C]">Design your Canvas</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7366] mt-1 opacity-60">Step 2 of 3: Paper Dimensions</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {PAGE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPageSize(p)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all relative ${
                      pageSize.id === p.id 
                        ? 'bg-[#E8D17E]/20 border-[#2C2C2C] shadow-[6px_6px_0px_#2C2C2C] -translate-y-1' 
                        : 'bg-white border-[#D9D1C1] hover:border-[#2C2C2C]'
                    }`}
                  >
                    {pageSize.id === p.id && (
                       <div className="absolute top-2 right-2 w-5 h-5 bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#E8D17E]">
                          <Check size={12} strokeWidth={4} />
                       </div>
                    )}
                    <div className="text-xs font-black text-[#2C2C2C]">{p.name}</div>
                    <div 
                      className="border border-[#2C2C2C] bg-cream rounded shadow-[2px_2px_0px_#2C2C2C]"
                      style={{ 
                        width: '40px', 
                        height: `${Math.min(60, (p.h / p.w) * 40)}px`,
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#7A7366] mb-3 ml-1">Page Style</label>
                <div className="flex gap-2">
                  {PAGE_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPageType(t)}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                        pageType.id === t.id 
                          ? 'bg-[#E8D17E] border-[#2C2C2C] shadow-[4px_4px_0px_#2C2C2C]' 
                          : 'bg-white border-[#D9D1C1] hover:border-[#2C2C2C]'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full bg-[#2C2C2C] text-page-bg py-5 rounded-2xl font-sans font-black tracking-widest text-xs flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--shadow-color)] transition-all"
              >
                NEXT STEP <ArrowRight size={18} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-page-bg border-2 border-[#2C2C2C] shadow-[12px_12px_0px_var(--shadow-color)] rounded-[40px] p-8 sm:p-10 relative overflow-hidden"
            >
              <button 
                onClick={() => setStep(2)}
                className="absolute top-6 left-6 p-2 hover:bg-cream rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-[#A0998E]" />
              </button>

              <div className="flex flex-col items-center mt-6 mb-4">
                 <div className="w-16 h-16 bg-cream rounded-2xl border-2 border-[#2C2C2C] flex items-center justify-center text-[#2C2C2C] mb-4 shadow-[4px_4px_0px_var(--shadow-color)]">
                    <Lock size={32} />
                 </div>
                 <h2 className="text-2xl font-black italic text-[#2C2C2C]">Set a PIN</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7366] mt-1 opacity-60">Step 3 of 3: Security (Optional)</p>
              </div>

              <div className="flex justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-full border-2 border-[#2C2C2C] transition-all ${pin.length > i ? 'bg-[#2C2C2C]' : 'bg-transparent'}`} />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
                  <button key={n} onClick={() => handleKeyPress(n)} className="py-3 text-lg font-black bg-white border-2 border-[#2C2C2C] rounded-xl hover:bg-cream active:translate-y-0.5 transition-all">{n}</button>
                ))}
                <div />
                <button onClick={() => handleKeyPress('0')} className="py-3 text-lg font-black bg-white border-2 border-[#2C2C2C] rounded-xl hover:bg-cream active:translate-y-0.5 transition-all text-[#2C2C2C]">0</button>
                <button onClick={handleBackspace} className="py-3 flex items-center justify-center bg-cream border-2 border-[#2C2C2C] rounded-xl hover:bg-ink/10 text-[#2C2C2C]"><X size={20} /></button>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-[#E8D17E] text-[#2C2C2C] py-5 rounded-2xl font-sans font-black tracking-widest text-xs border-2 border-[#2C2C2C] shadow-[6px_6px_0px_#2C2C2C] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#2C2C2C] active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                {pin.length === 4 ? 'LOCK & ENTER' : 'SKIP & ENTER'} <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="fixed bottom-8 left-0 right-0 flex flex-col items-center gap-1 opacity-40 pointer-events-none">
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7A7366]">Powered by</span>
         <span className="text-[14px] font-black tracking-tight text-[#2C2C2C]" style={{ fontFamily: '"Outfit", sans-serif' }}>RazelTech</span>
      </div>
    </div>
  );
}
