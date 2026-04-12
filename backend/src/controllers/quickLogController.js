import asyncHandler from 'express-async-handler';
import Nutrition from '../models/Nutrition.js';
import Workout from '../models/Workout.js';

// @desc    Parse natural language input and log activity
// @route   POST /api/user/quick-log
// @access  Private
const quickLog = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400);
        throw new Error('Please provide search text');
    }

    const input = text.toLowerCase();
    
    // 1. Check for Water
    // Examples: "2 glasses of water", "water 500ml", "drank 3 cups"
    const waterRegex = /(\d+)\s*(ml|oz|cups?|glasses?|units?)?\s*(of\s+)?water/i;
    const waterMatch = input.match(waterRegex) || input.match(/water\s*(\d+)/i);
    
    if (waterMatch) {
        let amount = parseInt(waterMatch[1]);
        const unit = waterMatch[2] || 'ml';
        
        // Normalize to ML
        if (unit.includes('cup') || unit.includes('glass')) amount *= 250;
        if (unit.includes('oz')) amount *= 30;

        const log = new Nutrition({
            user: req.user._id,
            activityType: 'water',
            name: 'Water',
            amount: amount,
            timestamp: Date.now()
        });
        await log.save();
        return res.status(201).json({ 
            type: 'water', 
            message: `Logged ${amount}ml of water`, 
            data: log 
        });
    }

    // 2. Check for Food
    // Examples: "ate 500 calories of pizza", "200kcal apple", "pizza 400 cal"
    const foodRegex = /(\d+)\s*(kcal|calories|cal)\s*(of\s+)?(.+)/i;
    const foodMatch = input.match(foodRegex) || input.match(/(.+)\s+(\d+)\s*(kcal|calories|cal)/i);

    if (foodMatch) {
        let calories, name;
        if (input.match(/^\d/)) { // Starts with numbers: "500 cal pizza"
            calories = parseInt(foodMatch[1]);
            name = foodMatch[4].trim();
        } else { // Starts with name: "pizza 500 cal"
            name = foodMatch[1].trim();
            calories = parseInt(foodMatch[2]);
        }

        const log = new Nutrition({
            user: req.user._id,
            activityType: 'food',
            name: name.charAt(0).toUpperCase() + name.slice(1),
            category: 'snacks',
            calories: calories,
            timestamp: Date.now()
        });
        await log.save();
        return res.status(201).json({ 
            type: 'food', 
            message: `Logged ${calories} kcal for ${name}`, 
            data: log 
        });
    }

    // 3. Check for Exercise
    // Examples: "ran for 30 minutes", "pushups 20 mins", "30 min workout"
    const workoutRegex = /(.+)\s+for\s+(\d+)\s*(mins?|minutes?)/i;
    const workoutMatch = input.match(workoutRegex) || input.match(/(\d+)\s*(mins?|minutes?)\s*(of\s+)?(.+)/i);

    if (workoutMatch) {
        let duration, name;
        if (input.includes('for')) {
            name = workoutMatch[1].trim();
            duration = parseInt(workoutMatch[2]);
        } else {
            duration = parseInt(workoutMatch[1]);
            name = (workoutMatch[4] || 'Exercise').trim();
        }

        const log = new Workout({
            user: req.user._id,
            type: 'Other',
            duration: duration,
            caloriesBurned: duration * 8, // Estimate 8 cal/min
            exercises: [{ name: name.charAt(0).toUpperCase() + name.slice(1) }],
            date: Date.now()
        });
        await log.save();
        return res.status(201).json({ 
            type: 'workout', 
            message: `Logged ${duration} mins of ${name}`, 
            data: log 
        });
    }

    res.status(400);
    throw new Error("Could not understand the activity. Try '2 glasses of water' or '500 cal pizza'");
});

export { quickLog };
