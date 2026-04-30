import Budget from '../model/Budget.js';

export const getBudget = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required." });
        }

        const budget = await Budget.findOne({
            user: req.user._id,
            month: parseInt(month),
            year: parseInt(year)
        });

        res.status(200).json(budget || { totalLimit: 0, categoryLimits: {} });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBudget = async (req, res) => {
    try {
        const { month, year, totalLimit, categoryLimits } = req.body;

        const budget = await Budget.findOneAndUpdate(
            { user: req.user._id, month, year },
            { totalLimit, categoryLimits },
            { new: true, upsert: true }
        );

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
