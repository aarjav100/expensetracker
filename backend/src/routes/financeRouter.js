import express from 'express';
import { protect } from '../utils/authMiddleware.js';
import { 
    getPointTransactions, 
    addDebt, 
    getDebts, 
    addAsset, 
    getAssets 
} from '../controllers/financeController.js';

const router = express.Router();

router.use(protect);

// Points
router.get('/points', getPointTransactions);

// Debts
router.post('/debts', addDebt);
router.get('/debts', getDebts);

// Assets
router.post('/assets', addAsset);
router.get('/assets', getAssets);

export default router;
