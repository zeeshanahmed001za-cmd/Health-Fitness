import asyncHandler from 'express-async-handler';
import Nutrition from '../models/Nutrition.js';

// @desc    Add a nutrition log (food or water)
// @route   POST /api/nutrition
// @access  Private
const addNutritionLog = asyncHandler(async (req, res) => {
    const { activityType, name, category, calories, protein, carbs, fat, amount, timestamp } = req.body;

    const log = new Nutrition({
        user: req.user._id,
        activityType,
        name,
        category,
        calories,
        protein,
        carbs,
        fat,
        amount,
        timestamp: timestamp || Date.now()
    });

    const createdLog = await log.save();
    res.status(201).json(createdLog);
});

// @desc    Get user's nutrition logs
// @route   GET /api/nutrition
// @access  Private
const getNutritionLogs = asyncHandler(async (req, res) => {
    const logs = await Nutrition.find({ user: req.user._id }).sort({ timestamp: 1 });
    res.json(logs);
});

// @desc    Delete a nutrition log
// @route   DELETE /api/nutrition/:id
// @access  Private
const deleteNutritionLog = asyncHandler(async (req, res) => {
    const log = await Nutrition.findById(req.params.id);

    if (log) {
        if (log.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }
        await log.deleteOne();
        res.json({ message: 'Log removed' });
    } else {
        res.status(404);
        throw new Error('Log not found');
    }
});

export { addNutritionLog, getNutritionLogs, deleteNutritionLog };
