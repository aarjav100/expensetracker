import expenseModel from '../model/expenseModel.js';
import Budget from '../model/Budget.js';

export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenses = await expenseModel.find({
            user: req.user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const totalIncome = expenses
            .filter(e => e.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);
        
        const totalExpense = expenses
            .filter(e => e.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const savings = totalIncome - totalExpense;

        // Get budget for current month
        const budget = await Budget.findOne({
            user: req.user._id,
            month: now.getMonth(),
            year: now.getFullYear()
        });

        res.status(200).json({
            totals: { totalIncome, totalExpense, savings },
            budget: budget ? budget.totalLimit : 0,
            recent: await expenseModel.find({ user: req.user._id }).sort({ date: -1 }).limit(5)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getChartData = async (req, res) => {
    try {
        const expenses = await expenseModel.find({ user: req.user._id });

        // Category breakdown
        const categoryMap = expenses
            .filter(e => e.type === 'expense')
            .reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {});

        const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

        // Monthly trend (last 6 months)
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth();
            const y = d.getFullYear();

            const monthExpenses = expenses.filter(e => {
                const ed = new Date(e.date);
                return ed.getMonth() === m && ed.getFullYear() === y;
            });

            const income = monthExpenses.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0);
            const expense = monthExpenses.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0);

            trendData.push({
                month: d.toLocaleString('default', { month: 'short' }),
                income,
                expense,
                savings: income - expense
            });
        }

        res.status(200).json({ categoryData, trendData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMLData = async (req, res) => {
    try {
        // Fetch all user expenses for training
        const expenses = await expenseModel.find({ user: req.user._id }).sort({ date: 1 });
        
        // Aggregate monthly for ML
        const monthlyData = expenses.reduce((acc, curr) => {
            const d = new Date(curr.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (!acc[key]) acc[key] = { expense: 0, income: 0, count: 0 };
            
            if (curr.type === 'expense') acc[key].expense += curr.amount;
            else acc[key].income += curr.amount;
            
            acc[key].count += 1;
            return acc;
        }, {});

        res.status(200).json(Object.entries(monthlyData).map(([date, data]) => ({ date, ...data })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
