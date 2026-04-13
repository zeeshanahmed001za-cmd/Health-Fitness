import axios from 'axios';

/**
 * Service to fetch nutrition data from external APIs
 * Currently supporting Nutritionix (Natural Language)
 */
export const fetchNutritionData = async (query) => {
    // 1. Try API Ninjas (Simpler setup, great for NLP)
    const NINJA_KEY = process.env.API_NINJAS_KEY;
    if (NINJA_KEY) {
        try {
            const response = await axios.get(
                `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
                { headers: { 'X-Api-Key': NINJA_KEY } }
            );
            console.log('API Ninjas Raw Response:', JSON.stringify(response.data));

            if (response.data && response.data.length > 0) {
                // API Ninjas returns an array of items found in the string
                // We sum them up for the total log
                 const totals = response.data.reduce((acc, item) => {
                    const row = {
                        calories: acc.calories + (Number(item.calories) || 0),
                        protein: acc.protein + (Number(item.protein_g) || 0),
                        fat: acc.fat + (Number(item.fat_total_g) || 0),
                        carbs: acc.carbs + (Number(item.carbohydrates_total_g) || 0),
                        names: [...acc.names, item.name]
                    };
                    console.log('Reduce step item:', item.name, 'current totals:', row);
                    return row;
                }, { calories: 0, protein: 0, fat: 0, carbs: 0, names: [] });

                return {
                    name: totals.names.join(', '),
                    calories: Math.round(totals.calories),
                    protein: Math.round(totals.protein),
                    carbs: Math.round(totals.carbs),
                    fat: Math.round(totals.fat),
                    source: 'API Ninjas'
                };
            }
        } catch (error) {
            console.error('API Ninjas Error:', error.message);
        }
    }

    // 2. Try Nutritionix (Original option)
    const APP_ID = process.env.NUTRITIONIX_APP_ID;
    const APP_KEY = process.env.NUTRITIONIX_API_KEY;

    if (APP_ID && APP_KEY) {
        try {
            const response = await axios.post(
                'https://trackapi.nutritionix.com/v2/natural/nutrients',
                { query },
                {
                    headers: {
                        'x-app-id': APP_ID,
                        'x-app-key': APP_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.foods && response.data.foods.length > 0) {
                const food = response.data.foods[0];
                return {
                    name: food.food_name,
                    calories: Math.round(food.nf_calories),
                    protein: Math.round(food.nf_protein),
                    carbs: Math.round(food.nf_total_carbohydrate),
                    fat: Math.round(food.nf_total_fat),
                    source: 'Nutritionix'
                };
            }
        } catch (error) {
            console.error('Nutritionix API Error:', error.message);
        }
    }

    return null; // Fallback to internal smart estimator
};
