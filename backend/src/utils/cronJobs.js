import cron from 'node-cron';
import Expense from '../model/expenseModel.js';

const generateRecurring = async () => {
    console.log('[CRON] Running daily recurring expense check...');
    try {
        const today = new Date();
        const recurringExpenses = await Expense.find({ isRecurring: true });

        for (const exp of recurringExpenses) {
            let shouldGenerate = false;
            let lastGen = exp.lastRecurringGenerated || exp.date;
            
            const daysSince = Math.floor((today - new Date(lastGen)) / (1000 * 60 * 60 * 24));

            switch (exp.recurringInterval) {
                case 'daily':
                    if (daysSince >= 1) shouldGenerate = true;
                    break;
                case 'weekly':
                    if (daysSince >= 7) shouldGenerate = true;
                    break;
                case 'monthly':
                    // simplify to roughly 30 days or handle strict month boundary
                    if (daysSince >= 30) shouldGenerate = true;
                    break;
                case 'yearly':
                    if (daysSince >= 365) shouldGenerate = true;
                    break;
            }

            if (shouldGenerate) {
                // Duplicate transaction
                await Expense.create({
                    user: exp.user,
                    title: exp.title + ' (Auto-Recurring)',
                    amount: exp.amount,
                    category: exp.category,
                    date: new Date(),
                    type: exp.type,
                    paymentMethod: exp.paymentMethod,
                    notes: 'Auto-generated recurring transaction'
                });

                // Update original parent
                exp.lastRecurringGenerated = new Date();
                await exp.save();
                console.log(`[CRON] Generated recurring transaction for: ${exp.title}`);
            }
        }
    } catch (err) {
        console.error('[CRON] Failed running recurring job:', err);
    }
};

const startCronJobs = () => {
    // Run every day at exactly midnight
    cron.schedule('0 0 * * *', generateRecurring);
    console.log('[CRON] Jobs initialized for recurring transactions');
};

export default startCronJobs;
