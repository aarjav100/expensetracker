import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Wallet from '../model/Wallet.js';
import WalletTransaction from '../model/WalletTransaction.js';
import WalletAuditLog from '../model/WalletAuditLog.js';
import Expense from '../model/expenseModel.js';
import { awardPoints } from '../utils/gamification.js';

// Get wallet details
export const getWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });
        
        if (!wallet) {
            // Auto-create wallet on first access
            wallet = await Wallet.create({ user: req.user._id });
        }

        const stats = {
            totalAdded: 0,
            totalSpent: 0,
            totalWithdrawn: 0,
            pendingTransactions: 0
        };

        // Get some basic stats for the dashboard
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const transactions = await WalletTransaction.find({
            user: req.user._id,
            createdAt: { $gte: startOfMonth }
        });

        transactions.forEach(tx => {
            if (tx.status === 'completed') {
                if (tx.type === 'credit') stats.totalAdded += tx.amount;
                if (tx.type === 'debit' && tx.method === 'wallet_balance') stats.totalSpent += tx.amount;
                if (tx.type === 'debit' && tx.method === 'bank_transfer') stats.totalWithdrawn += tx.amount;
            } else if (tx.status === 'pending') {
                stats.pendingTransactions++;
            }
        });

        res.json({ wallet, stats });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching wallet', error: err.message });
    }
};

// Add money to wallet
export const addMoney = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, method, metadata } = req.body;
        const userId = req.user._id;

        if (!amount || amount <= 0) {
            throw new Error('Invalid amount');
        }

        const wallet = await Wallet.findOne({ user: userId }).session(session);
        if (!wallet) throw new Error('Wallet not found');

        const balanceBefore = wallet.balance;
        wallet.balance += Number(amount);
        const balanceAfter = wallet.balance;
        await wallet.save({ session });

        const referenceId = `TXN-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

        const transaction = await WalletTransaction.create([{
            user: userId,
            walletId: wallet._id,
            type: 'credit',
            method: method || 'upi',
            amount: Number(amount),
            balanceBefore,
            balanceAfter,
            status: 'completed',
            description: 'Wallet Top-up',
            referenceId,
            metadata
        }], { session });

        // Points logic
        let points = 0;
        if (amount >= 5000) points = 40;
        else if (amount >= 1000) points = 15;
        else if (amount >= 500) points = 5;

        // Check if first top-up ever
        const txCount = await WalletTransaction.countDocuments({ user: userId, type: 'credit' });
        if (txCount === 0) points += 25;

        if (points > 0) {
            await awardPoints(userId, 'earned', points, 'Wallet Top-up Reward', referenceId);
        }

        await session.commitTransaction();
        res.status(200).json({ wallet, transaction: transaction[0] });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

// Withdraw from wallet
export const withdrawMoney = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, bankDetails } = req.body;
        const userId = req.user._id;

        const wallet = await Wallet.findOne({ user: userId }).session(session);
        if (wallet.balance < amount) throw new Error('Insufficient balance');
        if (wallet.isLocked) throw new Error('Wallet is locked');

        const balanceBefore = wallet.balance;
        wallet.balance -= Number(amount);
        const balanceAfter = wallet.balance;
        await wallet.save({ session });

        const referenceId = `WDL-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

        const transaction = await WalletTransaction.create([{
            user: userId,
            walletId: wallet._id,
            type: 'debit',
            method: 'bank_transfer',
            amount: Number(amount),
            balanceBefore,
            balanceAfter,
            status: 'pending', // Simulate processing delay
            description: `Withdrawal to Bank (A/C: ****${bankDetails.accountNumber.slice(-4)})`,
            referenceId,
            metadata: {
                bankName: bankDetails.bankName,
                accountHolder: bankDetails.accountHolder
            }
        }], { session });

        await session.commitTransaction();

        // Simulate background completion after 2 seconds
        setTimeout(async () => {
            try {
                await WalletTransaction.findOneAndUpdate(
                    { referenceId },
                    { status: 'completed' }
                );
            } catch (err) {
                console.error('Async withdrawal completion failed', err);
            }
        }, 2000);

        res.status(200).json({ wallet, transaction: transaction[0] });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

// Pay expense using wallet
export const payExpense = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, title, category, description } = req.body;
        const userId = req.user._id;

        const wallet = await Wallet.findOne({ user: userId }).session(session);
        if (wallet.balance < amount) throw new Error('Insufficient balance');

        const balanceBefore = wallet.balance;
        wallet.balance -= Number(amount);
        const balanceAfter = wallet.balance;
        await wallet.save({ session });

        // Create the actual expense entry
        const expense = await Expense.create([{
            user: userId,
            title,
            amount: Number(amount),
            category,
            description,
            paymentMethod: 'other', // We treat wallet as other or could add 'wallet' to enum
            notes: `Paid via Wallet`
        }], { session });

        const referenceId = `PAY-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

        const walletTx = await WalletTransaction.create([{
            user: userId,
            walletId: wallet._id,
            type: 'debit',
            method: 'wallet_balance',
            amount: Number(amount),
            balanceBefore,
            balanceAfter,
            status: 'completed',
            description: `Payment for ${title}`,
            referenceId,
            category,
            linkedExpenseId: expense[0]._id
        }], { session });

        // Special points for wallet payment (8 points instead of usual)
        await awardPoints(userId, 'earned', 8, 'Wallet Payment Reward', referenceId);

        await session.commitTransaction();
        res.status(200).json({ wallet, transaction: walletTx[0], expense: expense[0] });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

// Transfer funds to another user
export const transferFunds = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { recipientEmail, amount, note } = req.body;
        const senderId = req.user._id;

        const senderWallet = await Wallet.findOne({ user: senderId }).session(session);
        if (senderWallet.balance < amount) throw new Error('Insufficient balance');

        // Find recipient in authModel (aliased as User in routes if imported that way, but let's use the file)
        const recipientUser = await mongoose.model('auth').findOne({ email: recipientEmail.toLowerCase() });
        if (!recipientUser) throw new Error('Recipient not found');
        if (recipientUser._id.equals(senderId)) throw new Error('Cannot transfer to yourself');

        let recipientWallet = await Wallet.findOne({ user: recipientUser._id }).session(session);
        if (!recipientWallet) {
            recipientWallet = new Wallet({ user: recipientUser._id });
        }

        const senderBalanceBefore = senderWallet.balance;
        senderWallet.balance -= Number(amount);
        const senderBalanceAfter = senderWallet.balance;
        await senderWallet.save({ session });

        const recipientBalanceBefore = recipientWallet.balance;
        recipientWallet.balance += Number(amount);
        const recipientBalanceAfter = recipientWallet.balance;
        await recipientWallet.save({ session });

        const refId = `TRF-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

        // Sender Transaction
        await WalletTransaction.create([{
            user: senderId,
            walletId: senderWallet._id,
            type: 'transfer',
            method: 'wallet_balance',
            amount: Number(amount),
            balanceBefore: senderBalanceBefore,
            balanceAfter: senderBalanceAfter,
            status: 'completed',
            description: `Transfer to ${recipientUser.email}${note ? ': ' + note : ''}`,
            referenceId: `OUT-${refId}`
        }], { session });

        // Recipient Transaction
        await WalletTransaction.create([{
            user: recipientUser._id,
            walletId: recipientWallet._id,
            type: 'credit',
            method: 'wallet_balance',
            amount: Number(amount),
            balanceBefore: recipientBalanceBefore,
            balanceAfter: recipientBalanceAfter,
            status: 'completed',
            description: `Received from ${req.user.email}${note ? ': ' + note : ''}`,
            referenceId: `IN-${refId}`
        }], { session });

        await session.commitTransaction();
        res.json({ message: 'Transfer successful', newBalance: senderWallet.balance });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

// Set or Update PIN
export const setPin = async (req, res) => {
    try {
        const { pin } = req.body;
        const userId = req.user._id;

        if (!pin || pin.length !== 6) {
            return res.status(400).json({ message: 'PIN must be 6 digits' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);

        await Wallet.findOneAndUpdate(
            { user: userId },
            { pin: hashedPin },
            { upsert: true }
        );

        await WalletAuditLog.create({
            user: userId,
            action: 'PIN_SET'
        });

        res.json({ message: 'Wallet PIN set successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verify PIN (stand-alone for UI checks)
export const verifyPin = async (req, res) => {
    // Logic is handled by verifyWalletPin middleware.
    // If it reaches here, it means next() was called.
    res.json({ success: true, message: 'PIN verified' });
};

// Toggle Wallet Lock
export const toggleLock = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) throw new Error('Wallet not found');

        wallet.isLocked = !wallet.isLocked;
        await wallet.save();

        await WalletAuditLog.create({
            user: req.user._id,
            action: wallet.isLocked ? 'WALLET_LOCKED' : 'WALLET_UNLOCKED'
        });

        res.json({ isLocked: wallet.isLocked, message: `Wallet ${wallet.isLocked ? 'locked' : 'unlocked'}` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get Transaction history
export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status } = req.query;
        const query = { user: req.user._id };

        if (type && type !== 'All') query.type = type.toLowerCase();
        if (status && status !== 'All') query.status = status.toLowerCase();

        const transactions = await WalletTransaction.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await WalletTransaction.countDocuments(query);

        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
