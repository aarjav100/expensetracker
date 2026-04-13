import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useWallet from '../../Hooks/useWallet';
import PinModal from './PinModal';

const CATEGORIES = [
    { value: 'Food', label: 'Food & Dining', icon: '🍲' },
    { value: 'Transport', label: 'Transport', icon: '🚗' },
    { value: 'Housing', label: 'Housing', icon: '🏠' },
    { value: 'Health', label: 'Health', icon: '💊' },
    { value: 'Shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'Investment', label: 'Investment', icon: '📈' },
    { value: 'Other', label: 'Other', icon: '✨' },
];

function PayDrawer({ isOpen, onClose }) {
    const { pay, balance } = useWallet();
    const [loading, setLoading] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        title: '',
        category: 'Food',
        description: ''
    });

    const handlePayClick = (e) => {
        e.preventDefault();
        if (!formData.amount || formData.amount > balance) {
            return toast.error("Invalid amount or insufficient balance");
        }
        setIsPinModalOpen(true);
    };

    const handlePinSuccess = async (pin) => {
        setLoading(true);
        try {
            await pay({ ...formData, amount: Number(formData.amount), pin });
            toast.success("Payment successful!");
            onClose();
            setFormData({ amount: '', title: '', category: 'Food', description: '' });
        } catch {
            // Error handled by context
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 z-[110] flex justify-end">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="relative w-full max-w-md bg-slate-800 h-full shadow-2xl flex flex-col border-l border-slate-700"
                    >
                        <div className="p-8 border-b border-slate-700">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Pay with Wallet</h2>
                            <p className="text-slate-400 font-medium">Instantly pay for an expense using your balance.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form onSubmit={handlePayClick} className="space-y-6">
                                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                                    <p className="text-xs text-emerald-400 font-bold uppercase mb-1">Current Balance</p>
                                    <p className="text-2xl font-black text-white">₹{balance.toLocaleString()}</p>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                                        <input 
                                            type="number" 
                                            required
                                            max={balance}
                                            value={formData.amount}
                                            onChange={e => setFormData({...formData, amount: e.target.value})}
                                            placeholder="0.00"
                                            className="w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white text-2xl font-black outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">What is this for?</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            placeholder="e.g. Starbucks, Amazon Order"
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Category</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, category: cat.value})}
                                                    className={`p-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${formData.category === cat.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                                >
                                                    <span>{cat.icon}</span>
                                                    <span>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description (Optional)</label>
                                        <textarea 
                                            value={formData.description}
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            placeholder="Any extra notes..."
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-indigo-500 min-h-[100px] resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.amount}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        PAY ₹{formData.amount || '0'} NOW
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            <PinModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                onSuccess={handlePinSuccess}
                title="Verify Wallet PIN"
                subtitle={`Authorize payment of ₹${formData.amount} for "${formData.title}"`}
            />
        </>
    );
}

export default PayDrawer;
