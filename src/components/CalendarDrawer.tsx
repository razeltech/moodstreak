import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, BookText, Trash2, Search, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { cn } from '../lib/utils';
import { ScribbleMood } from './ScribbleMood';
import Fuse from 'fuse.js';

interface CalendarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarDrawer({ isOpen, onClose }: CalendarDrawerProps) {
  const { currentDate, setCurrentDate } = useStore();
  const [viewDate, setViewDate] = React.useState(currentDate);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = React.useState(false);
  
  const entries = useLiveQuery(() => 
    db.entries
      .where('date')
      .between(format(startOfMonth(viewDate), 'yyyy-MM-dd'), format(endOfMonth(viewDate), 'yyyy-MM-dd') + '\uffff')
      .toArray()
  , [viewDate]);

  const allEntries = useLiveQuery(() => db.entries.toArray());

  const fuse = React.useMemo(() => {
    if (!allEntries) return null;
    return new Fuse(allEntries, {
      keys: ['title', 'content', 'date'],
      threshold: 0.3,
      includeMatches: true
    });
  }, [allEntries]);

  const searchResults = React.useMemo(() => {
    let results = searchQuery && fuse ? fuse.search(searchQuery).map(r => r.item) : (allEntries || []);
    if (showOnlyFavorites) {
      results = results.filter(e => e.isFavorite);
    }
    return searchQuery || showOnlyFavorites ? results : [];
  }, [searchQuery, fuse, showOnlyFavorites, allEntries]);

  const entryMap = new Map(entries?.map(e => [e.date, e]));

  const days = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate),
  });

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    onClose();
  };

  const handleDeleteEntry = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this entry permanently?')) {
      await db.entries.delete(id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-cream border-l border-[var(--border-color)] z-[101] flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={24} className="text-ink" />
                  <h2 className="text-2xl font-playfair font-black italic tracking-tight text-ink">Diary Index</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors text-ink"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Bar & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
                  <input 
                    type="text"
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-dark transition-all text-ink shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={cn(
                    "p-2 rounded-xl border border-[var(--border-color)] transition-all flex items-center justify-center min-w-[44px]",
                    showOnlyFavorites ? "bg-cream shadow-sm text-ink" : "bg-white shadow-sm text-ink-light"
                  )}
                  title="Favorites Only"
                >
                  <Star size={18} className={showOnlyFavorites ? "fill-ink text-ink" : "text-ink-light"} />
                </button>
              </div>
            </div>

            {/* Calendar View */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {searchQuery ? (
                /* Search Results */
                                <div className="space-y-4">
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-light mb-4">Search Results ({searchResults.length})</h4>
                  {searchResults.length > 0 ? (
                    searchResults.map(entry => (
                       <div key={entry.id} className="relative group">
                        <button
                          onClick={() => { handleDateSelect(new Date(entry.date + 'T00:00:00')); setSearchQuery(''); }}
                          className="w-full text-left p-4 bg-white rounded-2xl border border-[var(--border-color)] shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all pr-12"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-ink-light">{format(new Date(entry.date + 'T00:00:00'), 'MMM d, yyyy')}</span>
                            {entry.mood && <span className="text-ink">{entry.mood}</span>}
                          </div>
                          <p className="font-bold text-ink line-clamp-1 italic">
                            {entry.title || entry.content.slice(0, 40) || 'An untitled memory...'}
                          </p>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-40">
                      <p className="text-xs font-bold italic tracking-tight text-ink">No memories match your search.</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]">
                    <h3 className="text-xl font-playfair font-bold italic text-ink">{format(viewDate, 'MMMM yyyy')}</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-50 rounded-lg border border-[var(--border-color)] shadow-sm text-ink"><ChevronLeft size={16} /></button>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-stone-50 rounded-lg border border-[var(--border-color)] shadow-sm text-ink"><ChevronRight size={16} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-8">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-center text-[10px] font-bold uppercase tracking-widest text-ink-light py-2">
                    {d}
                  </div>
                ))}
                
                {/* Padding for first day of month */}
                {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}

                {days.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const entry = entryMap.get(dateStr);
                  const isCurrent = isSameDay(day, currentDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        "aspect-square rounded-xl border transition-all flex flex-col items-center justify-center relative group overflow-hidden",
                        isCurrent 
                          ? "border-[var(--border-color)] bg-cream shadow-sm" 
                          : "border-transparent hover:border-gray-200 hover:bg-white",
                        isToday && !isCurrent && "border-dashed border-[var(--border-color)] bg-transparent"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold z-10",
                        isCurrent ? "text-ink" : "text-ink-light"
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      {entry?.moodColor && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity p-1">
                          <ScribbleMood color={entry.moodColor} size={40} className="w-full h-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* History List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-light mb-4">Recent Scribbles</h4>
                {entries && entries.length > 0 ? (
                  [...entries].reverse().slice(0, 5).map(entry => (
                    <div key={entry.id} className="relative group">
                      <button
                        onClick={() => handleDateSelect(new Date(entry.date + 'T00:00:00'))}
                        className="w-full text-left p-4 bg-white rounded-2xl border border-[var(--border-color)] shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all pr-12"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-ink-light">{format(new Date(entry.date + 'T00:00:00'), 'MMM d, yyyy')}</span>
                          {entry.mood && <span className="text-ink text-lg">{entry.mood}</span>}
                        </div>
                        <p className="font-bold text-ink line-clamp-1 italic">
                          {entry.title || entry.content.slice(0, 40) || 'An untitled memory...'}
                        </p>
                      </button>
                      <button 
                        onClick={(e) => handleDeleteEntry(e, entry.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shadow-sm bg-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-40">
                    <BookText size={40} className="mx-auto mb-2 text-ink-light" />
                    <p className="text-xs font-bold italic tracking-tight text-ink">No memories recorded yet <br/>in {format(viewDate, 'MMMM')}.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

            <div className="p-6 border-t border-[var(--border-color)] bg-white/50">
               <button 
                onClick={() => handleDateSelect(new Date())}
                className="w-full bg-ink text-white py-3 rounded-xl font-bold shadow-sm hover:bg-ink-light hover:shadow-md hover:translate-y-[-1px] transition-all"
               >
                 Go to Today
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
