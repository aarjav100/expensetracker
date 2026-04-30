import express from 'express';
import {
    addExpense,
    getExpenses,
    getSingleExpense,
    updateExpense,
    deleteExpense
} from '../controllers/expenseController.js';
import { protect } from '../utils/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.use(protect); // Apply to all routes

router.post('/', upload.single('receipt'), addExpense);
router.get('/', getExpenses);
router.get('/:id', getSingleExpense);
router.put('/:id', upload.single('receipt'), updateExpense);
router.delete('/:id', deleteExpense);

export default router;