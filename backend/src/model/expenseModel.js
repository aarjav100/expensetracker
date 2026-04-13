import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'auth'
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01 // must be positive
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now,
            required: true
        },
        type: {
            type: String,
            enum: ['income', 'expense'],
            default: 'expense'
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'upi', 'bank', 'other'],
            default: 'other'
        },
        notes: {
            type: String,
            trim: true
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        receiptUrl: {
            type: String
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        recurringInterval: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly', 'none'],
            default: 'none'
        },
        lastRecurringGenerated: {
            type: Date
        }
    },
    { timestamps: true }
);

const expenseModel = mongoose.model('Expense', expenseSchema);

export default expenseModel;