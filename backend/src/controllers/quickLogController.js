import asyncHandler from 'express-async-handler';
import Nutrition from '../models/Nutrition.js';
import Workout from '../models/Workout.js';
import Progress from '../models/Progress.js';
import { parseWithRules } from '../services/parserService.js';

/**
 * Controller for handling natural language activity logs.
 * It uses a rule-based approach to identify user input.
 * If details are missing, it prompts the user for refinement.
 */

// @desc    Parse natural language input and log activity
// @route   POST /api/user/quick-log
// @access  Private
export const quickLog = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'No text provided' });

    // Attempt parsing through rules
    let parsed = parseWithRules(text);
    let source = 'rules';

    // Determine if we need refinement (Manual input for macros/specifics)
    if (parsed && parsed.activityType === 'food') {
        const d = parsed.data;
        
        // If it's a rule match but has 0 calories, ask for refinement
        if (!d.calories || d.calories < 10) {
            return res.status(200).json({
                needsRefinement: true,
                activityType: 'food',
                name: d.name,
                data: d
            });
        }
    }

    // If no match at all, ask for manual entry refinement
    if (!parsed) {
        return res.status(200).json({
            needsRefinement: true,
            activityType: 'food',
            name: text,
            data: {}
        });
    }

    const { activityType, data } = parsed;
    let result = null;
    let message = `Logged via ${source}`;

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
        return res.status(201).json({ message: `${message}`, data: result });
    } else {
        return res.status(400).json({ message: 'Failed to process log.' });
    }
});


