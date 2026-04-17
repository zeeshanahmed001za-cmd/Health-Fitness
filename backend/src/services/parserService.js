/**
 * Intelligent parser service that handles rule-based (Regex) 
 * parsing for health and fitness logs.
 */

// --- Rule-Based Regex Parser ---
export const parseWithRules = (text) => {
    const input = text.toLowerCase().trim();
    
    // Water Detection
    const waterRegex = /(\d+\.?\d*)\s*(cups?|glasses?|ml|l|liters?|bottle|oz)?\s*water/i;
    const waterMatch = input.match(waterRegex);
    if (waterMatch || (input.includes('water') && input.match(/(\d+\.?\d*)/))) {
        const amountMatch = input.match(/(\d+\.?\d*)/);
        let amount = amountMatch ? parseFloat(amountMatch[0]) : 1;
        const unit = (waterMatch && waterMatch[2]) ? waterMatch[2].toLowerCase() : '';
        
        if (unit === 'l' || unit.includes('liter')) {
            amount *= 1000;
        } else if (unit === 'oz') {
            amount *= 29.57;
        } else if (unit.includes('cup') || unit.includes('glass') || amount < 5) {
            amount *= 250;
        }

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
        const durationMatch = input.match(/(\d+)\s*(?:minutes|mins|min|hour|hr|h)\b/i);
        let duration = durationMatch ? parseInt(durationMatch[1]) : null;
        if (durationMatch && durationMatch[0].match(/hour|hr|h/i)) duration *= 60;
        
        if (duration) {
            let type = 'Other';
            if (/run|ran|walk|cycle|swim|cardio/i.test(input)) type = 'Cardio';
            else if (/lift|gym|strength|weight/i.test(input)) type = 'Strength';
            let name = input.replace(/\b(\d+)\b|\b(?:minutes|mins|min|hours?|hrs?|h|for|at|of|the|workout|did)\b/gi, '').trim();
            // remove multiple spaces
            name = name.replace(/\s+/g, ' ').trim();
            return { activityType: 'workout', data: { type, duration, name: name || 'Exercise', caloriesBurned: duration * 7 } };
        }
    }

    // Simple Food Detection (with explicit calories)
    const calorieMatch = input.match(/(\d+)\s*(?:calories|kcal|cals|cal)\b/i);
    if (calorieMatch && input.split(' ').length < 8) {
        const calories = parseInt(calorieMatch[1]);
        let name = input.replace(/(\d+)\s*(?:calories|kcal|cals|cal)\b/i, '').replace(/\b(?:ate|had|for)\b/gi, '').trim();
        name = name.replace(/\s+/g, ' ').trim();
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


