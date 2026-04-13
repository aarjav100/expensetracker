import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useWallet from '../Hooks/useWallet';
import api from '../Services/api';
import AddMoneyDrawer from '../Components/wallet/AddMoneyDrawer';
import WithdrawDrawer from '../Components/wallet/WithdrawDrawer';
import PayDrawer from '../Components/wallet/PayDrawer';
import TransferDrawer from '../Components/wallet/TransferDrawer';
import TransactionDetailDrawer from '../Components/wallet/TransactionDetailDrawer';
import PinModal from '../Components/wallet/PinModal';

function WalletPage() {
    const { balance, wallet, stats, isLocked, toggleLock, setPin, isLoading } = useWallet();
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ type: 'All', status: 'All' });
    
    // UI States
    const [drawers, setDrawers] = useState({
        add: false,
        withdraw: false,
        pay: false,
        transfer: false,
        detail: null
    });
    const [isSetPinModalOpen, setIsSetPinModalOpen] = useState(false);
    const [isPinVerifyOpen, setIsPinVerifyOpen] = useState(false);
    const [pinAction, setPinAction] = useState(null); // 'unlock'

    useEffect(() => {
        fetchTransactions();
    }, [filters, pagination.page]);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/wallet/transactions', {
                params: { page: pagination.page, ...filters }
            });
            setTransactions(res.data.transactions);
            setPagination(prev => ({ ...prev, totalPages: res.data.totalPages }));
        } catch (error) {
            console.error("Failed to fetch wallet transactions", error);
        }
    };

    const handleLockToggle = () => {
        if (!wallet?.pin) {
            setIsSetPinModalOpen(true);
            return;
        }
        setIsPinVerifyOpen(true);
        setPinAction('toggle-lock');
    };

    const handlePinSuccess = async (pin) => {
        if (pinAction === 'toggle-lock') {
            await toggleLock(pin);
        }
        setIsPinVerifyOpen(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">My Wallet</h1>
                        <p className="text-slate-500 font-medium">Manage your digital funds, transfers, and payments.</p>
                    </div>
                    
                    <button 
                        onClick={handleLockToggle}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all border ${
                            isLocked 
                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 hover:bg-rose-500/20' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>{isLocked ? '🔒 WALLET LOCKED' : '🔓 WALLET ACTIVE'}</span>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isLocked ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Balance Card (Left/Main) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl">
                            {/* Decorative elements */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div>
                                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mb-4">Total Balance</p>
                                    <h2 className="text-7xl font-black text-white tracking-tighter flex items-center gap-4">
                                        <span className="text-indigo-500">₹</span>
                                        {balance.toLocaleString()}
                                    </h2>
                                    <div className="mt-6 flex items-center gap-3">
                                        <span className="px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-400/20">
                                            SpendCoins Badge: GOLD
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={() => setDrawers({...drawers, add: true})}
                                        className="h-20 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>+</span> Add
                                    </button>
                                    <button 
                                        onClick={() => setDrawers({...drawers, withdraw: true})}
                                        className="h-20 px-8 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-black uppercase tracking-widest text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>↓</span> Withdraw
                                    </button>
                                    <button 
                                        onClick={() => setDrawers({...drawers, pay: true})}
                                        className="h-20 px-8 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-black uppercase tracking-widest text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>💳</span> Pay
                                    </button>
                                    <button 
                                        onClick={() => setDrawers({...drawers, transfer: true})}
                                        className="h-20 px-8 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-black uppercase tracking-widest text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>✈</span> Transfer
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions Table */}
                        <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 overflow-hidden">
                            <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h3 className="text-xl font-black uppercase tracking-tight">Transaction History</h3>
                                <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                                    {['All', 'Credit', 'Debit', 'Transfer'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => { setFilters({...filters, type: t}); setPagination({...pagination, page: 1}); }}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.type === t ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900 border-b border-slate-800">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date / Time</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {transactions.map(tx => (
                                            <tr 
                                                key={tx._id} 
                                                onClick={() => setDrawers({...drawers, detail: tx})}
                                                className="hover:bg-indigo-500/5 cursor-pointer transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <p className="text-white font-bold text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-slate-500 text-[10px] uppercase font-medium">{new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                                                            tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                        }`}>
                                                            {tx.type === 'credit' ? '↓' : tx.type === 'transfer' ? '✈' : '↑'}
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-200 font-bold text-sm group-hover:text-white">{tx.description}</p>
                                                            <p className="text-slate-500 text-[10px] uppercase font-black">{tx.method}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-8 py-6 text-right font-black text-lg ${
                                                    tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'
                                                }`}>
                                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {transactions.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center text-slate-500 font-medium">No transactions found for this period.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-8 border-t border-slate-800 flex justify-center gap-4">
                                <button 
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                                    className="px-6 py-2 bg-slate-800 rounded-xl text-xs font-bold disabled:opacity-30 transition-all hover:bg-slate-700"
                                >
                                    PREVIOUS
                                </button>
                                <span className="flex items-center text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button 
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                                    className="px-6 py-2 bg-slate-800 rounded-xl text-xs font-bold disabled:opacity-30 transition-all hover:bg-slate-700"
                                >
                                    NEXT
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Sidebar (Right) */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-800 space-y-8">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Quick Activity</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">💰</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Added (Month)</p>
                                            <p className="text-white font-bold">₹{stats.totalAdded.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">📉</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Spent (Month)</p>
                                            <p className="text-white font-bold">₹{stats.totalSpent.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">🏦</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Withdrawn</p>
                                            <p className="text-white font-bold">₹{stats.totalWithdrawn.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">⌛</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Pending</p>
                                            <p className="text-white font-bold">{stats.pendingTransactions} Transactions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/10">
                            <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-70">Security Status</h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-3xl">🛡️</div>
                                <div>
                                    <p className="font-bold">PIN Protection</p>
                                    <p className="text-xs opacity-70 leading-relaxed font-medium">Bcrypt hashed security for sensitive operations.</p>
                                </div>
                            </div>
                            {!wallet?.pin && (
                                <button 
                                    onClick={() => setIsSetPinModalOpen(true)}
                                    className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase transition-all hover:bg-indigo-50"
                                >
                                    SET SECURITY PIN
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Drawers & Modals */}
            <AddMoneyDrawer isOpen={drawers.add} onClose={() => setDrawers({...drawers, add: false})} />
            <WithdrawDrawer isOpen={drawers.withdraw} onClose={() => setDrawers({...drawers, withdraw: false})} />
            <PayDrawer isOpen={drawers.pay} onClose={() => setDrawers({...drawers, pay: false})} />
            <TransferDrawer isOpen={drawers.transfer} onClose={() => setDrawers({...drawers, transfer: false})} />
            <TransactionDetailDrawer 
                isOpen={!!drawers.detail} 
                onClose={() => setDrawers({...drawers, detail: null})} 
                transaction={drawers.detail}
            />

            <PinModal 
                isOpen={isPinVerifyOpen}
                onClose={() => setIsPinVerifyOpen(false)}
                onSuccess={handlePinSuccess}
                title="Verify Security PIN"
                subtitle="Enter your PIN to toggle the wallet lock state"
            />

            <PinModal 
                isOpen={isSetPinModalOpen}
                onClose={() => setIsSetPinModalOpen(false)}
                onSuccess={async (pin) => await setPin(pin)}
                title="Set New Wallet PIN"
                subtitle="Choose a secure 6-digit PIN to protect your wallet funds"
            />
        </div>
    );
}

export default WalletPage;
