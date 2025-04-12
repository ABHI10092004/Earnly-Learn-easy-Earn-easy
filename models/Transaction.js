const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['reward', 'purchase', 'quiz', 'course'] // Types of transactions
    },
    amount: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ hash: 1 });
transactionSchema.index({ timestamp: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 