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
    };

    if (includeToken) {
        json.token = generateToken(user._id);
    }

    return json;
};
