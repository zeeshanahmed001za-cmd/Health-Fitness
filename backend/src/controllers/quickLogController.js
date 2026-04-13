import asyncHandler from 'express-async-handler';
import Nutrition from '../models/Nutrition.js';
import Workout from '../models/Workout.js';
import Progress from '../models/Progress.js';
import { parseWithRules, parseWithExternalAPI, parseWithAI } from '../services/parserService.js';

/**
 * Controller for handling natural language activity logs.
 * It uses a multi-layered approach: Rule-based -> External API -> AI Fallback.
 */

// @desc    Parse natural language input and log activity
// @route   POST /api/user/quick-log
// @access  Private
export const quickLog = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'No text provided' });
    }

    // Attempt parsing through layers
    let parsed = parseWithRules(text);
    let source = 'rules';

    if (!parsed) {
        parsed = await parseWithExternalAPI(text);
        source = 'external-api';
    }

    if (!parsed) {
        parsed = await parseWithAI(text);
        source = 'ai';
    }

    if (!parsed || !parsed.activityType || !parsed.data) {
        return res.status(400).json({ message: 'Could not understand the log. Try being more specific.' });
    }

    const { activityType, data } = parsed;
    let result = null;
    let message = "";

    switch (activityType) {
        case 'food':
            result = await Nutrition.create({
                user: req.user._id,
                activityType: 'food',
                name: data.name || 'Meal',
                calories: Math.round(data.calories || 0),
                protein: Math.round(data.protein || 0),
                carbs: Math.round(data.carbs || 0),
                fat: Math.round(data.fat || 0),
                category: data.category || 'snacks',
                timestamp: Date.now()
            });
            message = `Logged ${result.name} (${result.calories} kcal)!`;
            break;

        case 'water':
            result = await Nutrition.create({
                user: req.user._id,
                activityType: 'water',
                name: 'Water',
                amount: Math.round(data.amount || 250),
                timestamp: Date.now()
            });
            message = `Logged ${result.amount}ml of water!`;
            break;

        case 'workout':
            result = await Workout.create({
                user: req.user._id,
                type: data.type || 'Other',
                duration: data.duration || 30,
                caloriesBurned: data.caloriesBurned || (data.duration * 7),
                date: Date.now(),
                exercises: [{ name: data.name || 'Exercise' }]
            });
            message = `Logged ${result.duration} mins of ${result.exercises[0].name}!`;
            break;

        case 'weight':
            result = await Progress.create({
                user: req.user._id,
                weight: data.weight,
                date: Date.now()
            });
            message = `Logged weight: ${result.weight} kg`;
            break;
    }

    if (result) {
        return res.status(201).json({ message: `${message} (via ${source})`, data: result });
    } else {
        return res.status(400).json({ message: 'Failed to process and save the log.' });
    }
});
