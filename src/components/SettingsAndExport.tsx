import { Settings, Download, Trash2, Book, AlertTriangle, Palette } from 'lucide-react';
import { useStore } from '../store/useStore';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { useState } from 'react';
import { ConfirmationDialog } from './ConfirmationDialog';
import { cn } from '../lib/utils';
import { DIARY_COVERS } from '../constants/covers';

export function SettingsAndExport() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const [isWipeDialogOpen, setIsWipeDialogOpen] = useState(false);

  const updateSetting = async (key: string, value: string | number | boolean) => {
    if (settings) {
      await db.settings.update(1, { [key]: value });
    }
  };

  const handleExportPDF = async () => {
    try {
      const entries = await db.entries.toArray();
      // Sort chronologically
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const doc = new jsPDF();
      let y = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = pageWidth - margin * 2;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(`${settings?.userName || 'My'} Journal`, margin, y);
      y += 15;

      for (const entry of entries) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        const titleText = entry.title || "Untitled Entry";
        const dateStr = format(new Date(entry.date + 'T00:00:00'), 'MMMM d, yyyy');
        
        doc.text(`${dateStr}`, margin, y);
        y += 8;
        
        doc.setFontSize(14);
        doc.text(`${titleText}`, margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Mood: ${entry.mood}`, margin, y);
        y += 8;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        const splitText = doc.splitTextToSize(entry.content || "No details.", textWidth);
        const textHeight = splitText.length * 6;
        
        // Handle page break in the middle of long text block
        if (y + textHeight > 280) {
            doc.addPage();
            y = 20;
            doc.text(splitText, margin, y);
            y += textHeight + 15;
        } else {
            doc.text(splitText, margin, y);
            y += textHeight + 15; // spacing between entries
        }
      }

      doc.save("journal.pdf");
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("There was an error generating your PDF.");
    }
  };

  const handleWipeData = async () => {
    await db.entries.clear();
    await db.tasks.clear();
    await db.settings.clear();
    await db.settings.add({
      id: 1,
      activeTheme: 'japanese-toon',
      activeFont: 'font-caveat',
      paperStyle: 'ruled',
      fontSize: 'text-lg',
      userName: '',
      onboarded: false,
      pageWidth: 800,
      pageHeight: 600,
    });
    window.location.reload();
  };

  return (
    <div className="h-full overflow-y-auto w-full px-4 custom-scrollbar">
      <div className="max-w-4xl mx-auto pt-8 pb-32">
        {/* Welcome Header */}
        <div className="flex flex-col mb-8 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-rose-dark animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ink-light opacity-60">
              Personalize your space
            </span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-ink">
            Hello, <span className="text-rose-dark underline decoration-4 decoration-rose-light/50">{settings?.userName || 'MoodStreaker'}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="md:col-span-8 flex flex-col gap-8">
            
            {/* Profile Section */}
            <section className="bg-[#FDFBF7] rounded-[32px] shadow-[8px_8px_0px_#D9D1C1] border-2 border-[#2C2C2C] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-light/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-ink/5">
                  <div className="p-2 bg-rose-light/30 rounded-xl text-rose-dark">
                    <Book size={20} />
                  </div>
                  <h3 className="text-xl font-playfair font-black text-ink italic">User Profile</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white/50 border border-ink/10 rounded-2xl p-4 transition-all focus-within:border-rose-dark focus-within:ring-1 focus-within:ring-rose-dark">
                    <label className="block text-[10px] font-black text-ink-light uppercase mb-1 tracking-widest">Display Name</label>
                    <input
                      type="text"
                      value={settings?.userName || ''}
                      onChange={(e) => updateSetting('userName', e.target.value)}
                      className="w-full bg-transparent font-serif text-2xl text-ink focus:outline-none placeholder:text-ink/10"
                      placeholder="How should I call you?"
                    />
                  </div>
                  
                  <div className="bg-white/50 border border-ink/10 rounded-2xl p-4">
                    <div className="flex flex-col gap-1 mb-3">
                      <label className="block text-[10px] font-black text-ink-light uppercase tracking-widest leading-none">Daily Word Goal</label>
                      <p className="text-[10px] text-ink-light/60 font-medium">Serious writers track their progress</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <input 
                         type="range"
                         min="100"
                         max="5000"
                         step="100"
                         value={settings?.dailyWordGoal || 1000}
                         onChange={(e) => updateSetting('dailyWordGoal', parseInt(e.target.value))}
                         className="flex-1 accent-[var(--accent-color)]"
                       />
                       <div className="bg-white px-3 py-1.5 rounded-xl border border-ink/10 font-bold text-sm min-w-[100px] text-center">
                          {settings?.dailyWordGoal || 1000} words
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 border border-ink/10 rounded-2xl p-4">
                    <div className="flex flex-col gap-1 mb-3">
                      <label className="block text-[10px] font-black text-ink-light uppercase tracking-widest leading-none">Personal Accent Color</label>
                      <p className="text-[10px] text-ink-light/60 font-medium">Changes highlights, washi tapes, and active states</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        '#E8D17E', // Yellow
                        '#7EB6E8', // Blue
                        '#FCA3CC', // Pink
                        '#95D5B2', // Green
                        '#E87E7E', // Red
                        '#7A7366', // Slate
                        '#A78BFA', // Purple
                      ].map(color => (
                        <button
                          key={color}
                          onClick={() => updateSetting('accentColor', color)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 border-[#2C2C2C] transition-all shadow-sm relative flex items-center justify-center",
                            settings?.accentColor === color ? "scale-110 -translate-y-1 shadow-md" : "hover:scale-105 opacity-80 hover:opacity-100"
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {settings?.accentColor === color && (
                            <div className="absolute inset-0 rounded-full border-4 border-white/30" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/50 border border-ink/10 rounded-2xl p-4">
                    <div className="flex flex-col gap-1 mb-3">
                      <label className="block text-[10px] font-black text-ink-light uppercase tracking-widest leading-none">Currency</label>
                      <p className="text-[10px] text-ink-light/60 font-medium">For Finance & Bill tracking</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Rupee (₹)', value: '₹' },
                        { label: 'Dollar ($)', value: '$' },
                        { label: 'Euro (€)', value: '€' },
                        { label: 'Pound (£)', value: '£' },
                        { label: 'Yen (¥)', value: '¥' },
                      ].map(curr => (
                        <button
                          key={curr.value}
                          onClick={() => updateSetting('currency', curr.value)}
                          className={cn(
                            "px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all",
                            (settings?.currency || '₹') === curr.value 
                              ? "text-white border-ink shadow-[2px_2px_0px_#2C2C2C]" 
                              : "bg-white border-ink/10 text-ink-light hover:border-ink/30"
                          )}
                          style={{ backgroundColor: (settings?.currency || '₹') === curr.value ? 'var(--accent-color)' : undefined }}
                        >
                          {curr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Typography & Design */}
            <section className="bg-[#FDFBF7] rounded-[32px] shadow-[8px_8px_0px_#D9D1C1] border-2 border-[#2C2C2C] p-8 relative">
               {/* Decorative Tape */}
              <div className="absolute -top-4 -left-4 w-20 h-6 bg-[#E8D17E]/40 border border-ink/10 rotate-6 mix-blend-multiply" />
              
              <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-ink/5">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-700">
                  <Palette size={20} />
                </div>
                <h3 className="text-xl font-playfair font-black text-ink italic">Design & Vibe</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-4">Interface Theme</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'rose', name: 'Rose', icon: '🌸', color: 'bg-[#FFF5F5]' },
                      { id: 'lavender', name: 'Lilac', icon: '💜', color: 'bg-[#F5F3FF]' },
                      { id: 'sage', name: 'Sage', icon: '🌿', color: 'bg-[#F0FDF4]' },
                      { id: 'midnight', name: 'Inky', icon: '🌙', color: 'bg-[#111216]' },
                    ].map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => updateSetting('uiTheme', theme.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                          settings?.uiTheme === theme.id 
                            ? "border-rose-dark bg-white shadow-lg scale-105 -translate-y-1" 
                            : "border-transparent bg-ink/5 hover:bg-ink/10 text-ink/60"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner", theme.color)}>
                          {theme.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-tighter">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <h4 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-4">Global Typography</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       { name: 'Default Serif', value: '"Playfair Display", serif' },
                       { name: 'Clean Sans', value: '"Inter", sans-serif' },
                       { name: 'Handwritten', value: '"Caveat", cursive' },
                       { name: 'Playful', value: '"Poppins", sans-serif' },
                       { name: 'Classic Typewriter', value: '"JetBrains Mono", monospace' },
                       { name: 'Japanese Ink', value: '"Noto Sans JP", sans-serif' },
                     ].map(font => (
                       <button
                         key={font.value}
                         onClick={() => updateSetting('activeFont', font.value)}
                         className={cn(
                           "p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between group",
                           settings?.activeFont === font.value 
                             ? "border-ink bg-white shadow-md -translate-x-1" 
                             : "border-transparent bg-ink/5 hover:bg-ink/10"
                         )}
                         style={{ fontFamily: font.value }}
                       >
                         <span className="text-sm font-bold">{font.name}</span>
                         <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                   <h4 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-4">Default Paper Style</h4>
                   <div className="grid grid-cols-2 gap-4">
                     {[
                       { id: 'ruled', name: 'Ruled Lines', icon: '≡' },
                       { id: 'grid', name: 'Quadrille Grid', icon: '田' },
                       { id: 'dotted', name: 'Bullet Dots', icon: '∵' },
                       { id: 'plain', name: 'Blank Canvas', icon: '□' },
                     ].map(style => (
                       <button
                         key={style.id}
                         onClick={() => updateSetting('paperStyle', style.id)}
                         className={cn(
                           "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                           settings?.paperStyle === style.id 
                             ? "border-ink bg-white shadow-md" 
                             : "border-ink/5 bg-ink/5 hover:bg-ink/10"
                         )}
                       >
                         <div className="w-10 h-10 bg-white border border-ink/10 rounded-lg flex items-center justify-center text-xl font-serif text-ink/40">
                           {style.icon}
                         </div>
                         <div>
                           <div className="text-sm font-bold text-ink">{style.name}</div>
                           <div className="text-[10px] text-ink-light opacity-60">Classic Stationery</div>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="md:col-span-4 flex flex-col gap-8">
            
            {/* Security Section */}
            <section className="bg-[#FDFBF7] rounded-[32px] shadow-[8px_8px_0px_#D9D1C1] border-2 border-[#2C2C2C] p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-ink/5 rounded-full -mr-12 -mt-12" />
               <h3 className="text-lg font-playfair font-black text-ink italic mb-6">Security</h3>
               
               <div className="space-y-4">
                 <div className="bg-white/50 rounded-2xl p-4 border border-ink/5">
                   <h4 className="text-[10px] font-black text-ink-light uppercase mb-2">Vault Lock PIN</h4>
                   {settings?.pinHash ? (
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-green-600">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                         <span className="text-xs font-black">Active</span>
                       </div>
                       <button 
                         onClick={() => updateSetting('pinHash', '')}
                         className="p-1.5 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                         title="Remove Lock"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   ) : (
                     <div className="flex gap-2">
                       {[1, 2, 3, 4].map(i => (
                         <input
                           key={i}
                           id={`pin-${i}`}
                           type="password"
                           maxLength={1}
                           className="w-full h-10 bg-white border-2 border-ink/20 rounded-lg text-center text-xl font-black focus:border-ink focus:outline-none transition-all"
                           onChange={(e) => {
                             const val = e.target.value;
                             if (val && i < 4) document.getElementById(`pin-${i + 1}`)?.focus();
                             if (i === 4) {
                               const inputs = [1, 2, 3, 4].map(idx => (document.getElementById(`pin-${idx}`) as HTMLInputElement)?.value || '');
                               if (inputs.join('').length === 4) updateSetting('pinHash', inputs.join(''));
                             }
                           }}
                         />
                       ))}
                     </div>
                   )}
                 </div>
               </div>
            </section>

            {/* Export & Actions */}
            <section className="bg-[#FDFBF7] rounded-[32px] shadow-[8px_8px_0px_#D9D1C1] border-2 border-[#2C2C2C] p-6 relative">
              <h3 className="text-lg font-playfair font-black text-ink italic mb-6">Utilities</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={handleExportPDF}
                  className="w-full flex items-center justify-between p-4 bg-ink text-white rounded-2xl hover:bg-ink-light transition-all shadow-md group"
                >
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-widest">Backup PDF</div>
                    <div className="text-[10px] opacity-60">Export all entries</div>
                  </div>
                  <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                </button>

                <button 
                  onClick={() => setIsWipeDialogOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-white border-2 border-red-200 text-red-600 rounded-2xl hover:bg-red-50 transition-all group"
                >
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-widest">Reset App</div>
                    <div className="text-[10px] opacity-60">Clear all data</div>
                  </div>
                  <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </section>

          </div>
        </div>
        
        {/* Branding Footer */}
        <div className="mt-16 pt-8 border-t border-ink/10 flex flex-col items-center gap-2 pb-12">
           <div className="flex items-center gap-2 opacity-30">
              <div className="w-8 h-px bg-ink" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-ink">Original Series</span>
              <div className="w-8 h-px bg-ink" />
           </div>
           <a 
             href="https://razeltech.github.io/razeltech/" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex flex-col items-center group transition-all"
           >
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-light opacity-40 group-hover:opacity-100 transition-opacity">Designed & Developed by</span>
              <span className="text-xl font-black tracking-tighter text-ink opacity-60 group-hover:text-rose-dark group-hover:opacity-100 transition-all" style={{ fontFamily: '"Outfit", sans-serif' }}>RazelTech</span>
           </a>
        </div>
      </div>
       
       <ConfirmationDialog 
         isOpen={isWipeDialogOpen}
         onCancel={() => setIsWipeDialogOpen(false)}
         onConfirm={handleWipeData}
         title="Wipe All Data"
         message="Are you absolutely sure? This will delete all your entries, drawings, and planner tasks. This action cannot be undone."
       />
    </div>
  );
}
