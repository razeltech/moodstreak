import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { db, PlannerTask } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, addDays, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle, Circle, Calendar, GripVertical, Forward, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { HandDrawnBorder } from './HandDrawnBorder';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '../lib/utils';

export function PlannerPage() {
  const { currentDate, setCurrentDate, setActiveTab } = useStore();
  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  
  const tasks = useLiveQuery(() => 
    db.tasks.where('date').equals(formattedDate).sortBy('order')
  , [formattedDate]);

  const DAILY_QUOTES = [
    "Do something today that your future self will thank you for.",
    "Small steps every day.",
    "Focus on the step in front of you, not the whole staircase.",
    "Make today your masterpiece.",
    "Every moment is a fresh beginning.",
    "Create your own sunshine.",
    "Simplicity is the ultimate sophistication.",
    "What you do today can improve all your tomorrows.",
    "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure."
  ];
  const activeQuote = DAILY_QUOTES[currentDate.getDate() % DAILY_QUOTES.length];

  const [newTaskText, setNewTaskText] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [subTaskInput, setSubTaskInput] = useState('');

  const addTemplateRoutine = async () => {
    const routine = [
      "Wake up & Hydrate",
      "Exercise / Meditation",
      "Healthy Breakfast",
      "Deep Work Session",
      "Lunch Break",
      "Wind Down / Read"
    ];
    let nextOrder = (tasks?.length || 0) + 1;
    const newTasks = routine.map(text => ({
      id: Math.random().toString(36).substring(2),
      date: formattedDate,
      text,
      completed: false,
      order: nextOrder++,
      priority: 'medium' as const,
      subTasks: []
    }));
    await Promise.all(newTasks.map(t => db.tasks.add(t)));
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: PlannerTask = {
      id: Math.random().toString(36).substring(2),
      date: formattedDate,
      text: newTaskText.trim(),
      completed: false,
      order: (tasks?.length || 0) + 1,
      dueDate: dueDate || undefined,
      priority,
      tags: tags.length > 0 ? tags : undefined,
      subTasks: []
    };

    await db.tasks.add(newTask);
    setNewTaskText('');
    setDueDate('');
    setPriority('medium');
    setTags([]);
    setTagInput('');
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !tasks) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update orders in DB
    const updates = items.map((item, index) => 
      db.tasks.update(item.id, { order: index + 1 })
    );
    await Promise.all(updates);
  };

  const toggleTask = async (task: PlannerTask) => {
    await db.tasks.update(task.id, { completed: !task.completed });
  };

  const deleteTask = async (id: string) => {
    await db.tasks.delete(id);
  };

  const linkToJournal = async (task: PlannerTask, date: string) => {
    await db.tasks.update(task.id, { linkedEntryId: date });
    setExpandedTask(null);
  };

  const addSubTask = async (task: PlannerTask, e: React.FormEvent) => {
    e.preventDefault();
    if (!subTaskInput.trim()) return;
    
    const newSubTask = { id: Math.random().toString(36).substring(2), text: subTaskInput.trim(), completed: false };
    const subTasks = [...(task.subTasks || []), newSubTask];
    
    await db.tasks.update(task.id, { subTasks });
    setSubTaskInput('');
  };

  const toggleSubTask = async (task: PlannerTask, subTaskId: string) => {
    const subTasks = task.subTasks?.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st);
    await db.tasks.update(task.id, { subTasks });
  };

  const deleteSubTask = async (task: PlannerTask, subTaskId: string) => {
    const subTasks = task.subTasks?.filter(st => st.id !== subTaskId);
    await db.tasks.update(task.id, { subTasks });
  };

  const migrateUnresolved = async () => {
    if (!tasks) return;
    const unresolved = tasks.filter(t => !t.completed);
    if (unresolved.length === 0) return;
    
    const tomorrow = format(addDays(currentDate, 1), 'yyyy-MM-dd');
    
    // Get existing tasks for tomorrow to start ordering from there
    const tomorrowTasks = await db.tasks.where('date').equals(tomorrow).sortBy('order');
    let nextOrder = (tomorrowTasks?.length || 0) + 1;

    const updates = unresolved.map(task => 
      db.tasks.update(task.id, { date: tomorrow, order: nextOrder++ })
    );
    
    await Promise.all(updates);
    
    // Switch view to tomorrow
    setCurrentDate(addDays(currentDate, 1));
  };

  const goPrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const goNextDay = () => setCurrentDate(addDays(currentDate, 1));

  return (
    <div className="h-full flex flex-col pt-4 overflow-y-auto px-3 sm:px-4">
      <div className="max-w-3xl w-full mx-auto pt-4 pb-24 relative flex flex-col">
          <div className="relative z-10 bg-[#FDFBF7] rounded-[24px] sm:rounded-[32px] shadow-[6px_6px_0px_#D9D1C1] sm:shadow-[8px_8px_0px_#D9D1C1] border-2 border-[#2C2C2C] p-4 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b-2 border-[#2C2C2C] gap-4 relative">
                <div>
                  <h2 className="text-2xl font-playfair font-black tracking-tight italic text-ink">Daily Planner</h2>
                  <p className="text-ink-light font-sans text-[10px] uppercase tracking-[0.2em] mt-1 font-bold opacity-60">Focus on what matters</p>
                  <p className="text-[10px] font-serif italic text-rose-dark mt-2 border-l-2 border-rose-dark pl-3 max-w-sm opacity-70">"{activeQuote}"</p>
                </div>
                {/* Decorative Tape */}
                <div className="absolute -top-10 -left-3 sm:-top-12 sm:-left-4 w-16 sm:w-20 h-5 sm:h-6 bg-[#E8D17E]/40 border border-[#2C2C2C]/10 rotate-6 mix-blend-multiply" />
                
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button onClick={addTemplateRoutine} className="text-xs font-bold font-sans flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-[var(--border-color)] shadow-sm hover:bg-cream transition-colors text-ink" title="Add Daily Routine Template">
                        <Plus size={14} className="text-stone-400" /> Routine
                    </button>
                    <button onClick={migrateUnresolved} className="text-xs font-bold font-sans flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-[var(--border-color)] shadow-sm hover:bg-cream transition-colors text-ink" title="Migrate Unfinished to Tomorrow">
                        <Forward size={14} className="text-rose-dark" fill="var(--rose-light)" /> Migrate
                    </button>
                    <div className="flex items-center flex-1 sm:flex-none bg-white rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden min-w-[200px]">
                        <button onClick={goPrevDay} className="px-3 py-2 hover:bg-cream font-bold border-r border-[var(--border-color)] text-ink shrink-0">←</button>
                        <div className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 pointer-events-none text-ink min-w-0">
                           <Calendar size={15} className="text-ink-light shrink-0" />
                           <span className="font-sans font-bold text-ink whitespace-nowrap text-xs sm:text-sm truncate">{format(currentDate, 'MMM d, yyyy')}</span>
                        </div>
                        <button onClick={goNextDay} className="px-3 py-2 hover:bg-cream font-bold border-l border-[var(--border-color)] text-ink shrink-0">→</button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group bg-cream p-4 sm:p-6 rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-sm"
        >
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-ink-light mb-3">Add Task</h3>
            <form onSubmit={addTask} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="What's on your mind?..."
                  className="flex-1 bg-white border border-[var(--border-color)] rounded-xl px-3 py-2.5 font-serif text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-rose-dark transition-all placeholder:text-stone-400 text-ink shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!newTaskText.trim()}
                  className="bg-ink text-white p-3 sm:p-4 rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 shadow-sm"
                >
                  <Plus size={22} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-ink">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink-light">Due:</span>
                    <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-white border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs font-sans font-bold focus:ring-1 focus:ring-ink outline-none w-full"
                    />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-ink">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink-light">Priority:</span>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                        className="bg-white border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs font-sans font-bold focus:ring-1 focus:ring-ink outline-none w-full"
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div className="col-span-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-ink">
                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-ink-light"><TagIcon size={12}/> Tags:</span>
                    <div className="flex-1 flex items-center gap-1 flex-wrap bg-white border border-[var(--border-color)] rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-ink">
                        {tags.map(t => (
                            <span key={t} className="bg-ink text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                {t} <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400">&times;</button>
                            </span>
                        ))}
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add Tag"
                            className="bg-transparent border-none outline-none text-xs font-sans font-bold flex-1 min-w-[60px]"
                        />
                    </div>
                </div>
              </div>
            </form>
        </motion.div>

        {/* Tasks List */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-[50px]"
              >
                {tasks?.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "group bg-white rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all overflow-hidden mb-4",
                          task.completed && "opacity-60 bg-stone-50 text-stone-500",
                          expandedTask === task.id ? "pb-4" : "",
                          snapshot.isDragging && "shadow-xl border-rose-dark scale-[1.02] z-50",
                        )}
                        style={provided.draggableProps.style}
                      >
                       <div className="flex items-center gap-4 p-4">
                        <div {...provided.dragHandleProps} className="text-ink-light cursor-grab active:cursor-grabbing">
                           <GripVertical size={20} />
                        </div>

                        <button 
                          onClick={() => toggleTask(task)}
                          className="flex-shrink-0 transition-transform active:scale-125"
                        >
                          {task.completed ? (
                            <CheckCircle className="text-green-500" size={28} />
                          ) : (
                            <Circle className="text-ink-light hover:text-ink transition-colors" size={28} />
                          )}
                        </button>
                        
                        <div className="flex-1 flex flex-col cursor-pointer" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                "font-serif text-lg sm:text-2xl tracking-tight transition-all flex-1 text-ink",
                                task.completed && "line-through text-stone-400"
                                )}>
                                {task.text}
                                </span>
                                {task.priority === 'high' && <span title="High Priority"><AlertCircle size={16} className="text-red-400" /></span>}
                                {task.priority === 'low' && <span title="Low Priority"><AlertCircle size={16} className="text-blue-400" /></span>}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {task.dueDate && (
                                    <span className="text-[10px] font-sans font-bold uppercase text-ink-light flex items-center gap-1">
                                        <Calendar size={10} /> {task.dueDate === formattedDate ? 'Today' : task.dueDate}
                                    </span>
                                )}
                                {task.tags?.map(tag => (
                                    <span key={tag} className="text-[10px] font-sans font-bold uppercase bg-stone-100 text-ink-light px-1.5 py-0.5 rounded flex items-center gap-1">
                                        {tag}
                                    </span>
                                ))}
                                {task.subTasks && task.subTasks.length > 0 && (
                                    <span className="text-[10px] font-sans font-bold uppercase text-ink-light">
                                        {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length} subtasks
                                    </span>
                                )}
                            </div>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                          className="p-2 text-red-300 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                       </div>
                       
                       {/* Subtasks Section */}
                       <AnimatePresence>
                         {expandedTask === task.id && (
                             <motion.div
                                key={`${task.id}-subtasks`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-14 overflow-hidden"
                             >
                                <div className="space-y-2 mt-2 pt-2 border-t border-[var(--border-color)]">
                                    {task.subTasks?.map(st => (
                                        <div key={st.id} className="flex items-center gap-3 group/sub">
                                            <button onClick={() => toggleSubTask(task, st.id)} className="shrink-0 text-ink-light hover:text-ink">
                                                {st.completed ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} />}
                                            </button>
                                            <span className={cn("text-sm flex-1 font-serif text-ink", st.completed && "line-through text-stone-400")}>
                                                {st.text}
                                            </span>
                                            <button onClick={() => deleteSubTask(task, st.id)} className="opacity-0 group-hover/sub:opacity-100 text-red-400">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <form onSubmit={(e) => addSubTask(task, e)} className="flex items-center gap-2 pt-2">
                                        <input 
                                            type="text" 
                                            value={subTaskInput}
                                            onChange={e => setSubTaskInput(e.target.value)}
                                            placeholder="Add subtask..."
                                            className="flex-1 text-sm bg-transparent border-b border-[var(--border-color)] focus:border-ink outline-none px-1 py-1 font-serif text-ink"
                                        />
                                        <button type="submit" disabled={!subTaskInput.trim()} className="text-[10px] uppercase font-bold bg-ink text-white px-2 py-1 rounded disabled:opacity-50">Add</button>
                                    </form>
                                </div>
                             </motion.div>
                         )}
                       </AnimatePresence>

                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {tasks?.length === 0 && (
            <div className="text-center py-20 opacity-30 select-none">
                <p className="font-serif text-3xl italic">Peaceful day ahead...</p>
                <p className="font-sans text-[10px] uppercase tracking-widest mt-2">No tasks logged for this day</p>
            </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
}
