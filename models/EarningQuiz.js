const mongoose = require('mongoose');

const earningQuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: {
            type: [String],
            required: true
        },
        correctAnswer: {
            type: Number,
            required: true
        }
    }],
    reward: {
        type: Number,
        required: true,
        default: 10
    },
    timeLimit: {
        type: Number,
        default: 5 // Time in minutes
    },
    passingScore: {
        type: Number,
        default: 70 // Percentage to pass
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const EarningQuiz = mongoose.model('EarningQuiz', earningQuizSchema);

module.exports = EarningQuiz; 