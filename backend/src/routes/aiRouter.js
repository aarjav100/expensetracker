import express from 'express';
import { generateBudgetPlan, predictExpenses } from '../controllers/aiController.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

router.use(protect); // Ensure user is authenticated

// Output AI Budget plan
router.post('/budget', generateBudgetPlan);

// Predict future expenses
router.post('/predict', predictExpenses);

export default router;
