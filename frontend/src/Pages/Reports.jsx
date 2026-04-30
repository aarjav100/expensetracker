import { useState, useEffect } from "react";
import api from "../Services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function Reports() {
    const [expenses, setExpenses] = useState([]);

    const [aiLoading, setAiLoading] = useState(false);
    const [income, setIncome] = useState("");
    const [aiPlan, setAiPlan] = useState(null);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await api.get("/expense");
            setExpenses(Array.isArray(res.data) ? res.data : res.data?.expenses || []);
        } catch {
            toast.error("Failed to fetch data for reports");
        }
    };

    const downloadCSV = () => {
        const csv = Papa.unparse(expenses);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Expenses_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Export Triggered!");
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(99, 102, 241); // Indigo
        doc.text("SpendWise Monthly Statement", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Summary Table
        const totalExp = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        const totalInc = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
        
        doc.autoTable({
            startY: 40,
            head: [['Summary', 'Amount (INR)']],
            body: [
                ['Total Income', `+ ₹${totalInc.toLocaleString()}`],
                ['Total Expenses', `- ₹${totalExp.toLocaleString()}`],
                ['Net Savings', `₹${(totalInc - totalExp).toLocaleString()}`],
            ],
            theme: 'striped',
            headStyles: { fillStyle: [99, 102, 241] }
        });

        // Transactions Table
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Date', 'Title', 'Category', 'Type', 'Amount']],
            body: expenses.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.title,
                e.category,
                e.type.toUpperCase(),
                `INR ${e.amount}`
            ]),
        });

        doc.save(`SpendWise_Report_${new Date().getMonth()+1}_${new Date().getFullYear()}.pdf`);
        toast.success("Premium PDF Generated!");
    };

    const handleAIBudget = async () => {
        if (!income || income <= 0) {
            toast.error("Please enter your monthly income first.");
            return;
        }

        setAiLoading(true);
        try {
            const res = await api.post("/ai/budget", { monthlyIncome: income });
            setAiPlan(res.data.data);
            toast.success("AI Budget Analysis Ready!");
        } catch (err) {
            toast.error(err.response?.data?.error || "AI Service currently unavailable.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
            <header className="text-center">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Financial Reports & AI</h1>
                <p className="text-slate-400">Generate statements or get AI-powered budget insights.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Section */}
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span>📄</span> Export Center
                    </h2>
                    <p className="text-slate-400 text-sm">Download your complete financial history in pro formats.</p>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={downloadPDF}
                            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-between transition-all group"
                        >
                            <span>Generate Premium PDF</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <button 
                            onClick={downloadCSV}
                            className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold flex items-center justify-between transition-all group"
                        >
                            <span>Export CSV Spreadsheet</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>

                {/* AI Budget Trigger */}
                <div className="bg-slate-800 p-8 rounded-3xl border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-indigo-400 font-bold">AI</span> Budget Maker
                    </h2>
                    <p className="text-slate-400 text-sm">Claude AI analyzes your last 3 months of spending to build the perfect plan.</p>
                    
                    <div className="space-y-4">
                        <input 
                            type="number"
                            placeholder="Enter Monthly Income (e.g. 50000)"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            className="w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                            onClick={handleAIBudget}
                            disabled={aiLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {aiLoading ? "AI ANALYZING DATA..." : "Generate AI Budget"}
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Results Section */}
            <AnimatePresence>
                {aiPlan && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800 border-2 border-indigo-500/50 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold uppercase tracking-tight">AI Financial Analysis</h3>
                            <button onClick={() => setAiPlan(null)} className="opacity-60 hover:opacity-100">✕</button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div>
                                <h4 className="text-indigo-400 font-black uppercase text-xs mb-3 tracking-widest">Executive Summary</h4>
                                <p className="text-slate-200 leading-relaxed font-medium">{aiPlan.analysis}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Object.entries(aiPlan.presets).map(([tier, data]) => (
                                    <div key={tier} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
                                        <h5 className="text-white font-black uppercase text-sm mb-4 border-b border-slate-700 pb-2">{tier} Plan</h5>
                                        <div className="space-y-2">
                                            {Object.entries(data).map(([cat, val]) => (
                                                <div key={cat} className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-500 capitalize">{cat}</span>
                                                    <span className={cat === 'Total' ? 'text-indigo-400 font-bold' : 'text-slate-300'}>₹{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700">
                                <h4 className="text-emerald-400 font-black uppercase text-xs mb-4 tracking-widest">Smart Suggestions</h4>
                                <ul className="space-y-3">
                                    {aiPlan.suggestions.map((s, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Reports;
