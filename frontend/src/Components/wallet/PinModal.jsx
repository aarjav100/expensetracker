import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function PinModal({ isOpen, onClose, onSuccess, title = "Enter PIN", subtitle }) {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [showPin, setShowPin] = useState(false);
    const inputs = useRef([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '', '', '']);
            setTimeout(() => inputs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleSubmit = async () => {
        const fullPin = pin.join('');
        if (fullPin.length !== 6) return;

        setLoading(true);
        try {
            await onSuccess(fullPin);
            onClose();
        } catch {
            setPin(['', '', '', '', '', '']);
            inputs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm w-full overflow-hidden"
                >
                    {/* Security Pattern/Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

                    <div className="text-center mb-10">
                        <motion.div 
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-indigo-500/20"
                        >
                            🛡️
                        </motion.div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{title}</h2>
                        <p className="text-slate-500 text-sm font-medium mt-3 px-4 leading-relaxed">
                            {subtitle || "Please enter your 6-digit wallet security PIN to authorize this action."}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="flex justify-between gap-2 mb-4">
                            {pin.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputs.current[i] = el}
                                    type={showPin ? "text" : "password"}
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-3xl font-black bg-slate-950 border-2 border-slate-800 rounded-2xl text-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            ))}
                        </div>
                        
                        <div className="flex justify-end mb-8">
                            <button 
                                onClick={() => setShowPin(!showPin)}
                                className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                {showPin ? "👁️ Hide PIN" : "👁️ Show PIN"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || pin.join('').length !== 6}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                        >
                            {loading ? "VERIFYING..." : "CONFIRM PIN"}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all"
                        >
                            CANCEL
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default PinModal;
