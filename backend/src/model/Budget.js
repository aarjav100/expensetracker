import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'auth'
        },
        month: {
            type: Number,
            required: true,
            min: 0,
            max: 11 // 0-indexed for JS Date compatibility
        },
        year: {
            type: Number,
            required: true
        },
        totalLimit: {
            type: Number,
            required: true,
            min: 0
        },
        categoryLimits: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    { timestamps: true }
);

// Ensure a user can only have one budget per month/year
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
