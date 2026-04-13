import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'auth'
    },
    lenderName: {
        type: String,
        required: true,
        trim: true
    },
    principalAmount: {
        type: Number,
        required: true
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number, // Annual percentage rate
        default: 0
    },
    minimumPayment: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'paid_off'],
        default: 'active'
    }
}, { timestamps: true });

export default mongoose.model('Debt', debtSchema);
