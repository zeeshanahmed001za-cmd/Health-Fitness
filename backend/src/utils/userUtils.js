/**
 * Utility functions for user data processing and formatting.
 */

import generateToken from './generateToken.js';

/**
 * Maps a Mongoose User document to a clean JSON object for API responses.
 * @param {Object} user - User document
 * @param {boolean} includeToken - Whether to include a fresh JWT token
 * @returns {Object}
 */
export const mapUserToJSON = (user, includeToken = false) => {
    const json = {
        _id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob,
        age: user.age,
        gender: user.gender,
        location: user.location,
        primaryGoal: user.primaryGoal,
        fitnessLevel: user.fitnessLevel,
        activityLevel: user.activityLevel,
        heightUnit: user.heightUnit,
        heightFeet: user.heightFeet,
        heightInches: user.heightInches,
        heightCm: user.heightCm,
        height: user.height,
        weightUnit: user.weightUnit,
        weightValue: user.weightValue,
        goalWeightValue: user.goalWeightValue,
        emailNotifications: user.emailNotifications,
        smsReminders: user.smsReminders,
        publicProfile: user.publicProfile,
        loginStreak: user.loginStreak || 0,
        lastLoginDate: user.lastLoginDate
    };

    if (includeToken) {
        json.token = generateToken(user._id);
    }

    return json;
};

/**
 * Updates a user's login streak based on current date.
 * @param {Object} user - Mongoose user document
 * @returns {Promise<Object>} Updated user document
 */
export const updateStreak = async (user) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (user.lastLoginDate === todayStr) {
        return user; // Already logged today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (user.lastLoginDate === yesterdayStr) {
        user.loginStreak = (user.loginStreak || 0) + 1;
    } else {
        user.loginStreak = 1; // Reset if missed a day
    }

    user.lastLoginDate = todayStr;
    return await user.save();
};
