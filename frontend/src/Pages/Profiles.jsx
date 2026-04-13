import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

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
                const res = await api.get("/expense");
                const allExpenses = Array.isArray(res.data) ? res.data : res.data?.expenses || [];
                setExpenses(allExpenses);
            } catch (error) {
                console.error("Failed to fetch expenses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        navigate("/login");
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
            <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700/50 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
                        {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
                    <p className="text-slate-400 mt-1">Manage your account details</p>
                </div>

                <div className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                        <span className="text-slate-400 font-medium">Name</span>
                        <span className="text-white font-medium">{user?.name || user?.username || "Not available"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                        <span className="text-slate-400 font-medium">Email</span>
                        <span className="text-white font-medium">{user?.email || "Not available"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                        <span className="text-slate-400 font-medium">Course</span>
                        <span className="text-white font-medium">{user?.course || "Not available"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-slate-400 font-medium">Department</span>
                        <span className="text-white font-medium">{user?.department || "Not available"}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center shadow-inner">
                        <p className="text-slate-400 text-sm font-medium mb-2">Total Managed Expenses</p>
                        <p className="text-3xl font-bold text-emerald-400">₹{totalExpenses.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center shadow-inner">
                        <p className="text-slate-400 text-sm font-medium mb-2">Total Transactions</p>
                        <p className="text-3xl font-bold text-amber-400">{expenses.length}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-slate-700">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium shadow-sm transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 py-3 px-6 bg-rose-500/90 hover:bg-rose-500 text-white rounded-xl font-medium shadow-sm transition-colors"
                    >
                        Logout securely
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;