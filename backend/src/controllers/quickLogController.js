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

    // --- 1. WATER DETECTION ---
    const waterKeywords = ['water', 'drank', 'cup', 'cups', 'ml', 'glass', 'glasses'];
    const isWater = waterKeywords.some(kw => input.includes(kw)) && !input.includes('calorie') && !input.includes('eat');
    
    if (isWater) {
        const amountMatch = input.match(/(\d+)/);
        let amount = amountMatch ? parseInt(amountMatch[0]) : 1;
        const subInput = input.replace(/\d+/g, '').trim();
        
        // If no unit but mentions cups/glasses, treat as cups
        if (subInput.includes('cup') || subInput.includes('glass') || amount < 10) {
            amount = amount * 250; // Assume 250ml per cup/glass
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

    // --- 2. EXERCISE DETECTION ---
    const exerciseKeywords = ['min', 'mins', 'minutes', 'ran', 'workout', 'pushup', 'did', 'run', 'gym', 'training'];
    const isExercise = exerciseKeywords.some(kw => input.includes(kw));

    if (isExercise) {
        const durationMatch = input.match(/(\d+)/);
        const duration = durationMatch ? parseInt(durationMatch[0]) : 30; // Default 30 mins
        
        // Clean up the input to extract exercise name
        let exerciseName = input
            .replace(/(\d+)/g, '')
            .replace(/mins?|minutes?|did|for|of|the|workout/g, '')
            .trim();
        
        exerciseName = exerciseName || 'General Exercise';

        result = await Workout.create({
            user: req.user._id,
            type: 'Other',
            duration: duration,
            caloriesBurned: duration * 7, // Baseline 7 cal/min
            date: Date.now(),
            exercises: [{
                name: exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1),
            }]
        });

        return res.status(201).json({ 
            message: `Logged ${duration} mins of ${exerciseName}!`,
            data: result 
        });
    }

    // --- 3. FOOD DETECTION (FALLBACK) ---
    // If it mentions "ate", "had", "food", "calorie" or is just a string
    const calorieMatch = input.match(/(\d+)\s*(?:cal|calories|kcal)/);
    const calories = calorieMatch ? parseInt(calorieMatch[1]) : 300; // Default to 300 if just item named
    
    let foodName = input
        .replace(/(\d+)\s*(?:cal|calories|kcal|cals)/g, '')
        .replace(/ate|had|finished|some|a|one|for|lunch|dinner|breakfast|snack/g, '')
        .trim();

    if (foodName.length > 2) {
        result = await Nutrition.create({
            user: req.user._id,
            activityType: 'food',
            name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
            category: 'snacks',
            calories: calories,
            protein: Math.round(calories * 0.05),
            carbs: Math.round(calories * 0.12),
            fat: Math.round(calories * 0.03),
            timestamp: Date.now()
        });

        return res.status(201).json({ 
            message: `Logged ${foodName} (${calories} kcal)!`,
            data: result 
        });
    }

    return res.status(400).json({ 
        message: "I couldn't quite catch that. Try 'ate a burger' or 'ran 30 mins'." 
    });
});
