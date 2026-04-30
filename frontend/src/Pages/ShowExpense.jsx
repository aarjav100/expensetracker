import { useEffect, useState } from "react";
import api from "../Services/api";
import { useNavigate } from "react-router-dom";

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const fetchExpenses = async () => {
            try {
                const res = await api.get("/expense");
                if (isMounted) {
                    const allExpenses = Array.isArray(res.data) ? res.data : (res.data?.expenses || []);
                    setExpenses(allExpenses);
                }
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || "Failed to load expenses");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchExpenses();
        return () => { isMounted = false; };
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await api.delete(`/expense/${id}`);
            setExpenses(prevExpenses => prevExpenses.filter(exp => exp._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete expense");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700/50">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">All Expenses</h2>
                    <p className="text-slate-400 mt-1">Review your entire transaction history</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 sm:mt-0 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium shadow-sm transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-slate-900/60 border-b border-slate-700 text-sm font-medium text-slate-300">
                                <th className="p-4 pl-6">Title</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400">
                                        No expenses found. Add your first expense on the Dashboard.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => (
                                    <tr key={exp._id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4 pl-6 font-medium text-white">{exp.title}</td>
                                        <td className="p-4 font-bold text-emerald-400">₹{exp.amount}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {new Date(exp.date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button 
                                                onClick={() => handleDelete(exp._id)}
                                                className="px-3 py-1.5 text-sm font-medium text-rose-100 bg-rose-500/80 hover:bg-rose-500 rounded-lg shadow-sm transition-colors opacity-80 group-hover:opacity-100"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Expenses;