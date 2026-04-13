import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Intelligent parser service that handles both rule-based (Regex) 
 * and AI-based (Gemini) parsing for health and fitness logs.
 */

// --- 1. Rule-Based Regex Parser ---
export const parseWithRules = (text) => {
    const input = text.toLowerCase().trim();
    
    // Water Detection
    const waterRegex = /(\d+\.?\d*)\s*(cup|glass|ml|l|liter|glass|glasses|bottle|oz)?\s*water/i;
    const waterMatch = input.match(waterRegex);
    if (waterMatch || (input.includes('water') && input.match(/(\d+\.?\d*)/))) {
        const amountMatch = input.match(/(\d+\.?\d*)/);
        let amount = amountMatch ? parseFloat(amountMatch[0]) : 1;
        const unit = (waterMatch && waterMatch[2]) || '';
        if (unit.includes('cup') || unit.includes('glass') || amount < 5) amount *= 250;
        else if (unit === 'l' || unit.includes('liter')) amount *= 1000;
        else if (unit === 'oz') amount *= 29.57;

        return { activityType: 'water', data: { amount: Math.round(amount), name: 'Water' } };
    }

    // Weight Detection
    const weightRegex = /(?:weight|weigh|weighed|scale|scaled)\s*(\d+\.?\d*)\s*(kg|lbs|pounds)?/i;
    const weightMatch = input.match(weightRegex);
    if (weightMatch) {
        let weight = parseFloat(weightMatch[1]);
        if (weightMatch[2] === 'lbs' || weightMatch[2] === 'pounds') weight *= 0.453592;
        return { activityType: 'weight', data: { weight: Math.round(weight * 10) / 10 } };
    }

    // Workout Detection
    const workoutKeywords = ['run', 'ran', 'workout', 'gym', 'training', 'minutes', 'mins', 'min', 'walk', 'cycle', 'swim'];
    if (workoutKeywords.some(kw => input.includes(kw))) {
        const durationMatch = input.match(/(\d+)\s*(?:min|mins|minutes|hour|hr|h)/i);
        let duration = durationMatch ? parseInt(durationMatch[1]) : null;
        if (durationMatch && (durationMatch[0].includes('hour') || durationMatch[0].includes('hr'))) duration *= 60;
        
        if (duration) {
            let type = 'Other';
            if (/run|walk|cycle|swim/.test(input)) type = 'Cardio';
            else if (/lift|gym|strength/.test(input)) type = 'Strength';
            let name = input.replace(/(\d+)|min|mins|minutes|hour|hr|h|for|at|of|the|workout|did/g, '').trim();
            return { activityType: 'workout', data: { type, duration, name: name || 'Exercise', caloriesBurned: duration * 7 } };
        }
    }

    // Simple Food Detection (with explicit calories)
    const calorieMatch = input.match(/(\d+)\s*(?:cal|calories|kcal|cals)/i);
    if (calorieMatch && input.split(' ').length < 5) {
        const calories = parseInt(calorieMatch[1]);
        let name = input.replace(/(\d+)\s*(?:cal|calories|kcal|cals)/i, '').replace(/ate|had|for/g, '').trim();
        return {
            activityType: 'food',
            data: {
                name: name || 'Meal',
                calories,
                protein: Math.round(calories * 0.06),
                carbs: Math.round(calories * 0.11),
                fat: Math.round(calories * 0.035)
            }
        };
    }

    return null; // No rule match
};

// --- 2. External API Parser (Nutritionix/API Ninjas) ---
export const parseWithExternalAPI = async (query) => {
    const NINJA_KEY = process.env.API_NINJAS_KEY;
    if (NINJA_KEY) {
        try {
            const res = await axios.get(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, { headers: { 'X-Api-Key': NINJA_KEY } });
            if (res.data?.length > 0) {
                const totals = res.data.reduce((acc, item) => ({
                    calories: acc.calories + (Number(item.calories) || 0),
                    protein: acc.protein + (Number(item.protein_g) || 0),
                    fat: acc.fat + (Number(item.fat_total_g) || 0),
                    carbs: acc.carbs + (Number(item.carbohydrates_total_g) || 0),
                    names: [...acc.names, item.name]
                }), { calories: 0, protein: 0, fat: 0, carbs: 0, names: [] });
                return { activityType: 'food', data: { name: totals.names.join(', '), ...totals, names: undefined } };
            }
        } catch (e) { console.error('API Ninjas Error:', e.message); }
    }
    return null;
};

// --- 3. AI-Based Fallback Parser (Gemini) ---
export const parseWithAI = async (text) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Act as a nutrition expert. Parse: "${text}". Return STRICT JSON format ONLY.
            Format: {"activityType": "food"|"water"|"workout"|"weight", "data": { ... }}
            For food: name, calories, protein, carbs, fat, category.
            For water: amount (ml).
            For workout: name, type, duration (mins), caloriesBurned.
            For weight: weight (kg).
            Convert lbs to kg. Numbers ONLY for values.
        `;
        const result = await model.generateContent(prompt);
        const jsonStr = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) { console.error('AI Parser Error:', e.message); return null; }
};
