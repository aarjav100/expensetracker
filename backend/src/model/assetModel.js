import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'auth'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['cash', 'bank', 'investment', 'real_estate', 'crypto', 'other'],
        default: 'bank'
    },
    value: {
        type: Number,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Asset', assetSchema);
