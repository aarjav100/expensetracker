import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import toast from "react-hot-toast";

function AddExpense() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        type: "expense",
        paymentMethod: "cash",
        notes: "",
        tags: "",
        isRecurring: false,
        recurringInterval: "none",
    });

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.amount || !formData.category) {
            toast.error("Please fill out all required fields.");
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (file) {
            data.append('receipt', file);
        }

        setLoading(true);
        try {
            await api.post("/expense", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Entry added successfully!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add entry");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-8 text-white">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Add New Entry</h2>
                    <p className="opacity-80 font-medium">Capture a new transaction for your personal ledger.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Primary Type Toggle */}
                    <div className="flex bg-slate-900 p-1 rounded-2xl w-fit border border-slate-700">
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, type: 'expense'})}
                            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            EXPENSE
                        </button>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, type: 'income'})}
                            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            INCOME
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Rent, Groceries, Salary..."
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Amount *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            required
                                            value={formData.amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Category *</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Food">Food & Dining</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Housing">Housing</option>
                                    <option value="Health">Health</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Investment">Investment</option>
                                    <option value="Income">Salary/Income</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['cash', 'card', 'upi', 'bank'].map(m => (
                                        <button 
                                            key={m}
                                            type="button"
                                            onClick={() => setFormData({...formData, paymentMethod: m})}
                                            className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all ${formData.paymentMethod === m ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Receipt (Optional)</label>
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                    />
                                    <div className="w-full px-4 py-3 bg-slate-900 border border-dashed border-slate-700 rounded-xl text-slate-400 text-sm group-hover:border-indigo-500 transition-all flex items-center gap-2">
                                        <span className="text-xl">📁</span>
                                        {file ? file.name : "Click to upload receipt photo"}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="isRecurring"
                                        checked={formData.isRecurring}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500" 
                                    />
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">Set as Recurring</span>
                                </label>
                                
                                {formData.isRecurring && (
                                    <select 
                                        name="recurringInterval"
                                        value={formData.recurringInterval}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none"
                                    >
                                        <option value="daily">Every Day</option>
                                        <option value="weekly">Every Week</option>
                                        <option value="monthly">Every Month</option>
                                        <option value="yearly">Every Year</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Additional Notes</label>
                        <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Add specifics about this transaction..."
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? "PROCESSING..." : "SAVE TRANSACTION"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddExpense;