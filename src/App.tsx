import React, { useEffect } from 'react';
import { BookOpen, Calendar, Grid, Settings2, Download, ChevronLeft, ChevronRight, ListTodo, BarChart3, Flame } from 'lucide-react';
import { useStore } from './store/useStore';
import { addDays, subDays, format, differenceInDays, parseISO } from 'date-fns';
import { MyDiaryPage } from './components/MyDiaryPage';
import { MoodGrid } from './components/MoodGrid';
import { PlannerPage } from './components/PlannerPage';
import { SettingsAndExport } from './components/SettingsAndExport';
import { motion, AnimatePresence } from 'motion/react';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DashboardPage } from './components/DashboardPage';
import { PinLock } from './components/PinLock';
import { cn } from './lib/utils';
import { TrackersPage } from './components/TrackersPage';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const { activeTab, setActiveTab, currentDate, setCurrentDate, isFocusMode } = useStore();
  const settings = useLiveQuery(() => db.settings.get(1));
  const [isLocked, setIsLocked] = React.useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

  // Streak Calculation
  const entries = useLiveQuery(() => db.entries.toArray());
  const streak = React.useMemo(() => {
    if (!entries || entries.length === 0) return 0;
    const dates = entries
      .map(e => e.date)
      .sort((a, b) => b.localeCompare(a)); // Descending order
    
    let currentStreak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // If the latest entry isn't today or yesterday, streak is 0
    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let checkDate = parseISO(dates[0]);
    for (let i = 0; i < dates.length; i++) {
        const d = parseISO(dates[i]);
        if (i === 0) {
            currentStreak = 1;
        } else {
            const prevD = parseISO(dates[i-1]);
            const diff = differenceInDays(prevD, d);
            if (diff === 1) {
                currentStreak++;
            } else if (diff > 1) {
                break;
            }
        }
    }
    return currentStreak;
  }, [entries]);
  
  useEffect(() => {
    if (settings?.uiTheme) {
      document.body.className = `theme-${settings.uiTheme}`;
    }
    if (settings?.activeFont) {
        document.documentElement.style.setProperty('--global-font', settings.activeFont);
    }
    if (settings?.accentColor) {
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    } else {
        document.documentElement.style.setProperty('--accent-color', 'var(--rose-dark)');
    }
  }, [settings?.uiTheme, settings?.activeFont, settings?.accentColor]);

  if (settings && !settings.onboarded) {
    return <WelcomeScreen onComplete={() => window.location.reload()} />;
  }

  return (
    <>
      <AnimatePresence>
        {settings?.pinHash && isLocked && (
          <PinLock key="pinlock" onSuccess={() => setIsLocked(false)} />
        )}
      </AnimatePresence>

      <div className={cn(
        "min-h-[100dvh] overflow-hidden relative flex items-center justify-center p-0 sm:p-8 transition-colors duration-500 bg-cream text-ink",
        settings?.uiTheme ? `theme-${settings.uiTheme}` : 'theme-rose'
    )} style={{ fontFamily: settings?.activeFont || '"Playfair Display", serif' }}>
      {/* Background Texture Overlays */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--ink) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Main Container */}
      <div className={cn(
          "relative w-full h-[100dvh] transition-all duration-500 z-10 overflow-hidden sm:rounded-3xl bg-warm-white bg-opacity-95",
          isFocusMode ? "sm:max-w-[100vw] sm:h-[100vh] border-none rounded-none shadow-none" : "sm:max-w-6xl sm:h-[85vh] sm:min-h-[600px] flex flex-row sm:shadow-[0_0_60px_rgba(180,120,150,0.15)] sm:border border-[var(--border-color)]"
      )}>
        
        {/* Left Sidebar (Icon Navigation) */}
        {!isFocusMode && (
          <aside className={cn(
              "w-20 sm:w-24 flex flex-col items-center py-8 gap-8 flex-shrink-0 z-[100] hidden sm:flex transition-all duration-500 bg-white border-r border-[var(--border-color)]"
          )}>
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm border border-transparent overflow-hidden mb-4"
            style={{ background: 'linear-gradient(135deg, var(--rose-dark), var(--lavender-dark))' }}
          >
            <span className="text-2xl font-bold font-playfair">{settings?.userName?.[0]?.toUpperCase() || 'M'}</span>
          </div>
          <div className="flex flex-col gap-5 w-full items-center">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'today', icon: Grid, label: 'Today' },
              { id: 'mood-grid', icon: Calendar, label: 'Calendar' },
              { id: 'vault', icon: ShieldCheck, label: 'Life Vault' },
              { id: 'planner', icon: ListTodo, label: 'Planner' },
              { id: 'settings', icon: Settings2, label: 'Settings' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (tab.id === 'today') setCurrentDate(new Date());
                    }}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all relative
                      ${isActive ? 'bg-white shadow-sm border border-[var(--border-color)]' : 'bg-transparent text-ink-light hover:bg-rose-light/50 hover:text-ink'}
                    `}
                    aria-label={tab.label}
                  >
                    <tab.icon size={22} className={cn("opacity-90", isActive && "text-[var(--accent-color)]")} />
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 rounded-2xl border-2 border-[var(--accent-color)] pointer-events-none"
                        initial={false}
                      />
                    )}
                  </button>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-ink text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[200]">
                    {tab.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-ink" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pb-8 flex flex-col items-center gap-4">
             <div className="w-8 h-px bg-[var(--border-color)] opacity-50" />
             <a 
               href="https://razeltech.github.io/razeltech/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex flex-col items-center gap-1 group transition-all"
             >
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-light opacity-40 group-hover:opacity-100 transition-opacity">Powered by</span>
                <span className="text-[11px] font-black tracking-tight text-ink opacity-60 group-hover:text-[var(--accent-color)] group-hover:opacity-100 transition-all" style={{ fontFamily: '"Outfit", sans-serif' }}>RazelTech</span>
             </a>
          </div>
        </aside>
        )}

        {/* Content Area */}
        <div className={cn(
            "flex-1 md:p-4 h-full relative transition-colors duration-500 bg-cream flex flex-col"
        )}>
          {/* Common Global Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)] bg-white/30 backdrop-blur-sm sm:hidden">
            <h1 className="font-bold text-xl drop-shadow-sm leading-none text-ink" style={{ fontFamily: '"Outfit", sans-serif' }}>MoodStreak</h1>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--rose-dark), var(--lavender-dark))' }}
            >
              <span className="text-sm font-bold font-playfair">{settings?.userName?.[0]?.toUpperCase() || 'M'}</span>
            </div>
          </header>

          <header className="hidden sm:flex px-8 py-4 items-center justify-between border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
               <h1 className="font-black text-2xl tracking-tighter text-ink" style={{ fontFamily: '"Outfit", sans-serif' }}>MoodStreak</h1>
               <div className="h-4 w-px bg-stone-300 mx-2" />
               <span className="text-xs font-bold uppercase tracking-widest text-ink-light opacity-60">
                 {activeTab === 'today' && 'Journal'}
                 {activeTab === 'dashboard' && 'Insights'}
                 {activeTab === 'planner' && 'Planner'}
                 {activeTab === 'mood-grid' && 'Calendar'}
                 {activeTab === 'vault' && 'Life Vault'}
                 {activeTab === 'settings' && 'Settings'}
               </span>
            </div>
            
            {activeTab !== 'today' && (
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-sm">
                    <Flame size={14} className="text-[var(--accent-color)]" />
                    <span className="text-xs font-black text-ink">{streak} day streak</span>
                 </div>
              </div>
            )}
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + currentDate.toISOString()}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full flex-1 flex flex-col overflow-hidden"
            >
              {activeTab === 'today' && <MyDiaryPage />}
              {activeTab === 'dashboard' && <DashboardPage />}
              {activeTab === 'planner' && <PlannerPage />}
              {activeTab === 'mood-grid' && <MoodGrid />}
              {activeTab === 'vault' && <TrackersPage />}
              {activeTab === 'settings' && <SettingsAndExport />}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className={cn(
            "hidden xl:flex border-l flex-col overflow-y-auto z-10 transition-all duration-500 ease-in-out bg-white border-[var(--border-color)]",
            isRightPanelOpen ? "w-80 p-8 opacity-100" : "w-0 p-0 opacity-0 border-transparent overflow-hidden"
        )}>
           <section className="mb-10">
              <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] text-ink-light mb-4">Recent Pages</h3>
              <div className="space-y-3">
                 {[1, 2, 3].map(i => {
                    const date = subDays(new Date(), i);
                    return (
                      <div key={i} className="bg-cream hover:bg-rose-light p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-rose-dark shrink-0" />
                         <div className="flex-1 overflow-hidden">
                            <div className="text-[13px] font-medium text-ink truncate font-sans">Scrapbook entry</div>
                            <div className="text-[11px] text-ink-light">{format(date, 'MMM do')}</div>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </section>

           <section className="mt-auto">
              <div className="border border-[var(--border-color)] bg-cream rounded-2xl p-6 text-center">
                 <p className="text-[12px] font-playfair text-ink-light italic leading-relaxed">
                   "Journaling is like whispering to oneself and listening at the same time."
                 </p>
              </div>
           </section>
        </aside>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full border border-[var(--border-color)] shadow-lg flex items-center gap-6 z-50 sm:hidden">
         <button onClick={handlePrevDay} className="text-ink-light hover:text-ink transition-colors"><ChevronLeft size={24} /></button>
         <div className="w-px h-6 bg-[var(--border-color)]" />
         <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-[var(--accent-color)] scale-110 drop-shadow-sm' : 'text-ink-light'}><BarChart3 size={24}/></button>
         <button onClick={() => setActiveTab('today')} className={activeTab === 'today' ? 'text-[var(--accent-color)] scale-110 drop-shadow-sm' : 'text-ink-light'}><Grid size={24}/></button>
         <button onClick={() => setActiveTab('vault')} className={activeTab === 'vault' ? 'text-[var(--accent-color)] scale-110 drop-shadow-sm' : 'text-ink-light'}><ShieldCheck size={24}/></button>
         <button onClick={() => setActiveTab('planner')} className={activeTab === 'planner' ? 'text-[var(--accent-color)] scale-110 drop-shadow-sm' : 'text-ink-light'}><ListTodo size={24}/></button>
         <button onClick={() => setActiveTab('mood-grid')} className={activeTab === 'mood-grid' ? 'text-[var(--accent-color)] scale-110 drop-shadow-sm' : 'text-ink-light'}><Calendar size={24}/></button>
         <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-[var(--accent-color)] scale-110 drop-shadow-sm' : 'text-ink-light'}><Settings2 size={24}/></button>
         <div className="w-px h-6 bg-[var(--border-color)]" />
         <button onClick={handleNextDay} className="text-ink-light hover:text-ink transition-colors"><ChevronRight size={24} /></button>
      </div>

    </div>
    </>
  );
}
