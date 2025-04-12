const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const Module = require('../models/Module');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const mongoose = require('mongoose');
const { recordTransaction } = require('./user');

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

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().select('title description image reward difficulty category totalModules enrolledUsers rating reviews');
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Get featured courses
router.get('/featured', async (req, res) => {
    try {
        const featuredCourses = await Course.find()
            .sort({ enrolledUsers: -1, rating: -1 })
            .limit(3)
            .select('title description image reward difficulty category totalModules enrolledUsers rating reviews');
        res.json(featuredCourses);
    } catch (error) {
        console.error('Get featured courses error:', error);
        res.status(500).json({ message: 'Error fetching featured courses' });
    }
});

// Get course by ID with modules
router.get('/:id', async (req, res) => {
    try {
        // Check if the ID is a valid MongoDB ObjectId or a string ID
        const courseId = req.params.id;
        let course;
        
        // First try to find by MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(courseId)) {
            course = await Course.findById(courseId);
        }
        
        // If not found, try to find by a 'slug' or 'code' field that might exist
        if (!course) {
            course = await Course.findOne({ 
                $or: [
                    { slug: courseId },
                    { code: courseId },
                    { customId: courseId }
                ]
            });
        }
        
        // Log the query result for debugging
        console.log(`Course lookup for ID: ${courseId}, Found:`, !!course);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Get modules for this course
        const modules = await Module.find({ course: course._id }).sort('order');
        
        // Check if user is enrolled (if authenticated)
        let isEnrolled = false;
        let userProgress = null;
        
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                const user = await User.findById(decoded.userId);
                
                if (user) {
                    isEnrolled = user.enrolledCourses.includes(course._id);
                    
                    if (isEnrolled) {
                        userProgress = await UserProgress.findOne({ 
                            user: user._id, 
                            course: course._id 
                        }).populate('moduleProgress.module');
                    }
                }
            } catch (error) {
                console.error('Token verification error:', error);
            }
        }

        // If user is enrolled, unlock modules based on progress
        if (userProgress) {
            const moduleProgressMap = {};
            userProgress.moduleProgress.forEach(mp => {
                moduleProgressMap[mp.module._id.toString()] = mp;
            });
            
            modules.forEach(module => {
                const moduleId = module._id.toString();
                if (moduleProgressMap[moduleId]) {
                    module.isLocked = false;
                } else {
                    // Check if previous module is completed
                    const prevModule = modules.find(m => m.order === module.order - 1);
                    if (prevModule && moduleProgressMap[prevModule._id.toString()]?.isCompleted) {
                        module.isLocked = false;
                    }
                }
            });
        }

        res.json({
            course,
            modules,
            isEnrolled,
            userProgress
        });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});

// Enroll in a course
router.post('/:id/enroll', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is already enrolled
        if (req.user.enrolledCourses.includes(course._id)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Add course to user's enrolled courses
        req.user.enrolledCourses.push(course._id);
        await req.user.save();

        // Increment enrolled users count
        course.enrolledUsers += 1;
        await course.save();

        // Create user progress record
        const modules = await Module.find({ course: course._id }).sort('order');
        const moduleProgress = modules.map(module => ({
            module: module._id,
            isCompleted: false
        }));

        // Unlock first module
        if (moduleProgress.length > 0) {
            moduleProgress[0].isLocked = false;
        }

        const userProgress = new UserProgress({
            user: req.user._id,
            course: course._id,
            moduleProgress
        });

        await userProgress.save();

        res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ message: 'Error enrolling in course' });
    }
});

// Get module by ID
router.get('/:courseId/modules/:moduleId', authMiddleware, async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Check if module belongs to the course
        if (module.course.toString() !== req.params.courseId) {
            return res.status(400).json({ message: 'Module does not belong to this course' });
        }

        // Check if user is enrolled in the course
        if (!req.user.enrolledCourses.includes(req.params.courseId)) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Get user progress
        const userProgress = await UserProgress.findOne({
            user: req.user._id,
            course: req.params.courseId
        });

        if (!userProgress) {
            return res.status(404).json({ message: 'Course progress not found' });
        }

        // Check if module is locked
        const moduleProgress = userProgress.moduleProgress.find(
            mp => mp.module.toString() === req.params.moduleId
        );

        if (!moduleProgress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }

        // If module is locked, check if previous module is completed
        if (module.isLocked) {
            const prevModule = await Module.findOne({
                course: req.params.courseId,
                order: module.order - 1
            });

            if (prevModule) {
                const prevModuleProgress = userProgress.moduleProgress.find(
                    mp => mp.module.toString() === prevModule._id.toString()
                );

                if (!prevModuleProgress || !prevModuleProgress.isCompleted) {
                    return res.status(403).json({ message: 'Previous module not completed' });
                }
            }
        }

        res.json({
            module,
            progress: moduleProgress
        });
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({ message: 'Error fetching module' });
    }
});

// Get user progress for a course
router.get('/:courseId/progress', authMiddleware, async (req, res) => {
    try {
        // Check if user is enrolled in the course
        if (!req.user.enrolledCourses.includes(req.params.courseId)) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Get user progress
        const userProgress = await UserProgress.findOne({
            user: req.user._id,
            course: req.params.courseId
        }).populate('moduleProgress.module');

        if (!userProgress) {
            return res.status(404).json({ message: 'Course progress not found' });
        }

        res.json(userProgress);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Error fetching progress' });
    }
});

// Complete a module
router.post('/:courseId/modules/:moduleId/complete', authMiddleware, async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Check if module belongs to the course
        if (module.course.toString() !== req.params.courseId) {
            return res.status(400).json({ message: 'Module does not belong to this course' });
        }

        // Check if user is enrolled in the course
        if (!req.user.enrolledCourses.includes(req.params.courseId)) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Get user progress
        const userProgress = await UserProgress.findOne({
            user: req.user._id,
            course: req.params.courseId
        });

        if (!userProgress) {
            return res.status(404).json({ message: 'Course progress not found' });
        }

        // Find module progress
        const moduleProgressIndex = userProgress.moduleProgress.findIndex(
            mp => mp.module.toString() === req.params.moduleId
        );

        if (moduleProgressIndex === -1) {
            return res.status(404).json({ message: 'Module progress not found' });
        }

        // If module is already completed, return success
        if (userProgress.moduleProgress[moduleProgressIndex].isCompleted) {
            return res.json({ message: 'Module already completed' });
        }

        // Mark module as completed
        userProgress.moduleProgress[moduleProgressIndex].isCompleted = true;
        userProgress.moduleProgress[moduleProgressIndex].completedAt = new Date();

        // If it's a quiz module, store the score
        if (module.type === 'quiz' && req.body.score) {
            userProgress.moduleProgress[moduleProgressIndex].quizScore = req.body.score;
        }

        // Calculate overall progress
        const totalModules = userProgress.moduleProgress.length;
        const completedModules = userProgress.moduleProgress.filter(mp => mp.isCompleted).length;
        userProgress.progress = Math.round((completedModules / totalModules) * 100);

        // If all modules are completed, mark course as completed
        if (userProgress.progress === 100 && !userProgress.isCompleted) {
            userProgress.isCompleted = true;
            userProgress.completedAt = new Date();
            
            // Find the full course to get the course reward
            const course = await Course.findById(req.params.courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            
            // Award the full course reward instead of just the module reward
            const courseReward = parseFloat(course.reward) || 0;
            userProgress.earnedReward = courseReward.toString();

            // Update user's completed courses count
            req.user.completedCourses += 1;
            await req.user.save();

            // Update user's wallet with the course reward
            const currentWallet = parseFloat(req.user.wallet) || 0;
            req.user.wallet = (currentWallet + courseReward).toString();
            
            // Update total earnings
            const currentEarnings = parseFloat(req.user.totalEarnings) || 0;
            req.user.totalEarnings = (currentEarnings + courseReward).toString();
            
            // Record the transaction
            try {
                await recordTransaction(
                    req.user._id,
                    'course',
                    courseReward.toString(),
                    req.user.walletAddress,
                    `Completed course: ${course.title}`
                );
            } catch (txError) {
                console.error('Error recording transaction:', txError);
                // Continue execution even if transaction recording fails
            }
            
            await req.user.save();
        }

        await userProgress.save();

        res.json({ 
            message: 'Module completed successfully',
            progress: userProgress.progress,
            isCourseCompleted: userProgress.isCompleted
        });
    } catch (error) {
        console.error('Complete module error:', error);
        res.status(500).json({ message: 'Error completing module' });
    }
});

module.exports = router; 