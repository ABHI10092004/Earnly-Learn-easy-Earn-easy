const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./user');
const User = require('../models/User');
const EarningQuiz = require('../models/EarningQuiz'); // You'll need to create this model

// Get all quizzes
router.get('/', authMiddleware, async (req, res) => {
    try {
        const quizzes = await EarningQuiz.find({ isActive: true }).sort({ createdAt: -1 });
        
        // Get completed quizzes for this user
        const user = req.user;
        const completedQuizzes = user.completedQuizzes || [];
        
        res.json({
            quizzes,
            completedQuizzes
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
});

// Get a specific quiz
router.get('/:quizId', authMiddleware, async (req, res) => {
    try {
        const quiz = await EarningQuiz.findById(req.params.quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        res.json({ quiz });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
});

// Complete a quiz
router.post('/:quizId/complete', authMiddleware, async (req, res) => {
    try {
        const { score, answers } = req.body;
        const quizId = req.params.quizId;
        
        const quiz = await EarningQuiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Calculate reward based on score
        let earnedReward = 0;
        if (score >= quiz.passingScore) {
            earnedReward = quiz.reward;
        }
        
        // Update user's wallet
        const user = req.user;
        const currentWallet = parseFloat(user.wallet) || 0;
        user.wallet = (currentWallet + earnedReward).toString();
        
        // Update total earnings
        const currentEarnings = parseFloat(user.totalEarnings) || 0;
        user.totalEarnings = (currentEarnings + earnedReward).toString();
        
        // Add to completed quizzes if not already completed
        if (!user.completedQuizzes) {
            user.completedQuizzes = [];
        }
        
        if (!user.completedQuizzes.includes(quizId)) {
            user.completedQuizzes.push(quizId);
        }
        
        await user.save();
        
        res.json({
            message: 'Quiz completed successfully',
            score,
            earnedReward,
            wallet: user.wallet
        });
    } catch (error) {
        console.error('Error completing quiz:', error);
        res.status(500).json({ message: 'Error completing quiz' });
    }
});

// Admin routes
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        const quizzes = await EarningQuiz.find({}).sort({ createdAt: -1 });
        
        // Count total completions (this would need to be calculated from user data)
        const users = await User.find({ completedQuizzes: { $exists: true, $not: { $size: 0 } } });
        let totalCompletions = 0;
        
        users.forEach(user => {
            totalCompletions += user.completedQuizzes.length;
        });
        
        res.json({
            quizzes,
            totalCompletions
        });
    } catch (error) {
        console.error('Error fetching admin quizzes:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
});

router.post('/admin', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        const quizData = req.body;
        const newQuiz = new EarningQuiz(quizData);
        await newQuiz.save();
        
        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: newQuiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Error creating quiz' });
    }
});

// Toggle quiz active status
router.patch('/admin/:quizId/toggle-active', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        const { isActive } = req.body;
        const quiz = await EarningQuiz.findByIdAndUpdate(
            req.params.quizId,
            { $set: { isActive: isActive } },
            { new: true }
        );
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        res.json({
            message: `Quiz ${isActive ? 'activated' : 'deactivated'} successfully`,
            quiz
        });
    } catch (error) {
        console.error('Error toggling quiz status:', error);
        res.status(500).json({ message: 'Error updating quiz status' });
    }
});

// Delete quiz
router.delete('/admin/:quizId', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        const quiz = await EarningQuiz.findByIdAndDelete(req.params.quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        res.json({
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Error deleting quiz' });
    }
});

module.exports = router; 