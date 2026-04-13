import { useEffect, useState } from "react";
import api from "../Services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const STORE_ITEMS = [
    { id: 'premium_theme', title: 'Premium report theme', cost: 200, icon: '🎨', desc: 'Unlocks a stylish dark PDF template' },
    { id: 'custom_icons', title: 'Custom category icon pack', cost: 150, icon: '🎭', desc: 'Unlocks 30 extra icons for categories' },
    { id: 'ai_extra', title: 'AI budget analysis (extra)', cost: 100, icon: '🤖', desc: 'Extra AI chat sessions beyond the free limit' },
    { id: 'streak_shield', title: 'Expense streak shield', cost: 80, icon: '🛡️', desc: 'Protects your streak if you miss one day' },
    { id: 'dashboard_widget', title: 'Custom dashboard widget', cost: 300, icon: '📊', desc: 'Unlocks an extra chart on the dashboard' },
    { id: 'profile_badge', title: 'Profile badge', cost: 50, icon: '🏅', desc: '"Budget Master" or "Saver" badge on profile' },
];

function Store() {
    const [points, setPoints] = useState(0);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        try {
            const res = await api.get("/finance/points");
            setPoints(res.data.stats.points);
            setPurchasedItems(res.data.stats.purchasedItems || []);
        } catch (error) {
            console.error("Failed to fetch points", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (item) => {
        if (points < item.cost) {
            toast.error("Not enough points!");
            return;
        }

        if (purchasedItems.includes(item.id)) {
            toast.error("You already own this item!");
            return;
        }

        try {
            // We need a backend route for this. I'll scaffold the call.
            // For now, let's assume /finance/purchase exists or I'll add it soon.
            // await api.post("/finance/purchase", { itemId: item.id, cost: item.cost });
            
            // Temporary success simulation
            toast.success(`Successfully purchased ${item.title}!`);
            setPoints(prev => prev - item.cost);
            setPurchasedItems(prev => [...prev, item.id]);
        } catch (error) {
            toast.error("Purchase failed. Try again later.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium">Entering the rewards store...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-4">Points & Rewards Store</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Earn points by logging expenses, staying under budget, and hitting goals. 
                    Spend them here to unlock premium features and customizations!
                </p>
            </div>

            <div className="bg-slate-800 rounded-3xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between border border-indigo-500/20 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <span className="text-9xl">💎</span>
                </div>
                <div className="mb-6 md:mb-0">
                    <p className="text-indigo-400 font-bold uppercase tracking-wider text-sm mb-1">Your Balance</p>
                    <div className="flex items-center gap-3">
                        <span className="text-5xl font-black text-white">{points}</span>
                        <span className="text-2xl text-amber-400 font-bold">PTS</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 text-center min-w-[120px]">
                        <p className="text-slate-500 text-xs font-medium mb-1 uppercase">Tier</p>
                        <p className="text-white font-bold">Bronze</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 text-center min-w-[120px]">
                        <p className="text-slate-500 text-xs font-medium mb-1 uppercase">Lifetime</p>
                        <p className="text-white font-bold">{points} pts</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {STORE_ITEMS.map((item) => (
                    <motion.div 
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className={`bg-slate-800 border ${purchasedItems.includes(item.id) ? 'border-emerald-500/30 ring-1 ring-emerald-500/30' : 'border-slate-700 hover:border-indigo-500/50'} rounded-3xl p-6 transition-all shadow-lg flex flex-col`}
                    >
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-slate-700 shadow-inner">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-slate-400 text-sm mb-6 flex-grow">{item.desc}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                            <div className="flex items-center gap-1">
                                <span className="text-amber-400 font-bold">{item.cost}</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-tighter">pts</span>
                            </div>
                            {purchasedItems.includes(item.id) ? (
                                <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold flex items-center gap-1">
                                    <span>✓</span> Owned
                                </span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(item)}
                                    disabled={points < item.cost}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        points >= item.cost 
                                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    Purchase
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default Store;
