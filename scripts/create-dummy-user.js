// Script to create a dummy user for testing

// Load environment variables
require('dotenv').config();

// Import required modules
const mongoose = require('mongoose');
const User = require('../models/User');

// Dummy user details
const dummyUser = {
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'testing123',
    wallet: '1500',  // Start with more tokens
    totalEarnings: '2500',
    completedCourses: 3
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earnly')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [
                    { email: dummyUser.email },
                    { username: dummyUser.username }
                ] 
            });
            
            if (existingUser) {
                console.log('⚠️ User with this email or username already exists');
                console.log('Email:', existingUser.email);
                console.log('Username:', existingUser.username);
                console.log('Password: password is hashed, use the original password');
                process.exit(0);
            }
            
            // Create new user
            const user = new User(dummyUser);
            await user.save();
            
            console.log('✅ Dummy user created successfully');
            console.log('------------------------------');
            console.log('Email:', dummyUser.email);
            console.log('Password:', dummyUser.password);
            console.log('Wallet balance:', dummyUser.wallet, 'tokens');
            console.log('------------------------------');
            console.log('You can now log in with these credentials');
            
        } catch (error) {
            console.error('❌ Error creating dummy user:', error);
        } finally {
            // Disconnect from MongoDB
            await mongoose.disconnect();
            console.log('✅ Disconnected from MongoDB');
            process.exit(0);
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }); 