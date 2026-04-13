import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auth',
        required: true,
        index: true
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit', 'transfer', 'refund', 'cashback'],
        required: true
    },
    method: {
        type: String,
        enum: ['upi', 'card', 'netbanking', 'wallet_balance', 'bank_transfer', 'cash'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'reversed'],
        default: 'pending'
    },
    description: {
        type: String,
        trim: true
    },
    referenceId: {
        type: String,
        unique: true,
        required: true
    },
    metadata: {
        upiId: String,
        cardLast4: String,
        bankName: String,
        orderId: String
    },
    category: {
        type: String // Links to expense category
    },
    linkedExpenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    }
}, {
    timestamps: true
});

// Compound indexes for faster queries
walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ user: 1, status: 1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;
