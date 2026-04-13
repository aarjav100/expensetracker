import { useState, useEffect } from "react";
import api from "../Services/api";
import toast from "react-hot-toast";

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Shopping', 'Investment', 'Other'];

function BudgetPlanner() {
  const [budget, setBudget] = useState({ totalLimit: '', categoryLimits: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const month = new Date().getMonth();
  const year = new Date().getFullYear();

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await api.get(`/budget?month=${month}&year=${year}`);
      setBudget({
        totalLimit: res.data.totalLimit || '',
        categoryLimits: res.data.categoryLimits || {}
      });
    } catch (err) {
      toast.error("Failed to load budget");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/budget', {
        month,
        year,
        totalLimit: Number(budget.totalLimit),
        categoryLimits: budget.categoryLimits
      });
      toast.success("Budget updated successfully!");
    } catch (err) {
      toast.error("Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const updateCategoryLimit = (cat, val) => {
    setBudget(prev => ({
      ...prev,
      categoryLimits: { ...prev.categoryLimits, [cat]: Number(val) }
    }));
  };

  if (loading) return <div className="p-8 text-white">Loading Budget Planner...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Budget Planner</h1>
        <p className="text-slate-400 font-medium">Set your monthly limits and stay financially disciplined.</p>
      </header>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Global Budget Card */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl border border-indigo-500/20">
            🎯
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-500">₹</span>
              <input 
                type="number" 
                value={budget.totalLimit}
                onChange={e => setBudget({...budget, totalLimit: e.target.value})}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-3xl font-black outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            This is your total spending cap for the month across all categories combined.
          </p>
          <button 
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
          >
            {saving ? 'SAVING...' : 'SAVE ALL LIMITS'}
          </button>
        </div>

        {/* Category Limits Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3">
             Category Breakdowns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORIES.map(cat => (
              <div key={cat} className="p-6 bg-slate-950 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-wider">{cat}</span>
                  <span className="text-xs font-bold text-indigo-500 p-1 px-2 bg-indigo-500/10 rounded-lg">Target</span>
                </div>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-600">₹</span>
                   <input 
                     type="number"
                     value={budget.categoryLimits[cat] || ''}
                     onChange={e => updateCategoryLimit(cat, e.target.value)}
                     placeholder="No limit"
                     className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-indigo-500 transition-all"
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default BudgetPlanner;
