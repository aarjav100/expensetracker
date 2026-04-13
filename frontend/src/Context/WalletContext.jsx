import { createContext, useState, useEffect, useContext } from 'react';
import api from '../Services/api';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);
    const [wallet, setWallet] = useState(null);
    const [stats, setStats] = useState({
        totalAdded: 0,
        totalSpent: 0,
        totalWithdrawn: 0,
        pendingTransactions: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    const refreshWallet = async () => {
        try {
            const res = await api.get('/wallet');
            setWallet(res.data.wallet);
            setBalance(res.data.wallet.balance);
            setIsLocked(res.data.wallet.isLocked);
            setStats(res.data.stats);
        } catch (error) {
            console.error('WalletContext: Failed to fetch wallet', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            refreshWallet();
            const interval = setInterval(refreshWallet, 30000); // Auto-refresh every 30s
            return () => clearInterval(interval);
        }
    }, []);

    const addMoney = async (data) => {
        try {
            const res = await api.post('/wallet/add-money', data);
            await refreshWallet();
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add money');
            throw error;
        }
    };

    const withdraw = async (data) => {
        try {
            const res = await api.post('/wallet/withdraw', data);
            await refreshWallet();
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Withdrawal failed');
            throw error;
        }
    };

    const pay = async (data) => {
        try {
            const res = await api.post('/wallet/pay', data);
            await refreshWallet();
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed');
            throw error;
        }
    };

    const transfer = async (data) => {
        try {
            const res = await api.post('/wallet/transfer', data);
            await refreshWallet();
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transfer failed');
            throw error;
        }
    };

    const toggleLock = async (pin) => {
        try {
            const res = await api.post('/wallet/toggle-lock', { pin });
            setIsLocked(res.data.isLocked);
            await refreshWallet();
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle lock');
            throw error;
        }
    };

    const verifyPin = async (pin) => {
        try {
            const res = await api.post('/wallet/verify-pin', { pin });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid PIN');
            throw error;
        }
    };

    const setPin = async (pin) => {
        try {
            const res = await api.post('/wallet/set-pin', { pin });
            await refreshWallet();
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set PIN');
            throw error;
        }
    };

    return (
        <WalletContext.Provider value={{
            balance,
            wallet,
            stats,
            isLoading,
            isLocked,
            refreshWallet,
            addMoney,
            withdraw,
            pay,
            transfer,
            toggleLock,
            verifyPin,
            setPin
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
