import asyncHandler from 'express-async-handler';
import Progress from '../models/Progress.js';

// @desc    Add a new progress entry
// @route   POST /api/progress
// @access  Private
const addProgressEntry = asyncHandler(async (req, res) => {
    const { weight, bodyFatPercentage, measurements, notes } = req.body;

    const progress = new Progress({
        user: req.user._id,
        weight,
        bodyFatPercentage,
        measurements,
        notes
    });

    const createdProgress = await progress.save();
    res.status(201).json(createdProgress);
});

// @desc    Get user progress history
// @route   GET /api/progress
// @access  Private
const getProgressHistory = asyncHandler(async (req, res) => {
    const progressHistory = await Progress.find({ user: req.user._id }).sort({ date: 1 }); // Oldest to newest for charting
    res.json(progressHistory);
});

export { addProgressEntry, getProgressHistory };
