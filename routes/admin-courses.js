const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Module = require('../models/Module');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const { adminAuthMiddleware } = require('./admin');

// Get all courses with pagination, sorting, and filtering
router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Sorting
        const sort = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1; // Default sort by creation date (newest first)
        }
        
        // Filtering
        const match = {};
        if (req.query.search) {
            match.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        if (req.query.category) {
            match.category = req.query.category;
        }
        
        if (req.query.difficulty) {
            match.difficulty = req.query.difficulty;
        }
        
        // Get courses
        const courses = await Course.find(match)
            .sort(sort)
            .limit(limit)
            .skip(skip);
            
        // Get total count for pagination
        const totalCourses = await Course.countDocuments(match);
        
        res.json({
            courses,
            pagination: {
                total: totalCourses,
                page,
                limit,
                pages: Math.ceil(totalCourses / limit)
            }
        });
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single course by ID with modules and progress statistics
router.get('/:courseId', adminAuthMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Get modules for this course
        const modules = await Module.find({ course: req.params.courseId }).sort('order');
        
        // Get progress statistics
        const totalEnrollments = course.enrolledUsers || 0;
        
        const completedProgress = await UserProgress.countDocuments({ 
            course: req.params.courseId,
            isCompleted: true
        });
        
        const inProgressCount = await UserProgress.countDocuments({ 
            course: req.params.courseId,
            isCompleted: false
        });
        
        const completionRate = totalEnrollments > 0 ? Math.round((completedProgress / totalEnrollments) * 100) : 0;
        
        res.json({
            course,
            modules,
            progressStats: {
                total: totalEnrollments,
                completed: completedProgress,
                inProgress: inProgressCount,
                completionRate
            }
        });
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new course
router.post('/', adminAuthMiddleware, async (req, res) => {
    try {
        const { title, description, image, reward, difficulty, category, slug, code, customId } = req.body;
        
        // Validate input
        if (!title || !description || !image || !reward || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Create course
        const course = new Course({
            title,
            description,
            image,
            reward,
            difficulty: difficulty || 'Beginner',
            category,
            slug,
            code,
            customId,
            totalModules: 0,
            enrolledUsers: 0
        });
        
        await course.save();
        
        res.status(201).json({
            message: 'Course created successfully',
            course
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update course
router.patch('/:courseId', adminAuthMiddleware, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = [
            'title', 'description', 'image', 'reward', 'difficulty', 
            'category', 'slug', 'code', 'customId'
        ];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }
        
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Apply updates
        updates.forEach(update => course[update] = req.body[update]);
        await course.save();
        
        res.json({
            message: 'Course updated successfully',
            course
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete course
router.delete('/:courseId', adminAuthMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Delete all modules in this course
        await Module.deleteMany({ course: req.params.courseId });
        
        // Delete all progress records for this course
        await UserProgress.deleteMany({ course: req.params.courseId });
        
        // Remove course from users' enrolled courses
        await User.updateMany(
            { enrolledCourses: req.params.courseId },
            { $pull: { enrolledCourses: req.params.courseId } }
        );
        
        // Delete the course
        await Course.findByIdAndDelete(req.params.courseId);
        
        res.json({ message: 'Course and all associated data deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// MODULES API

// Create new module
router.post('/:courseId/modules', adminAuthMiddleware, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const { title, description, type, level, reward, order, isLocked, content } = req.body;
        
        // Validate input
        if (!title || !description || !type || !level || !reward || !order) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Validate content based on type
        if (type === 'video' && (!content || !content.videoUrl)) {
            return res.status(400).json({ message: 'Video URL is required for video modules' });
        }
        
        if (type === 'text' && (!content || !content.textContent)) {
            return res.status(400).json({ message: 'Text content is required for text modules' });
        }
        
        if (type === 'quiz' && (!content || !content.questions || content.questions.length === 0)) {
            return res.status(400).json({ message: 'Questions are required for quiz modules' });
        }
        
        // Create module
        const module = new Module({
            title,
            description,
            type,
            level,
            course: courseId,
            reward,
            order,
            isLocked: isLocked !== undefined ? isLocked : true,
            content
        });
        
        await module.save();
        
        // Update course with module
        course.modules.push(module._id);
        course.totalModules = course.modules.length;
        await course.save();
        
        // Update module order for all users who are enrolled in this course
        // Find all users who are enrolled in this course and update their moduleProgress
        const userProgresses = await UserProgress.find({ course: courseId });
        
        for (const progress of userProgresses) {
            progress.moduleProgress.push({
                module: module._id,
                isCompleted: false
            });
            await progress.save();
        }
        
        res.status(201).json({
            message: 'Module created successfully',
            module
        });
    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update module
router.patch('/:courseId/modules/:moduleId', adminAuthMiddleware, async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const courseId = req.params.courseId;
        
        const module = await Module.findOne({ _id: moduleId, course: courseId });
        
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        
        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'type', 'level', 'reward', 'order', 'isLocked', 'content'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }
        
        // Apply updates
        updates.forEach(update => {
            if (update === 'content') {
                // Merge content objects instead of replacing
                module.content = { ...module.content, ...req.body.content };
            } else {
                module[update] = req.body[update];
            }
        });
        
        await module.save();
        
        res.json({
            message: 'Module updated successfully',
            module
        });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete module
router.delete('/:courseId/modules/:moduleId', adminAuthMiddleware, async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const courseId = req.params.courseId;
        
        const module = await Module.findOne({ _id: moduleId, course: courseId });
        
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        
        // Delete the module
        await Module.findByIdAndDelete(moduleId);
        
        // Update course by removing module from modules array
        const course = await Course.findById(courseId);
        if (course) {
            course.modules = course.modules.filter(id => id.toString() !== moduleId);
            course.totalModules = course.modules.length;
            await course.save();
        }
        
        // Remove module progress from all user progress records
        await UserProgress.updateMany(
            { course: courseId },
            { $pull: { moduleProgress: { module: moduleId } } }
        );
        
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 