import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function MockBank() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const session = searchParams.get('session');

    const handleApprove = () => {
        setLoading(true);
        setTimeout(() => {
            toast.success("Payment approved by bank!");
            navigate('/wallet?status=success');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-indigo-700 p-8 text-white text-center">
                    <h1 className="text-2xl font-bold italic tracking-tight">UNIVERSAL SECURE BANK</h1>
                    <p className="text-indigo-200 text-xs mt-1 uppercase tracking-widest font-bold">Net Banking Portal</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div>
                            <p className="text-[10px] font-black text-amber-700 uppercase">Secure Session</p>
                            <p className="text-amber-900 font-mono text-xs">{session || 'SB-9923-XZL'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User ID</label>
                            <input type="text" value="spendwise_user_01" disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-bold outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Password</label>
                            <input type="password" value="••••••••" disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-bold outline-none" />
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={handleApprove}
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                        >
                            {loading ? "PROCESSING..." : "APPROVE PAYMENT"}
                        </button>
                        <button
                            onClick={() => navigate('/wallet?status=cancelled')}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                        >
                            CANCEL
                        </button>
                    </div>

                    <p className="text-[10px] text-center text-slate-400 italic">This is a simulated bank portal for demonstration purposes.</p>
                </div>
            </div>
        </div>
    );
}

export default MockBank;
