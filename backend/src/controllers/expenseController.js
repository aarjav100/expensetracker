import expenseModel from '../model/expenseModel.js';
import mongoose from 'mongoose';
import { awardPoints } from '../utils/gamification.js';

// Helper to validate input
const validateExpenseInput = (title, amount, category, date) => {
    if (!title || !title.trim()) return "Title is required";
    if (amount === undefined || amount === null || amount <= 0) return "Amount must be greater than 0";
    if (!category || !category.trim()) return "Category is required";
    
    if (date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return "Invalid date format";
        if (parsedDate > new Date()) return "Expense date cannot be in the future";
    }
    
    return null; // Valid
};

// ➤ Add Expense (with Gamification & Receipt Uploads)
export const addExpense = async (req, res) => {
    try {
        const { title, amount, description, category, date, type, paymentMethod, notes, tags, isRecurring, recurringInterval } = req.body;

        const validationError = validateExpenseInput(title, amount, category, date);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Process Multer Receipt if present
        let receiptUrl = '';
        if (req.file) {
            receiptUrl = `/uploads/receipts/${req.file.filename}`;
        }

        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                parsedTags = tags.split(',').map(tag => tag.trim());
            }
        }

        const newExpense = await expenseModel.create({
            title: title.trim(),
            amount,
            description: description?.trim(),
            category: category.trim(),
            date: date ? new Date(date) : new Date(),
            user: req.user._id,
            type: type || 'expense',
            paymentMethod: paymentMethod || 'other',
            notes: notes?.trim(),
            tags: parsedTags,
            receiptUrl,
            isRecurring: isRecurring === 'true' || isRecurring === true,
            recurringInterval: recurringInterval || 'none'
        });

        // Gamification Phase
        // Base points: 10 points for logging anything
        await awardPoints(req.user._id, 'earned', 10, 'Logged a new transaction', newExpense._id);

        // Receipt points: 5 bonus points
        if (receiptUrl) {
            await awardPoints(req.user._id, 'earned', 5, 'Uploaded a receipt bonus', newExpense._id);
        }

        return res.status(201).json({
            message: "Expense added successfully",
            expense: newExpense
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error adding expense",
            error: err.message
        });
    }
};

// ➤ Get All Expenses
export const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseModel.find({ user: req.user._id }).sort({ date: -1 });

        return res.status(200).json({
            message: "Expenses fetched successfully",
            expenses
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching expenses",
            error: err.message
        });
    }
};

// ➤ Get Single Expense
export const getSingleExpense = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Invalid Expense ID" });
        }

        const expense = await expenseModel.findOne({ _id: req.params.id, user: req.user._id });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        return res.status(200).json({
            message: "Expense fetched successfully",
            expense
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching expense",
            error: err.message
        });
    }
};

// ➤ Update Expense
export const updateExpense = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Invalid Expense ID" });
        }

        const { title, amount, description, category, date } = req.body;

        const validationError = validateExpenseInput(title, amount, category, date);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { 
                title: title.trim(), 
                amount, 
                description: description?.trim(), 
                category: category.trim(), 
                date: date ? new Date(date) : new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                message: "Expense not found or unauthorized to update"
            });
        }

        return res.status(200).json({
            message: "Expense updated successfully",
            expense: updatedExpense
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error updating expense",
            error: err.message
        });
    }
};

// ➤ Delete Expense
export const deleteExpense = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: "Invalid Expense ID" });
        }

        const deletedExpense = await expenseModel.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!deletedExpense) {
            return res.status(404).json({
                message: "Expense not found or unauthorized to delete"
            });
        }

        return res.status(200).json({
            message: "Expense deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error deleting expense",
            error: err.message
        });
    }
};