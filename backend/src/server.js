import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRouter.js';
import financeRoutes from './routes/financeRouter.js';
import aiRoutes from './routes/aiRouter.js';
import walletRoutes from './routes/walletRoutes.js';
import budgetRoutes from './routes/budgetRouter.js';
import summaryRoutes from './routes/summaryRouter.js';
import connectDB from './config/db.js';
import startCronJobs from './utils/cronJobs.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174', // Vite alternative port
        process.env.FRONTEND_URL // for production
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/signup', authRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/summary', summaryRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            startCronJobs(); // Launch CRON system here!
        });
    })
    .catch((err) => {
        console.error('Failed to start server:', err.message);
    });