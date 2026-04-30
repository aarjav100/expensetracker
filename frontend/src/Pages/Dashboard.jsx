import { useEffect, useState } from "react";
import api from "../Services/api";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, chartRes] = await Promise.all([
                api.get('/summary/stats'),
                api.get('/summary/charts')
            ]);
            setStats(statsRes.data);
            setCharts(chartRes.data);
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Financial Analytics...</div>;

    const summaryItems = [
        { label: 'Total Income', value: stats?.totals.totalIncome, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Total Expenses', value: stats?.totals.totalExpense, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { label: 'Savings', value: stats?.totals.savings, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Monthly Budget', value: stats?.budget, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Command Center</h1>
                <p className="text-slate-500 font-medium">Your financial ecosystem at a glance.</p>
            </header>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryItems.map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.label} 
                        className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-700 transition-all shadow-xl group"
                    >
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">{item.label}</p>
                        <p className={`text-3xl font-black ${item.color}`}>₹{item.value?.toLocaleString() || '0'}</p>
                        <div className={`h-1 w-10 mt-4 rounded-full ${item.bg}`}></div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8">Monthly Cashflow Trend</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts?.trendData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8">Spending by Category</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts?.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {charts?.categoryData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent Activity</h3>
                    <button className="text-xs font-bold text-indigo-500 hover:underline uppercase tracking-widest">View History →</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <th className="pb-4">Transaction</th>
                                <th className="pb-4">Category</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {stats?.recent.map((tx) => (
                                <tr key={tx._id} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 font-bold text-white text-sm">{tx.title}</td>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase">{tx.category}</span>
                                    </td>
                                    <td className="py-4 text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className={`py-4 text-sm font-black text-right ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;