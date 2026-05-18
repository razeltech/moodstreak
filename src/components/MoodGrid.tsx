import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { MOODS, useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScribbleMood } from './ScribbleMood';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Flame, BarChart3, ChevronLeft, ChevronRight, X } from 'lucide-react';

export function MoodGrid() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const { setActiveTab, setCurrentDate, currentDate } = useStore();
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  
  // Sync viewDate when currentDate changes significantly (like different month)
  React.useEffect(() => {
    if (!isSameMonth(viewDate, currentDate)) {
      setViewDate(new Date(currentDate));
    }
  }, [currentDate]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const daysInGrid = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const entries = useLiveQuery(() => 
    db.entries
      .where('date')
      .between(format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd') + '\uffff')
      .toArray()
  , [viewDate]);

  const moodMap = new Map<string, Array<{ mood: string, moodColor: string, timestamp: number }>>(entries?.map(e => [e.date, e.moods || []]));
  const entryMap = new Map(entries?.map(e => [e.date, e]));
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [activePicker, setActivePicker] = useState<{date: string, x: number, y: number} | null>(null);

  const handleCellClick = (e: React.MouseEvent, date: Date, dateStr: string) => {
    // Prevent bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Switch month if needed
    if (!isSameMonth(date, viewDate)) {
      setViewDate(date);
    }
    
    setActivePicker({
      date: dateStr,
      x: e.clientX,
      y: e.clientY
    });
  };

  const setMoodForDate = async (mood: typeof MOODS[0]) => {
    if (!activePicker) return;
    
    const existing = await db.entries.get(activePicker.date);
    const updatedMoods = [
      ...(existing?.moods || []),
      { mood: mood.emoji, moodColor: mood.color, timestamp: Date.now() }
    ];

    const entryData = {
      id: existing?.id || activePicker.date,
      date: activePicker.date,
      title: existing?.title || '',
      content: existing?.content || '',
      mood: updatedMoods[updatedMoods.length - 1].mood, // Keep backward compat
      moodColor: updatedMoods[updatedMoods.length - 1].moodColor, // Keep backward compat
      moods: updatedMoods,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.entries.put(entryData);
  };

  const navigateToJournal = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, d));
    setActiveTab('today');
  };

  // Calculate Statistics
  const calculateStats = () => {
    if (!entries || entries.length === 0) return null;

    const breakdown = entries.reduce((acc, entry) => {
      const mood = MOODS.find(m => m.color === entry.moodColor)?.label || 'Unknown';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(breakdown).map(([name, value]) => ({
      name,
      value,
      fill: MOODS.find(m => m.label === name)?.color || '#ccc'
    }));

    const mostFrequent = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];

    const sortedDates = [...entries]
      .filter(e => e.date)
      .map(e => e.date)
      .sort();
      
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;
    
    for (const dStr of sortedDates) {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!lastDate) {
          currentStreak = 1;
        } else {
          const diffDays = Math.round((d.valueOf() - lastDate.valueOf()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else if (diffDays > 1) {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }
        lastDate = d;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    return { pieData, mostFrequent, maxStreak };
  };

  const stats = calculateStats();

  return (
    <div className="h-full flex flex-col pt-4 pb-20 px-4 relative overflow-y-auto">
      <div className="max-w-7xl w-full mx-auto pt-4 relative flex flex-col">
        <div className="relative z-10 bg-page-bg rounded-[32px] shadow-[8px_8px_0px_var(--shadow-color)] border-2 border-[#2C2C2C] p-6 sm:p-10">
          <div className="flex flex-col mb-8 pb-4 border-b-2 border-[#2C2C2C]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-light opacity-60">
                Emotional Heatmap
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
              <h1 className="text-3xl sm:text-4xl font-playfair font-black tracking-tight italic text-ink">
                Hello, <span className="text-rose-dark underline decoration-2 decoration-rose-light">{settings?.userName || 'Traveler'}</span>
              </h1>
              {/* Decorative Tape */}
              <div className="absolute -top-12 -right-4 w-20 h-6 bg-[#7EB6E8]/40 border border-[#2C2C2C]/10 rotate-12 mix-blend-multiply" />

              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => setViewDate(d => subMonths(d, 1))} 
                  className="p-3 hover:bg-cream rounded-full border-2 border-[#2C2C2C] shadow-sm bg-white active:translate-y-1 active:shadow-none transition-all text-ink-light hover:text-ink"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-2xl font-bold font-playfair italic text-ink min-w-[180px] text-center">
                  {format(viewDate, 'MMMM yyyy')}
                </span>
                <button 
                  onClick={() => setViewDate(d => addMonths(d, 1))} 
                  className="p-3 hover:bg-cream rounded-full border-2 border-[#2C2C2C] shadow-sm bg-white active:translate-y-1 active:shadow-none transition-all text-ink-light hover:text-ink"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white p-4 sm:p-8 rounded-[32px] shadow-sm border border-[var(--border-color)] aspect-square lg:aspect-auto">
          <div className="h-full flex flex-col">
            {/* Header Row: Weekdays */}
            <div className="grid grid-cols-7 mb-4">
              {weekDays.map((day, i) => (
                <div key={i} className="text-center font-sans text-[10px] font-bold uppercase tracking-widest text-ink-light">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 border-t border-l border-[var(--border-color)]">
              {daysInGrid.map((date, i) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(date, viewDate);
                const isToday = isSameDay(date, new Date());
                const moodEntries = moodMap.get(dateStr) || [];
                
                return (
                  <div 
                    key={i} 
                    onClick={(e) => handleCellClick(e, date, dateStr)}
                    className={cn(
                      "relative min-h-[80px] border-r border-b border-[var(--border-color)] p-2 transition-all group",
                      isCurrentMonth ? "cursor-pointer" : "bg-stone-50/10 opacity-40",
                      isToday && isCurrentMonth && moodEntries.length === 0 && "bg-rose-light/20",
                      isCurrentMonth && moodEntries.length === 0 && "hover:bg-cream"
                    )}
                    style={isCurrentMonth && moodEntries.length > 0 ? { 
                      backgroundColor: `${moodEntries[moodEntries.length - 1].moodColor}15`,
                    } : {}}
                  >
                    <span className={cn(
                      "text-sm font-black font-sans relative z-10",
                      isCurrentMonth ? "text-ink" : "text-ink-light",
                      isToday && "text-rose-dark"
                    )}>
                      {format(date, 'd')}
                    </span>
                    
                    {isCurrentMonth && moodEntries.length > 0 && (
                      <div className="absolute inset-0 p-1.5 flex flex-wrap gap-0.5 pointer-events-none items-center justify-center pt-5 overflow-hidden">
                         {moodEntries.slice(-4).map((m, idx) => (
                           <ScribbleMood key={idx} color={m.moodColor} size={moodEntries.length > 2 ? 20 : 28} className="opacity-90 mix-blend-multiply drop-shadow-sm transition-all" />
                         ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[var(--border-color)] flex-1 relative overflow-hidden">
             <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed border-[var(--border-color)] pb-3">
               <BarChart3 size={24} className="text-rose-dark" />
               <h3 className="font-playfair font-black text-2xl italic tracking-tight text-ink">Month in Review</h3>
             </div>
             
             {stats ? (
               <div className="space-y-6">
                 {/* Longest Streak */}
                 <div className="bg-cream/50 p-5 rounded-2xl border-2 border-[var(--border-color)] flex flex-col gap-3 relative transition-transform">
                    <div className="absolute top-2 right-2 p-3 opacity-10 pointer-events-none">
                       <Flame size={48} className="text-rose-dark" />
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-ink-light relative z-10">Longest Streak</div>
                    <div className="text-5xl font-playfair font-black text-ink flex items-baseline gap-2 relative z-10">
                       {stats.maxStreak} <span className="text-sm text-ink-light font-sans font-bold uppercase tracking-wider">days</span>
                    </div>
                 </div>

                 {/* Top Mood */}
                 {stats.mostFrequent && (
                   <div className="bg-cream/50 p-5 rounded-2xl border-2 border-[var(--border-color)] flex flex-col gap-3 relative transition-transform">
                      <div className="absolute top-4 right-4 pointer-events-none opacity-40">
                         <ScribbleMood color={MOODS.find(m => m.label === stats.mostFrequent[0])?.color || '#eee'} size={48} />
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-ink-light relative z-10">Dominant Mood</div>
                      <div className="text-3xl font-playfair font-black text-ink capitalize relative z-10">{stats.mostFrequent[0]}</div>
                      <div className="text-xs text-ink-light font-bold font-sans relative z-10">{stats.mostFrequent[1]} days recorded</div>
                   </div>
                 )}

                 {/* Pie Chart */}
                 <div className="pt-4 h-[240px] w-full bg-cream/30 rounded-2xl border-2 border-[var(--border-color)] p-4 flex flex-col items-center justify-center">
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-ink-light text-center mb-0 w-full shrink-0">Mood Breakdown</h4>
                   <div className="flex-1 w-full min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={stats.pieData}
                           innerRadius={45}
                           outerRadius={70}
                           paddingAngle={4}
                           dataKey="value"
                           stroke="var(--cream)"
                           strokeWidth={3}
                         >
                           {stats.pieData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                         </Pie>
                         <Tooltip 
                           contentStyle={{ borderRadius: '16px', border: '2px solid var(--border-color)', boxShadow: '0 8px 16px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                           itemStyle={{ color: 'var(--ink)' }}
                         />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-center py-12 text-ink-light font-playfair italic">
                 No moods recorded <br/>this month yet.
               </div>
             )}
           </div>

           {/* Legend with Scribble Style */}
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[var(--border-color)]">
             <h3 className="font-bold font-playfair text-lg italic tracking-tight mb-4 text-center text-ink">Legend</h3>
             <div className="flex flex-wrap gap-2 justify-center">
               {MOODS.map(mood => (
                 <div key={mood.label} className="flex items-center gap-2 px-2 py-1.5 bg-cream rounded-lg border border-[var(--border-color)] w-full sm:w-auto overflow-hidden">
                   <div className="w-4 h-4 shrink-0 relative">
                     <ScribbleMood color={mood.color} size={16} className="w-full h-full" />
                   </div>
                   <span className="text-[9px] font-bold font-sans uppercase tracking-widest text-ink block truncate">{mood.label}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
  <AnimatePresence>
        {activePicker && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/5"
              onClick={() => setActivePicker(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed z-[101] bg-white border border-[var(--border-color)] shadow-sm rounded-2xl p-4 flex flex-col gap-4 w-[280px]"
              style={{ 
                left: Math.max(10, Math.min(activePicker.x - 140, window.innerWidth - 290)), 
                top: Math.max(10, Math.min(activePicker.y - 120, window.innerHeight - 300)) 
              }}
            >
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                 <span className="font-bold text-ink">{format(new Date(activePicker.date + 'T00:00:00'), 'MMM d, yyyy')}</span>
                 <button onClick={() => setActivePicker(null)} className="p-1 hover:bg-stone-100 rounded-full text-ink-light">
                   <X size={16} />
                 </button>
              </div>
              
              {/* Preview Section */}
              <div className="text-sm text-ink-light px-1 line-clamp-3 italic bg-stone-50 p-2 rounded-lg border border-[var(--border-color)]">
                 {entryMap.get(activePicker.date)?.content || "No journal text written for this day..."}
              </div>
              
              {/* Quick Mood Selection */}
              <div className="flex flex-wrap gap-2 justify-center py-2">
                {MOODS.map(m => {
                  const isActive = (moodMap.get(activePicker.date) || []).some(item => item.moodColor === m.color);
                  return (
                  <button
                    key={m.label}
                    onClick={() => setMoodForDate(m)}
                    className={cn("relative w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform", isActive ? "scale-110" : "")}
                    title={m.label}
                  >
                    <ScribbleMood color={m.color} size={40} className={cn("absolute inset-0 opacity-80", isActive ? "opacity-100 drop-shadow-md" : "")} />
                    <span className="text-lg relative z-10">{m.emoji}</span>
                  </button>
                )})}
              </div>

              <button 
                 onClick={() => navigateToJournal(activePicker.date)}
                 className="w-full flex items-center justify-center gap-2 bg-ink text-white py-2 rounded-lg font-bold hover:bg-ink-light transition-colors"
              >
                  <BookOpen size={16} /> Open Journal
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
