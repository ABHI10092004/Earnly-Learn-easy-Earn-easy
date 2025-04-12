const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const EarningQuiz = require('../models/EarningQuiz');
const mongoose = require('mongoose');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin authentication middleware
const adminAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find admin
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin token' });
        }
        
        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({ message: 'Admin account is inactive' });
        }
        
        // Attach admin to request
        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('Admin auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Register admin (Super admin only)
router.post('/register', adminAuthMiddleware, async (req, res) => {
    try {
        // Check if requesting admin is a super_admin
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({ message: 'Only super admins can create new admin accounts' });
        }
        
        const { username, email, password, fullName, role } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email or username already exists' });
        }
        
        // Create new admin
        const admin = new Admin({
            username,
            email,
            password,
            fullName,
            role: role || 'admin',
            isActive: true
        });
        
        await admin.save();
        
        // Return success
        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
            }
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Special route to create first super admin
router.post('/init', async (req, res) => {
    try {
        // Check if any admin exists
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(403).json({ message: 'Admin initialization already completed' });
        }
        
        const { username, email, password, fullName } = req.body;
        
        // Create super admin
        const admin = new Admin({
            username,
            email,
            password,
            fullName,
            role: 'super_admin',
            isActive: true
        });
        
        await admin.save();
        
        // Return success
        res.status(201).json({
            message: 'Super admin initialized successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin initialization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find admin
        const admin = await Admin.findOne({
            $or: [
                { username },
                { email: username } // Allow login with either username or email
            ]
        });
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({ message: 'Admin account is inactive' });
        }
        
        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Update last login time
        admin.lastLogin = new Date();
        await admin.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Return token and admin info
        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get admin profile
router.get('/profile', adminAuthMiddleware, (req, res) => {
    try {
        const admin = req.admin;
        
        res.json({
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
                createdAt: admin.createdAt,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Admin profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard statistics
router.get('/dashboard', adminAuthMiddleware, async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments();
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username fullName email createdAt');
            
        // Get quiz statistics
        const totalQuizzes = await EarningQuiz.countDocuments();
        const activeQuizzes = await EarningQuiz.countDocuments({ isActive: true });
        
        // Get completion statistics
        const usersWithCompletedQuizzes = await User.countDocuments({ 
            completedQuizzes: { $exists: true, $not: { $size: 0 } }
        });
        
        // Return dashboard data
        res.json({
            stats: {
                users: {
                    total: totalUsers,
                    recent: recentUsers
                },
                quizzes: {
                    total: totalQuizzes,
                    active: activeQuizzes
                },
                completions: {
                    usersWithQuizzes: usersWithCompletedQuizzes
                }
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin transaction routes
// Get transaction statistics
router.get('/transactions/stats', adminAuthMiddleware, async (req, res) => {
    try {
        // Check if Transaction model is imported
        const Transaction = mongoose.model('Transaction');
        
        // Get total transactions count
        const totalTransactions = await Transaction.countDocuments();
        
        // Get sum of all tokens awarded (positive amounts)
        const tokenAggregation = await Transaction.aggregate([
            {
                $match: { 
                    type: { $in: ['reward', 'quiz', 'course'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalTokens: { $sum: { $toDouble: "$amount" } }
                }
            }
        ]);
        
        const totalTokensAwarded = tokenAggregation.length > 0 ? tokenAggregation[0].totalTokens : 0;
        
        // Count module completions
        const moduleCompletions = await Transaction.countDocuments({ 
            type: 'course'
        });
        
        // Count quiz completions
        const quizCompletions = await Transaction.countDocuments({ 
            type: 'quiz'
        });
        
        res.json({
            totalTransactions,
            totalTokensAwarded,
            moduleCompletions,
            quizCompletions
        });
    } catch (error) {
        console.error('Error getting transaction stats:', error);
        res.status(500).json({ message: 'Error fetching transaction statistics' });
    }
});

// Get transaction history (for chart)
router.get('/transactions/history', adminAuthMiddleware, async (req, res) => {
    try {
        // Check if Transaction model is imported
        const Transaction = mongoose.model('Transaction');
        
        // Get period (default 30 days)
        const period = parseInt(req.query.period) || 30;
        
        // Calculate start date
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        
        // Generate labels for the chart (dates)
        const labels = [];
        const transactionCounts = [];
        const tokenAmounts = [];
        
        // Generate data points for each day in the period
        for (let i = 0; i < period; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            
            // Format date for label (MM/DD)
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            labels.push(`${month}/${day}`);
            
            // Get next day for query range
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            // Count transactions for this day
            const dailyCount = await Transaction.countDocuments({
                timestamp: {
                    $gte: currentDate,
                    $lt: nextDate
                }
            });
            
            transactionCounts.push(dailyCount);
            
            // Sum token amounts for this day
            const tokenSum = await Transaction.aggregate([
                {
                    $match: {
                        timestamp: {
                            $gte: currentDate,
                            $lt: nextDate
                        },
                        type: { $in: ['reward', 'quiz', 'course'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $toDouble: "$amount" } }
                    }
                }
            ]);
            
            tokenAmounts.push(tokenSum.length > 0 ? tokenSum[0].total : 0);
        }
        
        res.json({
            labels,
            transactions: transactionCounts,
            tokensAwarded: tokenAmounts
        });
    } catch (error) {
        console.error('Error getting transaction history:', error);
        res.status(500).json({ message: 'Error fetching transaction history' });
    }
});

// Export transactions
router.get('/transactions/export', adminAuthMiddleware, async (req, res) => {
    try {
        // Check if Transaction model is imported
        const Transaction = mongoose.model('Transaction');
        
        // Build query filters (same as in GET /transactions)
        const filter = {};
        
        if (req.query.type) {
            filter.type = req.query.type;
        }
        
        if (req.query.user) {
            const user = await User.findOne({
                $or: [
                    { username: new RegExp(req.query.user, 'i') },
                    { _id: mongoose.Types.ObjectId.isValid(req.query.user) ? req.query.user : null }
                ]
            });
            
            if (user) {
                filter.userId = user._id;
            }
        }
        
        if (req.query.period) {
            const now = new Date();
            let startDate;
            
            switch (req.query.period) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'yesterday':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case 'week':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
            }
            
            if (startDate) {
                filter.timestamp = { $gte: startDate };
            }
        }
        
        // Get all transactions matching the filter
        const transactions = await Transaction.find(filter)
            .sort({ timestamp: -1 })
            .populate('userId', 'username email')
            .lean();
        
        // Format as CSV (simple implementation)
        let csv = 'ID,User,Type,Amount,Description,Date,Hash\n';
        
        transactions.forEach(tx => {
            const user = tx.userId ? tx.userId.username || tx.userId.email || tx.userId : 'Unknown';
            const date = new Date(tx.timestamp).toLocaleString();
            
            csv += `${tx._id},${user},${tx.type},${tx.amount},"${tx.description.replace(/"/g, '""')}",${date},${tx.hash}\n`;
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        
        res.send(csv);
    } catch (error) {
        console.error('Error exporting transactions:', error);
        res.status(500).json({ message: 'Error exporting transactions' });
    }
});

// Get transaction by ID
router.get('/transactions/:id', adminAuthMiddleware, async (req, res) => {
    try {
        // Check if Transaction model is imported
        const Transaction = mongoose.model('Transaction');
        
        const transaction = await Transaction.findById(req.params.id)
            .populate('userId', 'username email')
            .lean();
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Format transaction for better display
        const formattedTransaction = {
            _id: transaction._id,
            user: transaction.userId,
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            createdAt: transaction.timestamp,
            status: 'completed', // Default status, can be modified if needed
            reference: transaction.hash,
            balanceAfter: '0', // This would need to be calculated if needed
            metadata: {
                walletAddress: transaction.walletAddress
            }
        };
        
        res.json(formattedTransaction);
    } catch (error) {
        console.error('Error getting transaction details:', error);
        res.status(500).json({ message: 'Error fetching transaction details' });
    }
});

// Get all transactions with filtering
router.get('/transactions', adminAuthMiddleware, async (req, res) => {
    try {
        // Check if Transaction model is imported
        const Transaction = mongoose.model('Transaction');
        
        // Build query filters
        const filter = {};
        
        // Type filter
        if (req.query.type) {
            filter.type = req.query.type;
        }
        
        // User filter
        if (req.query.user) {
            // Find user by username or ID
            const user = await User.findOne({
                $or: [
                    { username: new RegExp(req.query.user, 'i') },
                    { _id: mongoose.Types.ObjectId.isValid(req.query.user) ? req.query.user : null }
                ]
            });
            
            if (user) {
                filter.userId = user._id;
            }
        }
        
        // Date filter
        if (req.query.period) {
            const now = new Date();
            let startDate;
            
            switch (req.query.period) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'yesterday':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case 'week':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
            }
            
            if (startDate) {
                filter.timestamp = { $gte: startDate };
            }
        }
        
        // Execute query with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        
        const transactions = await Transaction.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username email')
            .lean();
        
        // Format transactions for better display
        const formattedTransactions = transactions.map(tx => {
            return {
                _id: tx._id,
                user: tx.userId,
                type: tx.type,
                amount: tx.amount,
                description: tx.description,
                createdAt: tx.timestamp,
                status: 'completed', // Default status, can be modified if needed
                reference: tx.hash
            };
        });
        
        res.json(formattedTransactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

module.exports = { router, adminAuthMiddleware }; 