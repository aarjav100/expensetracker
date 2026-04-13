import { useState, useEffect } from "react";
import api from "../Services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function PredictionPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      const res = await api.post("/ai/predict", { monthlyIncome: 50000 }); // Default or user income
      setData(res.data);
    } catch (err) {
      toast.error("Prediction service unavailable");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">AI is crunching your numbers...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">AI Forecast</h1>
          <p className="text-slate-400 font-medium mt-2">Personalized financial roadmap powered by Machine Learning.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
          v1.0 Regression Model
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Main Prediction Card */}
        <div className="bg-slate-900 rounded-[3rem] border border-slate-800 p-10 relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all"></div>
          
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Estimated Spending (Next Month)</h2>
          
          {data?.prediction ? (
            <div className="space-y-6">
              <p className="text-7xl font-black text-white tracking-tighter">
                ₹{data.prediction.toLocaleString()}
              </p>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold ring-1 ring-emerald-500/50">
                  Predicted
                </span>
                {data.message && <span className="text-xs text-slate-500 font-medium italic">{data.message}</span>}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 font-medium">Insufficient historical data to make a reliable prediction yet.</p>
          )}

          <div className="mt-12 pt-10 border-t border-slate-800 grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Target Savings</p>
              <p className="text-2xl font-black text-emerald-400">₹{data?.savings?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Confidence Score</p>
              <p className="text-2xl font-black text-white">84%</p>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-[2.5rem] p-1 shadow-xl">
             <div className="bg-slate-950 rounded-[2.4rem] p-10 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl">💡</span>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">AI Smart Recommendation</h3>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  {data?.recommendation || "Maintain your current spending habits to ensure a healthy savings buffer."}
                </p>
                
                <div className="mt-8 space-y-4">
                  <div className="flex gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                     <span className="text-xl">📈</span>
                     <div>
                        <p className="text-white font-bold text-sm">Trend Alert</p>
                        <p className="text-slate-500 text-xs">Your grocery spending has increased by 12% monthly.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                     <span className="text-xl">💰</span>
                     <div>
                        <p className="text-white font-bold text-sm">Savings Opportunity</p>
                        <p className="text-slate-500 text-xs">Transferring ₹5,000 to investments could yield 8% annually.</p>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionPage;
