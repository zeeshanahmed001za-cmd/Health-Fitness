import asyncHandler from 'express-async-handler';
import Nutrition from '../models/Nutrition.js';
import Workout from '../models/Workout.js';

// @desc    Parse natural language input and log activity
// @route   POST /api/user/quick-log
// @access  Private
export const quickLog = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'No text provided' });
    }

    const input = text.toLowerCase();
    let result = null;

    // Pattern 1: Water (e.g. "2 cups of water", "500ml water")
    const waterPattern = /(\d+)\s*(cup|cups|ml|liter|liters|glass|glasses)\s*(?:of\s+)?water/i;
    const waterMatch = input.match(waterPattern);
    
    if (waterMatch) {
        let amount = parseInt(waterMatch[1]);
        const unit = waterMatch[2].toLowerCase();

        // Convert common units to ml
        if (unit.startsWith('cup') || unit.startsWith('glass')) {
            amount = amount * 250;
        } else if (unit.startsWith('liter')) {
            amount = amount * 1000;
        }

        result = await Nutrition.create({
            user: req.user._id,
            activityType: 'water',
            name: 'Water',
            amount: amount,
            timestamp: Date.now()
        });

        return res.status(201).json({ 
            message: `Logged ${amount}ml of water!`,
            data: result 
        });
    }

    // Pattern 2: Food with calories (e.g. "500 calorie pizza", "ate 300 cal apple")
    const foodPattern = /(?:ate\s+)?(\d+)\s*(?:calorie|calories|cal|cals)\s+(?:of\s+)?(.+)/i;
    const foodMatch = input.match(foodPattern);

    if (foodMatch) {
        const calories = parseInt(foodMatch[1]);
        const foodName = foodMatch[2].trim();

        // Simple estimation logic for macros if not provided
        // In a real app, this would call a Nutrition API
        result = await Nutrition.create({
            user: req.user._id,
            activityType: 'food',
            name: foodName,
            category: 'snacks', // Default
            calories: calories,
            protein: Math.round(calories * 0.05), // Estimation
            carbs: Math.round(calories * 0.12),  // Estimation
            fat: Math.round(calories * 0.03),    // Estimation
            timestamp: Date.now()
        });

        return res.status(201).json({ 
            message: `Logged ${foodName} (${calories} kcal)!`,
            data: result 
        });
    }

    // Pattern 3: Exercise (e.g. "30 mins of running", "ran for 20 minutes")
    const exercisePattern = /(?:did\s+)?(\d+)\s*(?:mins|minutes|min)\s+(?:of\s+)?(.+)/i;
    const exerciseMatch = input.match(exercisePattern);

    if (exerciseMatch) {
        const duration = parseInt(exerciseMatch[1]);
        const exerciseName = exerciseMatch[2].trim();

        result = await Workout.create({
            user: req.user._id,
            type: 'Other',
            duration: duration,
            caloriesBurned: duration * 8, // Rough estimate
            date: Date.now(),
            exercises: [{
                name: exerciseName,
            }]
        });

        return res.status(201).json({ 
            message: `Logged ${duration} mins of ${exerciseName}!`,
            data: result 
        });
    }

    return res.status(400).json({ 
        message: "Sorry, I couldn't parse that. Try something like '2 cups of water' or '500 cal pizza'." 
    });
});
