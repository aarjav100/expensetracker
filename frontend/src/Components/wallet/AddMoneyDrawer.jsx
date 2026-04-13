import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useWallet from '../../Hooks/useWallet';
import api from '../../Services/api';

function AddMoneyDrawer({ isOpen, onClose }) {
    const { addMoney, refreshWallet } = useWallet();
    const [activeTab, setActiveTab] = useState('upi');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [amount, setAmount] = useState('');
    
    // Legacy simulated states
    const [upiId, setUpiId] = useState('');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [bankName, setBankName] = useState('SBI');

    const handleAddSimulated = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return toast.error("Enter a valid amount");
        
        setLoading(true);
        try {
            const metadata = {
                method: activeTab,
                upiId: activeTab === 'upi' ? upiId : undefined,
                cardLast4: activeTab === 'card' ? cardData.number.slice(-4) : undefined,
                bankName: activeTab === 'netbanking' ? bankName : undefined
            };

            await new Promise(resolve => setTimeout(resolve, 2000));
            await addMoney({ amount: Number(amount), method: activeTab, metadata });
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setAmount('');
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
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
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-md bg-slate-800 h-full shadow-2xl flex flex-col border-l border-slate-700"
                >
                    <div className="p-8 border-b border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Add Money</h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-colors">✕</button>
                        </div>
                        <p className="text-slate-400 font-medium italic">Select a demo method to add funds to your wallet.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {success ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg shadow-emerald-500/20"
                                >
                                    ✓
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">SUCCESS!</h3>
                                <p className="text-slate-400">₹{amount} has been added to your wallet.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Amount to Add</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-indigo-400">₹</span>
                                        <input 
                                            type="number" 
                                            required
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-6 py-6 bg-slate-900 border-2 border-slate-700 rounded-3xl text-4xl font-black text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {[100, 500, 1000, 2000].map(val => (
                                            <button 
                                                key={val}
                                                type="button"
                                                onClick={() => setAmount(val.toString())}
                                                className="px-4 py-2 bg-slate-700 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-300 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-indigo-500/30"
                                            >
                                                +₹{val}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-2 rounded-2xl flex gap-1 border border-slate-700 overflow-x-auto">
                                    {['upi', 'card', 'netbanking'].map(tab => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-700/50">

                                    {activeTab === 'upi' && (
                                        <form onSubmit={handleAddSimulated} className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">UPI ID (Demo)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="username@bank"
                                                    value={upiId}
                                                    onChange={e => setUpiId(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none"
                                                />
                                            </div>
                                            <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all uppercase text-xs tracking-widest">
                                                Simulate UPI Pay
                                            </button>
                                        </form>
                                    )}

                                    {activeTab === 'card' && (
                                        <form onSubmit={handleAddSimulated} className="space-y-4">
                                            <input 
                                                type="text" 
                                                placeholder="Card Number"
                                                maxLength={19}
                                                value={cardData.number}
                                                onChange={e => setCardData({...cardData, number: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none"
                                            />
                                            <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all uppercase text-xs tracking-widest">
                                                Simulate Card Pay
                                            </button>
                                        </form>
                                    )}

                                    {activeTab === 'netbanking' && (
                                        <form onSubmit={handleAddSimulated} className="space-y-4 text-center">
                                            <p className="text-slate-400 text-xs italic">Demo NetBanking simulation.</p>
                                            <button className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all uppercase text-xs tracking-widest">
                                                Simulate Bank Pay
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default AddMoneyDrawer;
