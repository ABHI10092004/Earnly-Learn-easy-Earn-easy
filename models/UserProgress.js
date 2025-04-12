const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    progress: {
        type: Number,
        default: 0
    },
    moduleProgress: [{
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module'
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        },
        quizScore: {
            type: Number
        }
    }],
    earnedReward: {
        type: String,
        default: '0'
    }
}, {
    timestamps: true
});

// Create a compound index to ensure a user can only have one progress record per course
userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress; 