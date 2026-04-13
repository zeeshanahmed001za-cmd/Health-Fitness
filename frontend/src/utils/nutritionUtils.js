/**
 * Utility functions for nutrition calculations and data formatting.
 */

/**
 * Checks if a given timestamp represents today in local time.
 * @param {string|number} timestamp 
 * @returns {boolean}
 */
export const isToday = (timestamp) => {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

/**
 * Calculates dynamic nutrition goals based on user profile data.
 * @param {Object} data - User data object
 * @returns {Object|null}
 */
export const calculateDynamicGoals = (data) => {
    let defaultGoals = { calories: 2100, protein: 150, carbs: 200, fat: 70 };
    if (data.calorieGoal) {
        const cal = parseInt(data.calorieGoal);
        return {
            ...defaultGoals,
            calories: cal,
            protein: Math.round(cal * 0.3 / 4),
            carbs: Math.round(cal * 0.4 / 4),
            fat: Math.round(cal * 0.3 / 9)
        };
    }

    let weight = parseFloat(data.weightValue);
    if (!weight) return null;

    if (data.weightUnit === "imperial" || data.weightUnit === "lbs") {
        weight = weight * 0.453592;
    }

    let height = 0;
    if (data.heightUnit === "imperial" && data.heightFeet) {
        const ft = parseFloat(data.heightFeet) || 0;
        const inc = parseFloat(data.heightInches) || 0;
        height = (ft * 12 + inc) * 2.54;
    } else if (data.heightCm) {
        height = parseFloat(data.heightCm);
    }

    if (!height) return null;

    let age = 30;
    if (data.dob) {
        const today = new Date();
        const birthDate = new Date(data.dob);
        age = today.getFullYear() - birthDate.getFullYear();
    }

    const isMale = data.gender === "male";
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
    let tdee = bmr * 1.55;

    if (data.activityLevel === "sedentary") tdee = bmr * 1.2;
    else if (data.activityLevel === "lightly_active") tdee = bmr * 1.375;
    else if (data.activityLevel === "active") tdee = bmr * 1.55;
    else if (data.activityLevel === "very_active") tdee = bmr * 1.725;

    let calorieModifier = 0;
    const goal = Array.isArray(data.primaryGoal) ? data.primaryGoal[0] : data.primaryGoal;
    if (goal === "weight_loss") calorieModifier = -500;
    else if (goal === "muscle_gain") calorieModifier = 300;

    const finalCalories = Math.round(tdee + calorieModifier);
    const protein = Math.round(weight * 2.2);
    const fat = Math.round((finalCalories * 0.25) / 9);
    const carbs = Math.round((finalCalories - (protein * 4) - (fat * 9)) / 4);

    return {
        calories: finalCalories,
        protein: protein > 0 ? protein : defaultGoals.protein,
        carbs: carbs > 0 ? carbs : defaultGoals.carbs,
        fat: fat > 0 ? fat : defaultGoals.fat
    };
};
