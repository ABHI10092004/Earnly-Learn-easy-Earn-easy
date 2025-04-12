const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nani1113256j@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Create new user
        const user = new User({
            username,
            fullName,
            email,
            password,
            otp: {
                code: otp,
                expiresAt: otpExpiry
            }
        });

        await user.save();

        // Send OTP email
        try {
            const mailOptions = {
                from: 'nani1113256j@gmail.com',
                to: email,
                subject: 'Verify your Earnly account',
                html: `
                    <h1>Welcome to Earnly!</h1>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('OTP email sent successfully');
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Continue with signup even if email fails
            // In production, you might want to handle this differently
        }

        res.status(201).json({ 
            message: 'Signup successful. Please verify your email.',
            otp: otp // For development purposes only - remove in production
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Error during signup',
            error: error.message 
        });
    }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp || user.otp.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Clear OTP after verification
        user.otp = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token, message: 'Email verified successfully' });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ 
            message: 'Error during OTP verification',
            error: error.message 
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error during login',
            error: error.message 
        });
    }
});

// Resend OTP route
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Update user with new OTP
        user.otp = {
            code: otp,
            expiresAt: otpExpiry
        };
        await user.save();

        // Send OTP email
        try {
            const mailOptions = {
                from: 'nani1113256j@gmail.com',
                to: email,
                subject: 'Your new verification code for Earnly',
                html: `
                    <h1>New Verification Code</h1>
                    <p>Your new verification code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('New OTP email sent successfully');
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Continue even if email fails
            // In production, you might want to handle this differently
        }

        res.json({ 
            message: 'New verification code sent successfully',
            otp: otp // For development purposes only - remove in production
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ 
            message: 'Error sending verification code',
            error: error.message 
        });
    }
});

module.exports = router; 