import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, WeightLog, CycleLog, ExpenseLog, InsuranceLog, RecurringPayment } from '../db/db';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { 
  Activity, 
  Droplets, 
  Wallet, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Heart,
  DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function TrackersPage() {
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'finance' | 'insurance'>('health');

  const tabs = [
    { id: 'health', label: 'Health Vault', icon: Activity, color: 'text-rose-dark', bg: 'bg-rose-light/20' },
    { id: 'finance', label: 'Finance Log', icon: Wallet, color: 'text-yellow-700', bg: 'bg-yellow-100' },
    { id: 'insurance', label: 'Bills & Insurance', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="h-full overflow-y-auto w-full px-4 custom-scrollbar">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <div className="flex flex-col mb-8 ml-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ink-light opacity-60">
              Life Vault & Analytics
            </span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-ink">
            My <span className="text-rose-dark underline decoration-4 decoration-rose-light/50">Trackers</span>
          </h1>
        </div>

        <div className="flex gap-2 mb-8 bg-white/50 p-1.5 rounded-2xl border border-ink/5 backdrop-blur-sm sticky top-0 z-30">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest",
                activeSubTab === tab.id 
                  ? "bg-white text-ink shadow-md border border-ink/5 scale-[1.02]" 
                  : "text-ink-light hover:bg-white/30"
              )}
            >
              <tab.icon size={16} className={cn(activeSubTab === tab.id ? tab.color : "opacity-40")} />
              <span className={cn(activeSubTab === tab.id ? "opacity-100" : "opacity-40")}>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeSubTab === 'health' && <HealthTrackers key="health" />}
          {activeSubTab === 'finance' && <FinanceTracker key="finance" />}
          {activeSubTab === 'insurance' && <InsuranceAndBills key="insurance" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HealthTrackers() {
  const weightLogs = useLiveQuery(() => db.weightLogs.orderBy('date').toArray());
  const cycleLogs = useLiveQuery(() => db.cycleLogs.orderBy('date').toArray());
  const [newWeight, setNewWeight] = useState('');

  const addWeight = async () => {
    if (!newWeight) return;
    await db.weightLogs.add({
      id: Math.random().toString(36).substring(2),
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: parseFloat(newWeight),
      unit: 'kg'
    });
    setNewWeight('');
  };

  const addCycleEntry = async (flow: 'light' | 'medium' | 'heavy') => {
    await db.cycleLogs.add({
      id: Math.random().toString(36).substring(2),
      date: format(new Date(), 'yyyy-MM-dd'),
      flow,
      symptoms: [],
      mood: 'Neutral'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <section className="bg-page-bg rounded-[32px] shadow-[8px_8px_0px_var(--shadow-color)] border-2 border-[#2C2C2C] p-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-light/30 rounded-xl text-rose-dark"><TrendingUp size={20} /></div>
            <h3 className="text-xl font-playfair font-black text-ink italic">Weight Log</h3>
          </div>
          <div className="flex gap-2">
            <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="0.0" className="w-20 bg-white border border-ink/10 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none" />
            <button onClick={addWeight} className="bg-ink text-white p-2 rounded-xl hover:scale-105 transition-transform"><Plus size={20} /></button>
          </div>
        </div>
        <div className="h-48 w-full mb-6">
          {weightLogs && weightLogs.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightLogs}>
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip contentStyle={{ backgroundColor: '#2C2C2C', borderRadius: '12px', border: 'none', color: '#FFF' }} labelStyle={{ display: 'none' }} />
                <Line type="monotone" dataKey="weight" stroke="#C06080" strokeWidth={3} dot={{ r: 4, fill: '#C06080' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-ink/5 rounded-2xl opacity-40">
               <Activity size={32} className="mb-2" /><p className="text-[10px] font-bold uppercase text-center">Log at least 2 entries</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-page-bg rounded-[32px] shadow-[8px_8px_0px_var(--shadow-color)] border-2 border-[#2C2C2C] p-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-light/30 rounded-xl text-rose-dark"><Droplets size={20} /></div>
            <h3 className="text-xl font-playfair font-black text-ink italic">Cycle Log</h3>
          </div>
          <div className="flex gap-1 bg-white/50 p-1 rounded-xl border border-ink/5">
            {(['light', 'medium', 'heavy'] as const).map(f => (
              <button key={f} onClick={() => addCycleEntry(f)} className="px-2 py-1 text-[10px] font-black uppercase rounded-lg hover:bg-rose-light/20 transition-colors">{f}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-6">
          {['S','M','T','W','T','F','S'].map((d, i) => (<div key={i} className="text-center text-[10px] font-black opacity-30 py-1">{d}</div>))}
          {Array.from({ length: 35 }).map((_, i) => {
            const date = new Date(); date.setDate(date.getDate() - (34 - i));
            const log = cycleLogs?.find(l => l.date === format(date, 'yyyy-MM-dd'));
            return (
              <div key={i} className={cn("aspect-square rounded-lg border border-ink/5 flex items-center justify-center transition-all", log ? "bg-rose-dark border-rose-dark shadow-sm" : "bg-white/40")}>
                {log && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

function FinanceTracker() {
  const expenses = useLiveQuery(() => db.expenseLogs.orderBy('date').toArray());
  const settings = useLiveQuery(() => db.settings.get(1));
  const currency = settings?.currency || '₹';
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Food');

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const addExpense = async () => {
    if (!amount || !desc) return;
    await db.expenseLogs.add({ id: Math.random().toString(36).substring(2), date: date || format(new Date(), 'yyyy-MM-dd'), amount: parseFloat(amount), category, description: desc });
    setAmount(''); setDesc(''); setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const totalSpent = expenses?.reduce((acc, e) => acc + e.amount, 0) || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <section className="lg:col-span-8 bg-page-bg rounded-[32px] shadow-[8px_8px_0px_var(--shadow-color)] border-2 border-[#2C2C2C] p-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-ink/5">
          <div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 rounded-xl text-yellow-700"><Wallet size={20} /></div><h3 className="text-xl font-playfair font-black text-ink italic">Expense Log</h3></div>
          <div className="text-right"><div className="text-[10px] font-black uppercase text-ink-light opacity-60 tracking-widest">Total Spent</div><div className="text-2xl font-black text-ink">{currency}{totalSpent.toLocaleString()}</div></div>
        </div>
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {expenses?.slice().reverse().map(exp => (
            <div key={exp.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-ink/5 group">
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-cream rounded-xl border border-ink/10 flex items-center justify-center text-xl">{exp.category === 'Food' ? '🍱' : '📦'}</div>
              <div className="flex flex-col"><span className="text-sm font-black text-ink">{exp.description}</span><span className="text-[10px] text-ink-light font-bold opacity-60 uppercase">{exp.category} • {exp.date}</span></div></div>
              <div className="flex items-center gap-6"><span className="text-lg font-black text-ink">-{currency}{exp.amount}</span><button onClick={() => db.expenseLogs.delete(exp.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
      </section>
      <aside className="lg:col-span-4 bg-page-bg rounded-[32px] shadow-[8px_8px_0px_var(--shadow-color)] border-2 border-[#2C2C2C] p-6">
        <h4 className="text-[10px] font-black text-ink-light uppercase tracking-widest mb-4">Quick Add</h4>
        <div className="space-y-4">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm font-bold" />
          <input type="number" placeholder={`Amount (${currency})`} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm font-bold" />
          <input type="text" placeholder="Description..." value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm font-bold" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 text-sm font-bold"><option>Food</option><option>Transport</option><option>Rent</option><option>Shopping</option><option>Other</option></select>
          <button onClick={addExpense} className="w-full bg-yellow-400 text-ink py-4 rounded-xl font-black text-xs uppercase tracking-widest border-2 border-ink shadow-[4px_4px_0px_#2C2C2C]">Log Expense</button>
        </div>
      </aside>
    </motion.div>
  );
}

function InsuranceAndBills() {
  const policies = useLiveQuery(() => db.insuranceLogs.toArray());
  const bills = useLiveQuery(() => db.recurringPayments.toArray());
  const settings = useLiveQuery(() => db.settings.get(1));
  const currency = settings?.currency || '₹';
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);

  const [pForm, setPForm] = useState({ provider: '', policyName: '', policyNumber: '', expiryDate: '', premium: '', type: 'Health' });
  const [bForm, setBForm] = useState({ name: '', amount: '', dueDate: '', frequency: 'monthly' as const, type: 'Credit Card' as const });

  const addPolicy = async () => {
    if (!pForm.provider || !pForm.policyName) return;
    await db.insuranceLogs.add({ ...pForm, id: Math.random().toString(36).substring(2), premium: parseFloat(pForm.premium) || 0 });
    setPForm({ provider: '', policyName: '', policyNumber: '', expiryDate: '', premium: '', type: 'Health' }); setShowAddPolicy(false);
  };

  const addBill = async () => {
    if (!bForm.name || !bForm.amount) return;
    await db.recurringPayments.add({ ...bForm, id: Math.random().toString(36).substring(2), amount: parseFloat(bForm.amount) || 0 });
    setBForm({ name: '', amount: '', dueDate: '', frequency: 'monthly', type: 'Credit Card' }); setShowAddBill(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 rounded-xl text-yellow-700"><DollarSign size={20} /></div><h3 className="text-xl font-playfair font-black text-ink italic">Bills & Cards</h3></div>
          <button onClick={() => setShowAddBill(!showAddBill)} className="bg-ink text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Plus size={14} /> {showAddBill ? 'Cancel' : 'Add Bill'}</button>
        </div>
        {showAddBill && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-2 border-ink rounded-[32px] p-6 shadow-[8px_8px_0px_#D1D1D1]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input type="text" placeholder="Name" value={bForm.name} onChange={e => setBForm({...bForm, name: e.target.value})} className="bg-cream rounded-xl p-3 text-sm font-bold border border-ink/5" />
              <input type="number" placeholder="Amount" value={bForm.amount} onChange={e => setBForm({...bForm, amount: e.target.value})} className="bg-cream rounded-xl p-3 text-sm font-bold border border-ink/5" />
              <input type="date" placeholder="Due Date" value={bForm.dueDate} onChange={e => setBForm({...bForm, dueDate: e.target.value})} className="bg-cream rounded-xl p-3 text-sm font-bold border border-ink/5" />
              <select value={bForm.type} onChange={e => setBForm({...bForm, type: e.target.value as any})} className="bg-cream rounded-xl p-3 text-sm font-bold border border-ink/5"><option value="Credit Card">Credit Card</option><option value="Subscription">Subscription</option><option value="Utility">Utility</option></select>
            </div>
            <button onClick={addBill} className="w-full bg-yellow-400 text-ink py-3 rounded-xl font-black text-xs uppercase tracking-widest border-2 border-ink">Add Bill</button>
          </motion.div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bills?.map(bill => (
            <div key={bill.id} className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-2"><div className="flex flex-col"><span className="text-xs font-black uppercase opacity-40">{bill.type}</span><span className="text-lg font-black text-ink">{bill.name}</span></div><button onClick={() => db.recurringPayments.delete(bill.id)} className="opacity-0 group-hover:opacity-100 text-red-400"><Trash2 size={16}/></button></div>
              <div className="flex items-center justify-between mt-4"><div className="flex items-center gap-1.5 text-xs font-bold text-ink-light"><Calendar size={14} /> Due: {bill.dueDate}</div><div className="text-xl font-black text-ink">{currency}{bill.amount}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-xl text-blue-600"><ShieldCheck size={20} /></div><h3 className="text-xl font-playfair font-black text-ink italic">Insurance</h3></div>
          <button onClick={() => setShowAddPolicy(!showAddPolicy)} className="bg-ink text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Plus size={14} /> {showAddPolicy ? 'Cancel' : 'Add Policy'}</button>
        </div>
        {showAddPolicy && (
          <motion.div initial={{ opacity: 0, height: 'auto' }} animate={{ opacity: 1 }} className="bg-white border-2 border-ink rounded-[32px] p-8 shadow-[8px_8px_0px_var(--shadow-color)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <input type="text" value={pForm.provider} onChange={e => setPForm({...pForm, provider: e.target.value})} className="w-full bg-cream rounded-xl p-3 text-sm font-bold" placeholder="Provider" />
              <input type="text" value={pForm.policyName} onChange={e => setPForm({...pForm, policyName: e.target.value})} className="w-full bg-cream rounded-xl p-3 text-sm font-bold" placeholder="Policy Name" />
              <input type="text" value={pForm.policyNumber} onChange={e => setPForm({...pForm, policyNumber: e.target.value})} className="w-full bg-cream rounded-xl p-3 text-sm font-bold" placeholder="Policy #" />
              <input type="date" value={pForm.expiryDate} onChange={e => setPForm({...pForm, expiryDate: e.target.value})} className="w-full bg-cream rounded-xl p-3 text-sm font-bold" placeholder="Expiry Date" />
            </div>
            <button onClick={addPolicy} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Secure Policy</button>
          </motion.div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies?.map(policy => (
            <div key={policy.id} className="bg-page-bg rounded-[32px] border-2 border-ink p-6 shadow-[6px_6px_0px_var(--shadow-color)] relative group overflow-hidden">
              <div className="flex items-start justify-between mb-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-200">🏥</div><div><h4 className="text-lg font-playfair font-black text-ink italic">{policy.policyName}</h4><p className="text-[10px] font-bold text-ink-light opacity-60 uppercase">{policy.provider}</p></div></div><button onClick={() => db.insuranceLogs.delete(policy.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 size={16} /></button></div>
              <div className="grid grid-cols-2 gap-4"><div className="p-3 bg-cream rounded-xl border border-ink/5"><span className="text-[8px] font-black uppercase opacity-40 block mb-1">Policy ID</span><span className="text-xs font-mono font-bold text-ink truncate block">{policy.policyNumber}</span></div><div className="p-3 bg-cream rounded-xl border border-ink/5"><span className="text-[8px] font-black uppercase opacity-40 block mb-1">Expiry Date</span><span className="text-xs font-mono font-bold text-ink truncate block">{policy.expiryDate || 'N/A'}</span></div></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
