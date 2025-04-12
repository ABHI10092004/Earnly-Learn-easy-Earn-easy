const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        res.json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            wallet: user.wallet,
            enrolledCourses: user.enrolledCourses
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Get user wallet balance
router.get('/wallet', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            balance: user.wallet || '0'
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ message: 'Error fetching wallet balance' });
    }
});

// Token validation endpoint - lightweight check if token is valid
router.get('/validate-token', authMiddleware, async (req, res) => {
    // If middleware passes, the token is valid
    res.json({ 
        valid: true, 
        userId: req.user._id 
    });
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { username, fullName } = req.body;
        const updates = {};
        
        if (username) updates.username = username;
        if (fullName) updates.fullName = fullName;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true }
        );
        
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            wallet: updatedUser.wallet
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating user profile' });
    }
});

// Get user transactions
router.get('/transactions', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find transactions for this user using the Transaction model
        const transactions = await Transaction.find({ userId: userId })
            .sort({ timestamp: -1 }) // Sort by newest first
            .limit(50); // Limit to 50 most recent transactions
        
        res.json({ success: true, transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Error fetching transactions' });
    }
});

// Add this new function to record a transaction
async function recordTransaction(userId, transactionData) {
    try {
        const transaction = new Transaction({
            userId,
            hash: transactionData.hash,
            type: transactionData.type,
            amount: transactionData.amount,
            walletAddress: transactionData.walletAddress,
            description: transactionData.description || '',
            timestamp: transactionData.timestamp || new Date()
        });

        await transaction.save();
        return transaction;
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw error;
    }
}

// Replace the existing record-transaction route with this one
// Record a new transaction
router.post('/record-transaction', authMiddleware, async (req, res) => {
    try {
        const { hash, type, amount, walletAddress, description } = req.body;
        const userId = req.user._id;
        
        if (!hash || !type || !amount || !walletAddress) {
            return res.status(400).json({ success: false, message: 'Missing required transaction details' });
        }
        
        // Record the transaction
        const transaction = await recordTransaction(userId, {
            hash,
            type,
            amount,
            walletAddress,
            description,
            timestamp: new Date()
        });
        
        res.json({ success: true, transaction });
    } catch (error) {
        console.error('Error recording transaction:', error);
        res.status(500).json({ success: false, message: 'Error recording transaction' });
    }
});

module.exports = { router, authMiddleware, recordTransaction }; 