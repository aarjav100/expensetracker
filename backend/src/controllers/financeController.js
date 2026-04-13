import Debt from '../model/debtModel.js';
import Asset from '../model/assetModel.js';
import PointTransaction from '../model/pointsModel.js';
import User from '../model/authModel.js';

// ➤ Gamification / Points routes
export const getPointTransactions = async (req, res) => {
    try {
        const history = await PointTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        const user = await User.findById(req.user._id).select('points lifetimePoints tier purchasedItems');
        
        return res.status(200).json({
            message: "Points history fetched",
            history,
            stats: user
        });
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
};

// ➤ Debt Tracker Routes
export const addDebt = async (req, res) => {
    try {
        const newDebt = await Debt.create({ ...req.body, user: req.user._id });
        res.status(201).json(newDebt);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getDebts = async (req, res) => {
    try {
        const debts = await Debt.find({ user: req.user._id });
        res.status(200).json(debts);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ➤ Net Worth / Asset Routes
export const addAsset = async (req, res) => {
    try {
        const newAsset = await Asset.create({ ...req.body, user: req.user._id });
        res.status(201).json(newAsset);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ user: req.user._id });
        res.status(200).json(assets);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
