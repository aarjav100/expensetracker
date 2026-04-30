import express from 'express';
import { getBudget, updateBudget } from '../controllers/budgetController.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBudget);
router.post('/', updateBudget);

export default router;
