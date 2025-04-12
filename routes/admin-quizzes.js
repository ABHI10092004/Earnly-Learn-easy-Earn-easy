const express = require('express');
const router = express.Router();
const EarningQuiz = require('../models/EarningQuiz');
const User = require('../models/User');
const { adminAuthMiddleware } = require('./admin');

// Get all quizzes (with admin data)
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
            match.title = { $regex: req.query.search, $options: 'i' };
        }
        
        if (req.query.isActive === 'true') {
            match.isActive = true;
        } else if (req.query.isActive === 'false') {
            match.isActive = false;
        }
        
        // Get quizzes
        const quizzes = await EarningQuiz.find(match)
            .sort(sort)
            .limit(limit)
            .skip(skip);
            
        // Get total count for pagination
        const totalQuizzes = await EarningQuiz.countDocuments(match);
        
        // Get completion statistics
        const quizzesWithCompletions = await Promise.all(quizzes.map(async quiz => {
            const completions = await User.countDocuments({
                completedQuizzes: quiz._id
            });
            
            return {
                ...quiz.toObject(),
                completions
            };
        }));
        
        res.json({
            quizzes: quizzesWithCompletions,
            pagination: {
                total: totalQuizzes,
                page,
                limit,
                pages: Math.ceil(totalQuizzes / limit)
            }
        });
    } catch (error) {
        console.error('Error getting quizzes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single quiz by ID
router.get('/:quizId', adminAuthMiddleware, async (req, res) => {
    try {
        const quiz = await EarningQuiz.findById(req.params.quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Get completion count
        const completions = await User.countDocuments({
            completedQuizzes: quiz._id
        });
        
        res.json({
            quiz: {
                ...quiz.toObject(),
                completions
            }
        });
    } catch (error) {
        console.error('Error getting quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new quiz
router.post('/', adminAuthMiddleware, async (req, res) => {
    try {
        const { title, description, questions, reward, timeLimit, passingScore, isActive } = req.body;
        
        // Validate input
        if (!title || !description || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Validate each question
        for (const question of questions) {
            if (!question.question || !Array.isArray(question.options) || 
                question.options.length < 2 || question.correctAnswer === undefined) {
                return res.status(400).json({ message: 'Invalid question format' });
            }
        }
        
        // Create quiz
        const quiz = new EarningQuiz({
            title,
            description,
            questions,
            reward: reward || 10,
            timeLimit: timeLimit || 5,
            passingScore: passingScore || 70,
            isActive: isActive !== undefined ? isActive : true
        });
        
        await quiz.save();
        
        res.status(201).json({
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update quiz
router.patch('/:quizId', adminAuthMiddleware, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'questions', 'reward', 'timeLimit', 'passingScore', 'isActive'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }
        
        const quiz = await EarningQuiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Apply updates
        updates.forEach(update => quiz[update] = req.body[update]);
        await quiz.save();
        
        res.json({
            message: 'Quiz updated successfully',
            quiz
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete quiz
router.delete('/:quizId', adminAuthMiddleware, async (req, res) => {
    try {
        const quiz = await EarningQuiz.findByIdAndDelete(req.params.quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Remove quiz from users' completed quizzes
        await User.updateMany(
            { completedQuizzes: req.params.quizId },
            { $pull: { completedQuizzes: req.params.quizId } }
        );
        
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle quiz active status
router.post('/:quizId/toggle-active', adminAuthMiddleware, async (req, res) => {
    try {
        const { isActive } = req.body;
        
        // Validate input
        if (isActive === undefined) {
            return res.status(400).json({ message: 'isActive field is required' });
        }
        
        const quiz = await EarningQuiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Update active status
        quiz.isActive = isActive;
        await quiz.save();
        
        res.json({
            message: `Quiz ${isActive ? 'activated' : 'deactivated'} successfully`,
            quiz
        });
    } catch (error) {
        console.error('Error toggling quiz status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get quiz statistics
router.get('/stats/summary', adminAuthMiddleware, async (req, res) => {
    try {
        // Get total quizzes
        const totalQuizzes = await EarningQuiz.countDocuments();
        
        // Get active quizzes
        const activeQuizzes = await EarningQuiz.countDocuments({ isActive: true });
        
        // Get quizzes created in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newQuizzes = await EarningQuiz.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        
        // Get total number of questions across all quizzes
        const quizzes = await EarningQuiz.find();
        let totalQuestions = 0;
        quizzes.forEach(quiz => {
            totalQuestions += quiz.questions ? quiz.questions.length : 0;
        });
        
        // Get total completions
        const users = await User.find({ completedQuizzes: { $exists: true, $not: { $size: 0 } } });
        let totalCompletions = 0;
        users.forEach(user => {
            totalCompletions += user.completedQuizzes.length;
        });
        
        res.json({
            stats: {
                totalQuizzes,
                activeQuizzes,
                newQuizzes,
                totalQuestions,
                totalCompletions
            }
        });
    } catch (error) {
        console.error('Error getting quiz statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 