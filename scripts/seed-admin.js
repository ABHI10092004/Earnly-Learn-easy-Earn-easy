const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earnly', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    seedAdmins();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Demo admin credentials
const demoAdmins = [
    {
        username: 'superadmin',
        email: 'superadmin@earnly.com',
        password: 'superadmin123',
        fullName: 'Super Admin',
        role: 'super_admin',
        isActive: true
    },
    {
        username: 'admin',
        email: 'admin@earnly.com',
        password: 'admin123',
        fullName: 'Regular Admin',
        role: 'admin',
        isActive: true
    }
];

// Demo admin user
const demoAdminUser = {
    username: 'admin',
    fullName: 'Admin User',
    email: 'admin@earnly.com',
    password: 'admin123',
    wallet: '1000',
    totalEarnings: '1000',
    isAdmin: true
};

// Seed function
async function seedAdmins() {
    try {
        // Seed Admin collection
        for (const adminData of demoAdmins) {
            const existingAdmin = await Admin.findOne({ email: adminData.email });
            
            if (existingAdmin) {
                console.log(`Admin ${adminData.email} already exists. Updating...`);
                Object.assign(existingAdmin, adminData);
                await existingAdmin.save();
                console.log(`Admin ${adminData.email} updated successfully`);
            } else {
                const newAdmin = new Admin(adminData);
                await newAdmin.save();
                console.log(`Admin ${adminData.email} created successfully`);
            }
        }

        // Seed User collection with admin user
        const existingUser = await User.findOne({ email: demoAdminUser.email });
        
        if (existingUser) {
            console.log('Admin user already exists. Updating admin privileges...');
            existingUser.isAdmin = true;
            await existingUser.save();
            console.log('Admin user updated successfully');
        } else {
            const newUser = new User(demoAdminUser);
            await newUser.save();
            console.log('Admin user created successfully');
        }
        
        console.log('Admin seeding completed successfully');
        
        // Exit process
        mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admins:', error);
        process.exit(1);
    }
} 