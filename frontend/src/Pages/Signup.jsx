// pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        course: "",
        department: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/signup/authregister", formData);
            localStorage.setItem("userInfo", JSON.stringify({
                token: res.data.token,
                ...res.data.user
            }));
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700/50">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Join us to manage your expenses better
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                        />

                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                        <select
                            name="course"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={formData.course}
                            onChange={handleChange}
                        >
                            <option value="" disabled className="bg-slate-800">Select Course</option>
                            <option value="b.tech" className="bg-slate-800">B.Tech</option>
                            <option value="m.tech" className="bg-slate-800">M.Tech</option>
                        </select>

                        <select
                            name="department"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={formData.department}
                            onChange={handleChange}
                        >
                            <option value="" disabled className="bg-slate-800">Select Department</option>
                            <option value="cse" className="bg-slate-800">CSE</option>
                            <option value="ece" className="bg-slate-800">ECE</option>
                            <option value="mech" className="bg-slate-800">Mech</option>
                            <option value="civil" className="bg-slate-800">Civil</option>
                            <option value="eee" className="bg-slate-800">EEE</option>
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <span className="text-slate-400 text-sm">Already have an account? </span>
                        <button 
                            type="button"
                            onClick={() => navigate('/login')}
                            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;