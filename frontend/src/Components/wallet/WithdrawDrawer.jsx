import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useWallet from '../../Hooks/useWallet';
import PinModal from './PinModal';

function WithdrawDrawer({ isOpen, onClose }) {
    const { withdraw, balance, verifyPin } = useWallet();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        amount: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolder: ''
    });

    const handleWithdrawClick = (e) => {
        e.preventDefault();
        if (!formData.amount || formData.amount > balance) {
            return toast.error("Invalid amount or insufficient balance");
        }
        setIsPinModalOpen(true);
    };

    const handlePinSuccess = async (pin) => {
        setLoading(true);
        try {
            await withdraw({
                amount: Number(formData.amount),
                bankDetails: {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                    accountHolder: formData.accountHolder
                },
                pin
            });
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
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
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Withdraw Money</h2>
                            <p className="text-slate-400 font-medium">Transfer funds to your bank account.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {success ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg shadow-amber-500/20">🏦</div>
                                    <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Processing</h3>
                                    <p className="text-slate-400">Your withdrawal is being processed. It usually takes 1-2 business days.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleWithdrawClick} className="space-y-6">
                                    <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 mb-8">
                                        <p className="text-xs text-indigo-400 font-bold uppercase mb-1">Available for Withdrawal</p>
                                        <p className="text-2xl font-black text-white">₹{balance.toLocaleString()}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                                            <input 
                                                type="number" 
                                                required
                                                max={balance}
                                                value={formData.amount}
                                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                                placeholder="Enter amount"
                                                className="w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bank Name</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.bankName}
                                                onChange={e => setFormData({...formData, bankName: e.target.value})}
                                                placeholder="e.g. HDFC Bank"
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none shadow-inner"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Account Number</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.accountNumber}
                                                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                                                placeholder="Account Number"
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none shadow-inner"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">IFSC Code</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={formData.ifscCode}
                                                    onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                                                    placeholder="HDFC0001234"
                                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">A/C Holder Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={formData.accountHolder}
                                                    onChange={e => setFormData({...formData, accountHolder: e.target.value})}
                                                    placeholder="John Doe"
                                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                        >
                                            PROCEED TO WITHDRAW
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            <PinModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                onSuccess={handlePinSuccess}
                title="Verify PIN"
                subtitle={`Authorize withdrawal of ₹${formData.amount} to account ending in ${formData.accountNumber.slice(-4)}`}
            />
        </>
    );
}

export default WithdrawDrawer;
