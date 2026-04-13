import bcrypt from 'bcryptjs';
import Wallet from '../model/Wallet.js';
import WalletAuditLog from '../model/WalletAuditLog.js';

export const verifyWalletPin = async (req, res, next) => {
    try {
        const { pin } = req.body;
        const userId = req.user._id;

        if (!pin) {
            return res.status(400).json({ message: 'PIN is required' });
        }

        const wallet = await Wallet.findOne({ user: userId }).select('+pin');
        
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (wallet.isLocked) {
            return res.status(403).json({ message: 'Wallet is locked. Please contact support.' });
        }

        if (!wallet.pin) {
            return res.status(400).json({ message: 'Wallet PIN not set' });
        }

        const isMatch = await bcrypt.compare(pin, wallet.pin);
        
        // Log the attempt
        await WalletAuditLog.create({
            user: userId,
            action: isMatch ? 'PIN_VERIFIED' : 'PIN_FAILED',
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            success: isMatch
        });

        if (!isMatch) {
            // Check failed attempts in last 1 hour
            const recentFailures = await WalletAuditLog.countDocuments({
                user: userId,
                action: 'PIN_FAILED',
                success: false,
                createdAt: { $gt: new Date(Date.now() - 3600000) }
            });

            if (recentFailures >= 3) {
                wallet.isLocked = true;
                await wallet.save();
                await WalletAuditLog.create({
                    user: userId,
                    action: 'WALLET_LOCKED',
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    success: true
                });
                return res.status(403).json({ message: 'Wallet locked due to 3 failed attempts.' });
            }

            return res.status(401).json({ message: 'Invalid PIN' });
        }

        req.wallet = wallet;
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Error verifying PIN', error: err.message });
    }
};

export const checkWalletLock = async (req, res, next) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (wallet && wallet.isLocked) {
            return res.status(403).json({ message: 'Wallet is locked' });
        }
        req.wallet = wallet;
        next();
    } catch (err) {
        next(err);
    }
};
