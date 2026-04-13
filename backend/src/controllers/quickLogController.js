import asyncHandler from 'express-async-handler';
import Nutrition from '../models/Nutrition.js';
import Workout from '../models/Workout.js';
import { fetchNutritionData } from '../services/nutritionService.js';

// @desc    Parse natural language input and log activity
// @route   POST /api/user/quick-log
// @access  Private
export const quickLog = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'No text provided' });
    }

    const input = text.toLowerCase();
    console.log('QuickLog original:', text);
    console.log('QuickLog lowercase:', input);
    let result = null;

    // --- 1. WATER DETECTION ---
    const waterKeywords = ['water', 'drank', 'cup', 'cups', 'ml', 'glass', 'glasses'];
    const isWater = waterKeywords.some(kw => input.includes(kw)) && !input.includes('calorie') && !input.includes('eat');
    
    if (isWater) {
        const amountMatch = input.match(/(\d+\.?\d*)/);
        let amount = amountMatch ? parseFloat(amountMatch[0]) : 1;
        const subInput = input.replace(/\d+\.?\d*/g, '').trim();
        
        // Handle common unit mappings
        if (subInput.includes('cup') || subInput.includes('glass') || amount < 10) {
            amount = amount * 250; // Assume 250ml per cup/glass
        } else if (subInput.includes('litre') || subInput.includes('liter') || subInput.includes(' l')) {
            amount = amount * 1000;
        }
        
        result = await Nutrition.create({
            user: req.user._id,
            activityType: 'water',
            name: 'Water',
            amount: Math.round(amount),
            timestamp: Date.now()
        });

        return res.status(201).json({ 
            message: `Logged ${Math.round(amount)}ml of water!`,
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

    // --- 3. FOOD DETECTION (CATCH-ALL) ---
    // Extract quantity (e.g. "2" in "2 eggs")
    const qtyMatch = input.match(/^(\d+)/);
    const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;

    // Extract explicit calories if present (e.g. "500 cal pizza")
    const calorieMatch = input.match(/(\d+)\s*(?:cal|calories|kcal|cals)/);
    const explicitCalories = calorieMatch ? parseInt(calorieMatch[1]) : null;
    
    // Category detection
    let category = 'snacks';
    if (input.includes('breakfast')) category = 'breakfast';
    else if (input.includes('lunch')) category = 'lunch';
    else if (input.includes('dinner')) category = 'dinner';

    // Smart Clean: Split words and filter out noise
    const noiseWords = new Set(['i', 'ate', 'had', 'an', 'a', 'the', 'some', 'finished', 'for', 'at', 'one', 'two', 'three', 'slices', 'slice', 'cups', 'cup', 'glasses', 'glass', 'of', 'breakfast', 'lunch', 'dinner']);
    let words = input.split(/\s+/)
        .filter(w => !noiseWords.has(w)) // Remove noise words
        .filter(w => !w.match(/^(\d+)(cal|calories|kcal|cals)?$/)) // Remove standalone numbers or calories
        .filter(w => w.length > 0);
    
    let foodName = words.join(' ');
    let calories, protein, carbs, fat;

    // --- NEW: Try External API First ---
    let nutritionData = await fetchNutritionData(text);

    if (nutritionData) {
        // Use API values
        if (explicitCalories && nutritionData.calories > 0) {
            // User provided explicit calories, scale the macros accordingly
            const ratio = explicitCalories / nutritionData.calories;
            calories = explicitCalories;
            protein = nutritionData.protein * ratio;
            carbs = nutritionData.carbs * ratio;
            fat = nutritionData.fat * ratio;
        } else {
            calories = nutritionData.calories;
            protein = nutritionData.protein;
            carbs = nutritionData.carbs;
            fat = nutritionData.fat;
        }
        foodName = nutritionData.name;
    } else {
        // --- FALLBACK (Basic) ---
        if (!foodName || foodName.length < 2) {
            foodName = text.length > 20 ? text.substring(0, 20) + '...' : text;
        }

        calories = explicitCalories || (150 * quantity);
        
        // Estimated standard distribution (grams per calorie)
        // Protein: 25% cals (0.0625g/cal), Carbs: 45% cals (0.1125g/cal), Fat: 30% cals (0.0333g/cal)
        protein = calories * 0.06;
        carbs = calories * 0.11;
        fat = calories * 0.035;
    }

    result = await Nutrition.create({
        user: req.user._id,
        activityType: 'food',
        name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
        category: category,
        calories: Math.round(Number(calories) || 0),
        protein: Math.round(Number(protein) || 0),
        carbs: Math.round(Number(carbs) || 0),
        fat: Math.round(Number(fat) || 0),
        timestamp: Date.now()
    });

    return res.status(201).json({ 
        message: `Logged ${foodName} (${Math.round(calories)} kcal)!`,
        data: result 
    });
});
