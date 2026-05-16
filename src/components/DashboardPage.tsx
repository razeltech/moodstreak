import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { BarChart3, TrendingUp, Image as ImageIcon, Smile, Calendar, Book, PieChart as PieChartIcon, PenTool, Sparkles } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AnimatedMarginalia } from './AnimatedMarginalia';

export function DashboardPage() {
  const entries = useLiveQuery(() => db.entries.toArray());
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const CustomBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    return (
      <g>
        <path
          d={`M${x},${y + height} 
             Q${x + width / 4},${y + height - 5} ${x + width / 2},${y + height} 
             Q${x + (width * 3) / 4},${y + height + 5} ${x + width},${y + height} 
             L${x + width - 2},${y + 2} 
             Q${x + (width * 3) / 4},${y - 2} ${x + width / 2},${y + 1} 
             Q${x + width / 4},${y + 5} ${x + 2},${y + 2} 
             Z`}
          fill={fill}
          stroke="#2C2C2C"
          strokeWidth="2"
          className="filter drop-shadow-sm"
        />
        {/* Scribble detail */}
        <path 
            d={`M${x + width * 0.2},${y + height * 0.8} L${x + width * 0.8},${y + height * 0.2}`} 
            stroke="#2C2C2C" 
            strokeWidth="0.5" 
            opacity="0.2" 
        />
      </g>
    );
  };

  // Calculate mood trends for the last 7 days
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const moodStats = last7Days.map(day => {
    const formatted = format(day, 'yyyy-MM-dd');
    const entry = entries?.find(e => e.date === formatted);
    return {
      date: formatted,
      mood: entry?.mood || null,
      dayName: format(day, 'EEE'),
    };
  });

  const photoCount = entries?.reduce((acc, entry) => acc + (entry.photos?.length || 0), 0) || 0;
  const entryCount = entries?.length || 0;
  const totalWords = entries?.reduce((acc, e) => acc + (e.wordCount || (e.content ? e.content.split(/\s+/).length : 0)), 0) || 0;
  const totalMinutes = (entries?.reduce((acc, e) => acc + (e.writingTime || 0), 0) || 0) / 60;
  const averageWordsPerEntry = entryCount > 0 ? Math.round(totalWords / entryCount) : 0;
  const settings = useLiveQuery(() => db.settings.get(1));
  const dailyGoal = settings?.dailyWordGoal || 1000;
  const todayEntry = entries?.find(e => e.date === format(new Date(), 'yyyy-MM-dd'));
  const todayWords = todayEntry?.wordCount || 0;
  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((todayWords / dailyGoal) * 100)) : 0;

  // 30 day sparkline
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  const sparklineData = last30Days.map(day => {
    const formatted = format(day, 'yyyy-MM-dd');
    const entry = entries?.find(e => e.date === formatted);
    return {
      active: !!entry,
      wordCount: entry?.wordCount || 0
    };
  });

  // Mood Frequency Data
  const moodFrequencyMap = entries?.reduce((acc, e) => {
    if (e.mood) {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const barChartData = Object.entries(moodFrequencyMap).map(([name, value]) => ({ name, value }));

  // Weekly Distribution
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  
  const weeklyStats = entries?.filter(e => {
    const date = new Date(e.date);
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  });

  const weeklyMoods = weeklyStats?.reduce((acc, e) => {
    if (e.mood) {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const weeklyWords = weeklyStats?.reduce((acc, e) => acc + (e.wordCount || 0), 0) || 0;

  const pieChartData = Object.entries(weeklyMoods).map(([name, value]) => ({ name, value }));
  const COLORS = ['#E8D17E', '#7EB6E8', '#FCA3CC', '#95D5B2', '#E87E7E', '#A0998E'];

  // Keyword Analysis (Top Words)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'it', 'i', 'my', 'me', 'with', 'on', 'for', 'at', 'by', 'this', 'that', 'you', 'your', 'so', 'up', 'down', 'out', 'very', 'really', 'just', 'today', 'was', 'been', 'have', 'had', 'has', 'will', 'been', 'there', 'from']);
  
  const wordFrequencyMap = entries?.reduce((acc, e) => {
    const text = (e.title + ' ' + (e.content || '')).toLowerCase().replace(/[^\w\s]/g, '');
    const words = text.split(/\s+/);
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        acc[word] = (acc[word] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>) || {};

  const topKeywords = Object.entries(wordFrequencyMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col">
      <div className="max-w-6xl w-full mx-auto pt-8 pb-24 px-4 sm:px-6 relative shrink-0">
        <AnimatedMarginalia />
        <div className="relative z-10 bg-[#FDFBF7] rounded-[32px] shadow-[8px_8px_0px_#D9D1C1] border-2 border-[#2C2C2C] p-6 sm:p-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#2C2C2C]">
            <div>
              <h1 className="text-2xl font-black italic text-[#2C2C2C] tracking-tight sm:hidden">Insights</h1>
              <p className="text-[10px] font-bold text-[#A0998E] uppercase tracking-[0.2em] mt-1 opacity-60">Activity & Trends Dashboard</p>
            </div>
            {/* Decorative Tape */}
            <div className="absolute -top-4 -right-4 w-20 h-6 bg-[#E8D17E]/40 border border-[#2C2C2C]/10 -rotate-12 mix-blend-multiply" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[minmax(140px,_auto)]">
        {/* Total Entries */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-white p-6 rounded-3xl border border-[var(--border-color)] shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-light rounded-xl text-rose-dark group-hover:scale-110 transition-transform">
              <Book size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-ink-light">Total Pages</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl lg:text-5xl font-playfair font-semibold text-ink">{entryCount}</div>
            <div className="text-xs font-bold text-ink-light opacity-60 italic mb-1">Entries</div>
          </div>
        </div>

        {/* Current Date (Prominent) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-2 row-span-1 bg-rose-light p-6 rounded-3xl shadow-sm text-ink border border-[var(--border-color)] flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform">
             <Calendar size={120} />
          </div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2 bg-white/50 rounded-xl text-rose-dark">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-dark">Today</span>
          </div>
          <div className="flex flex-col gap-0.5 relative z-10">
            <div className="text-xl font-playfair font-bold">{format(currentTime, 'EEEE, MMM do')}</div>
            <div className="text-2xl font-black font-sans tracking-tight text-rose-dark/80">{format(currentTime, 'pp')}</div>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="col-span-1 md:col-span-2 row-span-1 bg-white p-6 rounded-3xl border border-[var(--border-color)] shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-xl text-yellow-700">
               <Book size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-ink-light">Goal Progress</span>
          </div>
          <div className="flex items-end justify-between mb-2">
             <div className="text-4xl lg:text-5xl font-playfair font-semibold text-ink">{isNaN(goalProgress) ? 0 : goalProgress}%</div>
             <div className="text-[10px] font-black text-ink-light/60 uppercase">{todayWords} / {dailyGoal} words</div>
          </div>
          <div className="w-full h-2 bg-ink/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-yellow-400" 
               initial={{ width: 0 }}
               animate={{ width: `${goalProgress}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
             />
          </div>
        </div>

        {/* Writing Volume */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-white p-6 rounded-3xl border border-[var(--border-color)] shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-lavender-light rounded-xl text-lavender-dark group-hover:scale-110 transition-transform">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-ink-light">Writing Volume</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl lg:text-5xl font-playfair font-semibold text-ink">{Math.round(totalWords / 100) / 10}k</div>
            <div className="text-xs font-bold text-ink-light opacity-60 italic mb-1">Words</div>
          </div>
        </div>

        {/* 30 Day Activity - Spans full width on medium, 4 cols on large */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 bg-cream p-8 rounded-[32px] border border-[var(--border-color)] shadow-sm relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-xl text-rose-dark shadow-sm">
                 <PenTool size={20} />
               </div>
               <h3 className="text-xl font-playfair italic text-ink">30-Day Momentum</h3>
             </div>
          </div>
          
          <div className="flex-1 flex items-end h-24 gap-1.5 mb-6 mt-auto">
            {sparklineData.map((data, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: data.active ? `${Math.min(100, (data.wordCount / 500) * 100)}%` : '15%' }}
                className={cn(
                  "flex-1 rounded-sm transition-all duration-500",
                  data.active ? "bg-rose-dark shadow-sm hover:brightness-110" : "bg-[var(--border-color)]/30"
                )}
                title={data.wordCount ? `${data.wordCount} words` : 'No entry'}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="p-4 bg-white rounded-2xl border border-[var(--border-color)] flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Weekly Progress</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{weeklyWords}</span>
                    <span className="text-xs opacity-60 italic">words</span>
                </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-[var(--border-color)] flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Time Invested</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{isNaN(Math.round(totalMinutes)) ? 0 : Math.round(totalMinutes)}</span>
                    <span className="text-xs opacity-60 italic">minutes</span>
                </div>
            </div>
          </div>
        </div>

        {/* Weekly Mood Distribution - 2 cols on large */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white p-8 rounded-[32px] border border-[var(--border-color)] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-lavender-light rounded-xl text-lavender-dark">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-xl font-playfair italic text-ink">Weekly Balance</h3>
          </div>
          <div className="flex-1 w-full min-h-[180px] flex items-center justify-center">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#2C2C2C" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#2C2C2C', color: '#FDFBF7', borderRadius: '12px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="text-center">
                    <p className="text-sm font-bold text-[#A0998E] italic">Start journaling to see your balance!</p>
                </div>
            )}
          </div>
        </div>

        {/* Mood Heatmap - Spans 3 cols */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2 bg-white p-8 rounded-[32px] border border-[var(--border-color)] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-light rounded-xl text-rose-dark group-hover:scale-110 transition-transform">
                  <Smile size={20} />
                </div>
                <h3 className="text-xl font-playfair italic text-ink">Mood Heatmap</h3>
             </div>
          </div>
          
          <div className="flex-1 flex justify-between items-end gap-2">
            {moodStats.map((stat, i) => (
              <div key={stat.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: stat.mood ? '100%' : '20%' }}
                  className="w-full max-w-[40px] rounded-xl transition-all flex flex-col items-center justify-start py-2 text-xl shadow-sm min-h-[40px]"
                  style={{ backgroundColor: stat.mood ? 'var(--rose-light)' : 'var(--cream)' }}
                >
                  <span className="drop-shadow-sm">{stat.mood}</span>
                </motion.div>
                <div className="w-full text-center text-[10px] font-bold text-ink-light shrink-0">{stat.dayName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Frequency Chart */}
        <div className="col-span-1 md:col-span-4 lg:col-span-3 row-span-2 bg-white p-8 rounded-[32px] border border-[var(--border-color)] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-cream rounded-xl text-ink">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-xl font-playfair italic text-ink">All-Time Feelings</h3>
          </div>
          <div className="flex-1 w-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 16 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#2C2C2C', color: '#FDFBF7', borderRadius: '12px', border: 'none' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#E8D17E" 
                  radius={[8, 8, 8, 8]}
                  shape={<CustomBar />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Keyword Resonance */}
        <div className="col-span-1 md:col-span-4 lg:col-span-6 row-span-1 mt-2 bg-cream p-8 rounded-[32px] border border-[var(--border-color)] shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="p-2 bg-white rounded-xl text-gold shadow-sm">
              <PenTool size={20} />
            </div>
            <h3 className="text-xl font-playfair italic text-ink">Keyword Resonance</h3>
          </div>
          <div className="flex-1 flex flex-wrap gap-3">
             {topKeywords.length > 0 ? (
               topKeywords.map(([word, count]) => (
                <div key={word} className="flex items-center gap-2 bg-white hover:bg-rose-light border border-[var(--border-color)] px-4 py-2 rounded-2xl transition-colors group">
                    <span className="text-ink font-bold tracking-tight">{word}</span>
                    <span className="bg-white text-ink-light border border-[var(--border-color)] text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{count}</span>
                </div>
              ))
            ) : (
                <div className="text-left w-full opacity-60 text-ink-light">
                    <p className="italic font-bold">Write more to see your top themes emerge...</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
