import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auth',
        unique: true,
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    pin: {
        type: String,
        select: false // Hashed with bcrypt
    }
}, {
    timestamps: true
});

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
