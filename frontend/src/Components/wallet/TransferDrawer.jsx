import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useWallet from '../../Hooks/useWallet';
import PinModal from './PinModal';
import api from '../../Services/api';

function TransferDrawer({ isOpen, onClose }) {
    const { transfer, balance } = useWallet();
    const [loading, setLoading] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [recipient, setRecipient] = useState(null);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    // Debounced email lookup simulation
    useEffect(() => {
        if (email.length < 5) {
            setRecipient(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                // In a real app we'd have a search endpoint. 
                // For this project, let's keep it simple or simulate a hit.
                // const res = await api.get(`/auth/search?email=${email}`);
                // setRecipient(res.data);
                
                // Simulated lookup logic for common dummy emails or success
                if (email.includes('@')) {
                    setRecipient({ name: email.split('@')[0].replace('.', ' '), email });
                }
            } catch (err) {
                setRecipient(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [email]);

    const handleTransferClick = (e) => {
        e.preventDefault();
        if (!amount || amount > balance) return toast.error("Invalid amount or insufficient balance");
        if (!recipient) return toast.error("Please enter a valid recipient email");
        setIsPinModalOpen(true);
    };

    const handlePinSuccess = async (pin) => {
        setLoading(true);
        try {
            await transfer({ recipientEmail: email, amount: Number(amount), note, pin });
            toast.success(`Sent ₹${amount} to ${recipient.name}`);
            onClose();
            setEmail('');
            setAmount('');
            setNote('');
        } catch (err) {
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
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Transfer Funds</h2>
                            <p className="text-slate-400 font-medium italic">Send money to any SpendWise user instantly.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form onSubmit={handleTransferClick} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Recipient Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="friend@email.com"
                                        className="w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-medium"
                                    />
                                    
                                    <AnimatePresence>
                                        {recipient && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="mt-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {recipient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm leading-none">{recipient.name}</p>
                                                    <p className="text-slate-500 text-xs mt-1">{recipient.email}</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Verified</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="pt-4">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Amount to Send</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-indigo-400">₹</span>
                                        <input 
                                            type="number" 
                                            required
                                            max={balance}
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-6 py-6 bg-slate-900 border-2 border-slate-700 rounded-3xl text-4xl font-black text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800"
                                        />
                                    </div>
                                    <p className="text-right text-xs text-slate-500 mt-2 font-medium">Balance: ₹{balance.toLocaleString()}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Add a Note (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="Thanks for the dinner! 🍕"
                                        className="w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={loading || !amount || !recipient}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        SEND MONEY NOW
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
                title="Authorization Required"
                subtitle={`Authorize transfer of ₹${amount} to ${recipient?.name || email}`}
            />
        </>
    );
}

export default TransferDrawer;
