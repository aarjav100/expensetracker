import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';


const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const res = await api.get("/expense");
                const allExpenses = Array.isArray(res.data) ? res.data : res.data?.expenses || [];
                setExpenses(allExpenses);
            } catch {
                // Silent error or handled locally
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    // --- Data processing for Charts ---

    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;
        expenses.forEach(e => {
            const amt = parseFloat(e.amount) || 0;
            if (e.type === 'income') income += amt;
            else expense += amt;
        });
        const balance = income - expense;
        const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;
        return { income, expense, balance, savingsRate };
    }, [expenses]);

    const pieData = useMemo(() => {
        const cats = {};
        expenses.filter(e => e.type === 'expense').forEach(e => {
            cats[e.category] = (cats[e.category] || 0) + (parseFloat(e.amount) || 0);
        });
        return Object.keys(cats).map(name => ({ name, value: cats[name] }));
    }, [expenses]);

    const barData = useMemo(() => {
        // Group by month
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const data = months.map(m => ({ name: m, income: 0, expense: 0 }));
        const currentYear = new Date().getFullYear();

        expenses.forEach(e => {
            const date = new Date(e.date || e.createdAt);
            if (date.getFullYear() === currentYear) {
                const mIdx = date.getMonth();
                const amt = parseFloat(e.amount) || 0;
                if (e.type === 'income') data[mIdx].income += amt;
                else data[mIdx].expense += amt;
            }
        });
        return data.filter(d => d.income > 0 || d.expense > 0);
    }, [expenses]);

    const areaData = useMemo(() => {
        // Daily trend for the last 30 days
        const last30 = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last30.push({ date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), amount: 0 });
        }

        expenses.filter(e => e.type === 'expense').forEach(e => {
            const expDate = new Date(e.date || e.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            const idx = last30.findIndex(l => l.date === expDate);
            if (idx !== -1) last30[idx].amount += parseFloat(e.amount) || 0;
        });
        return last30;
    }, [expenses]);

    const recentTransactions = useMemo(() => {
        return [...expenses]
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
            .slice(0, 10);
    }, [expenses]);

    // --- Render ---

    if (loading && expenses.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.name || "User"}</span> 👋
                        </h1>
                        <p className="text-slate-400 font-medium">Here's what's happening with your money today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate("/add-expense")}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                        >
                            <span>+</span> Add Transaction
                        </button>
                    </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Total Income", val: stats.income, color: "text-emerald-400", icon: "📈", bg: "emerald" },
                        { label: "Total Expenses", val: stats.expense, color: "text-rose-400", icon: "📉", bg: "rose" },
                        { label: "Net Balance", val: stats.balance, color: "text-white", icon: "⚖️", bg: "indigo" },
                        { label: "Savings Rate", val: `${stats.savingsRate}%`, color: "text-amber-400", icon: "🎯", bg: "amber" }
                    ].map((s, i) => (
                        <div key={i} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <span className="text-2xl mb-4 block opacity-80">{s.icon}</span>
                                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">{s.label}</h3>
                                <p className={`text-3xl font-black mt-1 ${s.color}`}>
                                    {typeof s.val === 'number' ? `₹${s.val.toLocaleString()}` : s.val}
                                </p>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${s.bg}-500/10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Trend Chart */}
                    <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Income vs Expenses</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', border: 'none' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} name="Income" />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6">By Category</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                            {pieData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-xs text-slate-400 capitalize">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Area Trend */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Spending Trend (30d)</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaData}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
                            <button onClick={() => navigate("/expenses")} className="text-indigo-400 text-sm font-bold hover:text-indigo-300">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/40 text-left">
                                    <tr className="text-slate-500 text-xs uppercase font-black">
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {recentTransactions.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`w-2.5 h-2.5 rounded-full ${t.type === 'income' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-white">{t.title}</div>
                                                <div className="text-[10px] text-slate-500">{new Date(t.date || t.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] bg-slate-700 py-1 px-2 rounded-lg font-bold text-white uppercase">{t.category}</span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                                {t.type === 'income' ? '+' : '-'} ₹{parseFloat(t.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;