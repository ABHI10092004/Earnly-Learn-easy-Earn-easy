const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');
const User = mongoose.model('User');

// Get leaderboard data
router.get('/', async (req, res) => {
    try {
        const period = req.query.period || 'all';
        
        // Set time filter based on period
        const timeFilter = {};
        if (period !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (period) {
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                default:
                    startDate = null;
            }
            
            if (startDate) {
                timeFilter.timestamp = { $gte: startDate };
            }
        }
        
        // Aggregate transaction data by user
        const userTransactions = await Transaction.aggregate([
            {
                $match: {
                    ...timeFilter
                }
            },
            {
                $group: {
                    _id: '$userId',
                    transactionCount: { $sum: 1 },
                    totalRewards: {
                        $sum: {
                            $cond: [
                                { $in: ['$type', ['reward', 'quiz', 'course']] },
                                { $toDouble: '$amount' },
                                0
                            ]
                        }
                    },
                    lastActivity: { $max: '$timestamp' }
                }
            },
            {
                $sort: { transactionCount: -1, totalRewards: -1 }
            },
            {
                $limit: 20 // Limit to top 20 users
            }
        ]);
        
        // Get user details for the aggregated data
        const leaderboard = [];
        
        for (const userTx of userTransactions) {
            if (!userTx._id) continue; // Skip if userId is null
            
            const user = await User.findById(userTx._id).select('username email createdAt').lean();
            
            if (user) {
                leaderboard.push({
                    userId: userTx._id,
                    username: user.username || user.email || 'Anonymous User',
                    transactionCount: userTx.transactionCount,
                    totalRewards: parseFloat(userTx.totalRewards.toFixed(2)),
                    lastActivity: userTx.lastActivity,
                    memberSince: user.createdAt
                });
            }
        }
        
        // Get overall stats
        const totalUsers = await User.countDocuments();
        const totalTransactions = await Transaction.countDocuments(timeFilter);
        
        // Calculate total rewards
        const rewardsAggregation = await Transaction.aggregate([
            {
                $match: {
                    ...timeFilter,
                    type: { $in: ['reward', 'quiz', 'course'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $toDouble: '$amount' } }
                }
            }
        ]);
        
        const totalRewards = rewardsAggregation.length > 0 
            ? parseFloat(rewardsAggregation[0].total.toFixed(2)) 
            : 0;
        
        res.json({
            stats: {
                totalUsers,
                totalTransactions,
                totalRewards
            },
            leaderboard
        });
        
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ message: 'Error fetching leaderboard data' });
    }
});

module.exports = router; 