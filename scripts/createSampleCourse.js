require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');

async function createSampleCourse() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earnly');
        console.log('Connected to MongoDB');
        
        // Create the sample course first so we have an ID
        const course = new Course({
            title: 'Introduction to Blockchain and Cryptocurrencies',
            description: 'Learn the fundamentals of blockchain technology and cryptocurrencies in this beginner-friendly course.',
            image: '/images/courses/blockchain-intro.jpg',
            reward: '50',
            difficulty: 'Beginner',
            category: 'Blockchain',
            customId: 'sample1', // This is what we'll use to look up the course
            slug: 'intro-to-blockchain',
            code: 'BLK101',
            totalModules: 3,
            enrolledUsers: 125,
            rating: 4.7,
            reviews: 32
        });
        
        // Save the course first to get an ID
        await course.save();
        console.log('Sample course created with ID:', course._id);
        
        // Create sample modules with reference to the course
        const moduleData = [
            {
                title: 'Introduction to Blockchain',
                description: 'Learn the basics of blockchain technology',
                type: 'text',
                level: 1,
                course: course._id,
                reward: '5',
                order: 1,
                content: {
                    textContent: '<h1>Introduction to Blockchain</h1><p>Blockchain is a distributed ledger technology...</p>'
                }
            },
            {
                title: 'What is Bitcoin?',
                description: 'Understanding the first cryptocurrency',
                type: 'video',
                level: 1,
                course: course._id,
                reward: '10',
                order: 2,
                content: {
                    videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4'
                }
            },
            {
                title: 'Blockchain Quiz',
                description: 'Test your knowledge',
                type: 'quiz',
                level: 1,
                course: course._id,
                reward: '15',
                order: 3,
                content: {
                    questions: [
                        {
                            question: 'What is a blockchain?',
                            options: [
                                'A type of cryptocurrency',
                                'A distributed ledger technology',
                                'A programming language',
                                'A type of database'
                            ],
                            correctAnswer: 1
                        },
                        {
                            question: 'Who created Bitcoin?',
                            options: [
                                'Vitalik Buterin',
                                'Satoshi Nakamoto',
                                'Elon Musk',
                                'Charles Hoskinson'
                            ],
                            correctAnswer: 1
                        }
                    ]
                }
            }
        ];
        
        // Create modules
        const modules = await Promise.all(
            moduleData.map(data => new Module(data).save())
        );
        
        // Update course with module IDs
        course.modules = modules.map(module => module._id);
        await course.save();
        
        console.log('Sample course updated with modules');
        console.log('Sample course customId:', course.customId);
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (error) {
        console.error('Error creating sample course:', error);
        await mongoose.disconnect();
    }
}

// Run the function
createSampleCourse(); 