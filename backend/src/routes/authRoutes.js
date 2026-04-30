import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/authregister', registerUser);
router.post('/authlogin', loginUser);

export default router;