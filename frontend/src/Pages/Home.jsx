import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem("userInfo");
        if (user) navigate("/dashboard");
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 relative overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full"></div>

            <div className="relative z-10 w-full max-w-lg p-8 sm:p-12 text-center bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50">
                <div className="mb-8">
                    <span className="text-5xl mb-4 block animate-bounce">💰</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
                        ExpenseTracker
                    </h1>
                    <p className="mt-4 text-slate-400 text-lg">
                        Smart tracking for smarter spending. Master your personal finances effortlessly.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    <button
                        onClick={() => navigate("/login")}
                        className="flex-1 py-3 px-6 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Get Started
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-8 z-10 text-slate-500 text-sm">
                Built to scale safely & securely.
            </div>
        </div>
    );
}

export default Home;