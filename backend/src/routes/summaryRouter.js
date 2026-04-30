import express from 'express';
import { getDashboardStats, getChartData, getMLData } from '../controllers/summaryController.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/charts', getChartData);
router.get('/ml-data', getMLData);

export default router;
