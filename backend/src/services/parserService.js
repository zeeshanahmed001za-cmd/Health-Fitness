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


