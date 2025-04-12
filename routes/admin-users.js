const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { adminAuthMiddleware } = require('./admin');

// Get all users
router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Sorting
        const sort = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1; // Default sort by creation date (newest first)
        }
        
        // Filtering
        const match = {};
        if (req.query.search) {
            match.$or = [
                { username: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { fullName: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Get users
        const users = await User.find(match)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .select('-password -otp');
        
        // Get total count for pagination
        const totalUsers = await User.countDocuments(match);
        
        res.json({
            users,
            pagination: {
                total: totalUsers,
                page,
                limit,
                pages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single user by ID
router.get('/:userId', adminAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password -otp');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user progress in courses
router.get('/:userId/progress', adminAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate({
                path: 'enrolledCourses',
                select: 'title description'
            });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get user progress (this would depend on your progress model)
        // This is a placeholder - modify to match your actual data model
        const progress = await UserProgress.find({ user: req.params.userId })
            .populate('course', 'title');
        
        res.json({
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName
            },
            enrolledCourses: user.enrolledCourses,
            progress
        });
    } catch (error) {
        console.error('Error getting user progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user
router.patch('/:userId', adminAuthMiddleware, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['username', 'fullName', 'email', 'wallet', 'isAdmin'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }
        
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Apply updates
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        
        // Return updated user without sensitive info
        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                wallet: user.wallet,
                isAdmin: user.isAdmin,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user
router.delete('/:userId', adminAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user statistics
router.get('/stats/summary', adminAuthMiddleware, async (req, res) => {
    try {
        // Get total users
        const totalUsers = await User.countDocuments();
        
        // Get users created in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        
        // Get users with completed courses
        const usersWithCompletedCourses = await User.countDocuments({ completedCourses: { $gt: 0 } });
        
        // Get admin users
        const adminUsers = await User.countDocuments({ isAdmin: true });
        
        res.json({
            stats: {
                totalUsers,
                newUsers,
                usersWithCompletedCourses,
                adminUsers
            }
        });
    } catch (error) {
        console.error('Error getting user statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 