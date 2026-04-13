import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function TransactionDetailDrawer({ isOpen, onClose, transaction }) {
    if (!isOpen || !transaction) return null;

    const downloadReceipt = () => {
        const doc = new jsPDF();
        
        // Add logo/title
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text("SpendWise Wallet", 20, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Official Transaction Receipt", 20, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
        
        // Transaction Box
        doc.setDrawColor(200);
        doc.rect(20, 45, 170, 80);
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Reference ID:`, 25, 55);
        doc.setFont("helvetica", "bold");
        doc.text(transaction.referenceId, 60, 55);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Status:`, 25, 65);
        doc.text(transaction.status.toUpperCase(), 60, 65);
        
        doc.text(`Type:`, 25, 75);
        doc.text(transaction.type.toUpperCase(), 60, 75);
        
        doc.text(`Method:`, 25, 85);
        doc.text(transaction.method.toUpperCase(), 60, 85);
        
        doc.text(`Amount:`, 25, 95);
        doc.setFont("helvetica", "bold");
        doc.text(`INR ${transaction.amount.toFixed(2)}`, 60, 95);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Date:`, 25, 105);
        doc.text(new Date(transaction.createdAt).toLocaleString(), 60, 105);
        
        doc.text(`Balance After:`, 25, 115);
        doc.text(`INR ${transaction.balanceAfter.toFixed(2)}`, 60, 115);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("This is a computer-generated receipt and does not require a signature.", 105, 140, { align: 'center' });
        
        doc.save(`SpendWise_Receipt_${transaction.referenceId}.pdf`);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex justify-end">
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
                    className="relative w-full max-w-lg bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-800"
                >
                    <div className="p-8 border-b border-slate-800 bg-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                transaction.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                                {transaction.status}
                            </span>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">✕</button>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </h2>
                        <p className="text-slate-400 font-medium">{transaction.description}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Reference ID</h4>
                                <p className="text-white font-mono text-sm break-all">{transaction.referenceId}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Timestamp</h4>
                                <p className="text-white font-medium text-sm">{new Date(transaction.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payment Method</h4>
                                <p className="text-white font-medium text-sm uppercase">{transaction.method}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Transaction Type</h4>
                                <p className="text-white font-medium text-sm uppercase">{transaction.type}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700/50 space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-3">
                                <span className="text-slate-500 font-medium">Balance Before</span>
                                <span className="text-white font-bold">₹{transaction.balanceBefore.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Balance After</span>
                                <span className="text-indigo-400 font-black text-lg">₹{transaction.balanceAfter.toLocaleString()}</span>
                            </div>
                        </div>

                        {transaction.metadata && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Metadata Details</h4>
                                <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/30 grid grid-cols-1 gap-4">
                                    {Object.entries(transaction.metadata).filter(([_,v]) => v).map(([k,v]) => (
                                        <div key={k} className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="text-xs text-white font-bold">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-slate-800">
                        <button
                            onClick={downloadReceipt}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors border border-slate-700 shadow-xl"
                        >
                            <span className="text-xl">📄</span>
                            DOWNLOAD RECEIPT (PDF)
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default TransactionDetailDrawer;
