import mongoose from 'mongoose';

const pointTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'auth'
    },
    action: {
        type: String,
        enum: ['earned', 'spent'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    reason: {
        type: String,
        required: true
    },
    referenceId: {
        type: String,
        // Can link to an expense ID or a wallet transaction ID
    }
}, { timestamps: true });

export default mongoose.model('PointTransaction', pointTransactionSchema);
