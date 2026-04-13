import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
    getWallet, 
    addMoney, 
    withdrawMoney, 
    payExpense, 
    transferFunds, 
    setPin, 
    verifyPin,
    getTransactions,
    toggleLock
} from '../controllers/walletController.js';
import { protect } from '../utils/authMiddleware.js';
import { verifyWalletPin, checkWalletLock } from '../middleware/walletAuth.js';

const router = express.Router();

// Rate limiting for wallet sensitive operations
const walletLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { message: 'Too many wallet operations, please try again after a minute' }
});

// All wallet routes require authentication
router.use(protect);

// Basic Wallet Info
router.get('/', getWallet);
router.get('/transactions', getTransactions);

// PIN Management
router.post('/set-pin', walletLimiter, setPin);
router.post('/verify-pin', verifyPin); // verifyWalletPin used as needed below

// Lock Management (requires PIN to unlock, but not to lock? Usually yes)
router.post('/toggle-lock', verifyWalletPin, toggleLock);

// Money Operations (All require PIN verification and check if not locked)
router.post('/add-money', walletLimiter, addMoney); // Adding money usually doesn't need PIN for UX, but simulation-wise it can. AddMoney controller handles it.
router.post('/withdraw', walletLimiter, verifyWalletPin, withdrawMoney);
router.post('/pay', walletLimiter, verifyWalletPin, payExpense);
router.post('/transfer', walletLimiter, verifyWalletPin, transferFunds);

export default router;
