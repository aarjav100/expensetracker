// components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import api from "../Services/api";
import useWallet from "../Hooks/useWallet";

function Navbar() {
    const navigate = useNavigate();
    const { balance, isLocked } = useWallet();
    const [points, setPoints] = useState(0);
    const user = localStorage.getItem("userInfo");

    const fetchPoints = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get("/finance/points");
            setPoints(res.data.stats.points);
        } catch (error) {
            console.error("Navbar: Failed to fetch points", error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchPoints(); // eslint-disable-line react-hooks/set-state-in-effect
            // Optional: Set up interval to refresh points or listen for custom events
            const interval = setInterval(fetchPoints, 30000); // refresh every 30s
            return () => clearInterval(interval);
        }
    }, [user, fetchPoints]);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <NavLink to="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                                SpendWise
                            </span>
                        </NavLink>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-1 lg:space-x-4">
                            {[
                                { to: "/", label: "Home" },
                                { to: "/dashboard", label: "Dashboard" },
                                { to: "/add-expense", label: "Add Entry" },
                                { to: "/expenses", label: "History" },
                                { to: "/store", label: "Store" },
                                { to: "/reports", label: "Reports" },
                                { to: "/profile", label: "Profile" }
                            ].map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-md"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Points, Profile & Logout */}
                    <div className="flex items-center gap-3 lg:gap-6">
                        {user && (
                            <div className="flex items-center gap-2">
                                {/* Wallet Chip */}
                                <NavLink 
                                    to="/wallet" 
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all hover:scale-105 ${
                                        isLocked 
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                                        : balance < 500 
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                    }`}
                                >
                                    <span className="text-sm">{isLocked ? '🔒' : '💳'}</span>
                                    <span className="text-sm font-black">₹{balance.toLocaleString()}</span>
                                </NavLink>

                                {/* Points Chip */}
                                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-full pl-3 pr-1 py-1 gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Points</span>
                                    <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                        <span className="text-sm font-black text-amber-400">{points}</span>
                                        <span className="text-[10px] text-amber-500 font-bold">PTS</span>
                                    </div>
                                    <NavLink to="/store" className="text-lg hover:scale-110 transition-transform">💎</NavLink>
                                </div>
                            </div>
                        )}
                        
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-white bg-rose-400/10 hover:bg-rose-500 rounded-lg transition-all"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;