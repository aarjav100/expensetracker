import PointTransaction from '../model/pointsModel.js';
import User from '../model/authModel.js';

export const awardPoints = async (userId, action, amount, reason, referenceId = null) => {
    try {
        const transaction = new PointTransaction({
            user: userId,
            action,
            amount: Number(amount),
            reason,
            referenceId
        });
        await transaction.save();

        const user = await User.findById(userId);
        if(user) {
            if(action === 'earned') {
                user.points += amount;
                user.lifetimePoints += amount;

                // Dynamic Tier progression
                if (user.lifetimePoints >= 5000) user.tier = 'Platinum';
                else if (user.lifetimePoints >= 2000) user.tier = 'Gold';
                else if (user.lifetimePoints >= 500) user.tier = 'Silver';
                else user.tier = 'Bronze';

            } else if (action === 'spent') {
                user.points -= amount;
            }
            await user.save();
        }
        return transaction;
    } catch(err) {
        console.error('Gamification System Error:', err);
        return null;
    }
};
