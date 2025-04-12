const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['video', 'text', 'quiz'],
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    content: {
        // For video modules
        videoUrl: String,
        // For text modules
        textContent: String,
        // For quiz modules
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number
        }]
    },
    reward: {
        type: String,
        required: true
    },
    isLocked: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module; 