import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SIDEBAR_LINKS = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Add Expense', path: '/add-expense', icon: '➕' },
  { name: 'History', path: '/history', icon: '📜' },
  { name: 'Budget Planner', path: '/budget', icon: '🎯' },
  { name: 'AI Predictions', path: '/prediction', icon: '🤖' },
  { name: 'Wallet', path: '/wallet', icon: '💳' },
  { name: 'Reports', path: '/reports', icon: '📑' },
  { name: 'Store', path: '/store', icon: '🎁' },
  { name: 'Profile', path: '/profile', icon: '👤' },
];

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-8">
        <h1 className="text-2xl font-black text-white italic tracking-tighter">
          SPEND<span className="text-indigo-500">WISE</span>.
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto">
        {SIDEBAR_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-sm uppercase tracking-wide">{link.name}</span>
          </NavLink>
        ))}
      </div>

      {/* User & Logout */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-white font-black border border-indigo-500/30">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black truncate">Premium Account</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full py-3 bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700 hover:border-rose-400"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
