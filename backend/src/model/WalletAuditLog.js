import mongoose from 'mongoose';

const walletAuditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auth',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: ['PIN_VERIFIED', 'PIN_FAILED', 'WALLET_LOCKED', 'WALLET_UNLOCKED', 'PIN_SET', 'PIN_UPDATED']
    },
    ip: String,
    userAgent: String,
    success: {
        type: Boolean,
        default: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const WalletAuditLog = mongoose.model('WalletAuditLog', walletAuditLogSchema);
export default WalletAuditLog;
