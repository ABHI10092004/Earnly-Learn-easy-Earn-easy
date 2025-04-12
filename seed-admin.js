const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earnly', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Admin user data
const adminUser = {
    username: 'admin',
    fullName: 'Admin User',
    email: 'admin@earnly.com',
    password: 'admin123', // This will be hashed by the pre-save hook
    wallet: '1000',
    totalEarnings: '1000',
    isAdmin: true
};

// Seed function
async function seedAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        
        if (existingAdmin) {
            console.log('Admin user already exists. Updating admin privileges...');
            existingAdmin.isAdmin = true;
            await existingAdmin.save();
            console.log('Admin privileges updated');
        } else {
            // Create new admin user
            const newAdmin = new User(adminUser);
            await newAdmin.save();
            console.log('Admin user created successfully');
        }
        
        // Exit process
        mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the seed function
seedAdmin(); 