import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { mapUserToJSON, updateStreak } from '../utils/userUtils.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json(mapUserToJSON(user, true));
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const updatedUser = await updateStreak(user);
        res.json(mapUserToJSON(updatedUser, true));
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const updatedUser = await updateStreak(user);
        res.json(mapUserToJSON(updatedUser));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.firstName = req.body.firstName !== undefined ? req.body.firstName : user.firstName;
        user.lastName = req.body.lastName !== undefined ? req.body.lastName : user.lastName;
        user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
        
        if (req.body.dob !== undefined && req.body.dob !== "") user.dob = new Date(req.body.dob);
        user.location = req.body.location !== undefined ? req.body.location : user.location;
        user.primaryGoal = req.body.primaryGoal !== undefined ? req.body.primaryGoal : user.primaryGoal;
        user.fitnessLevel = req.body.fitnessLevel !== undefined ? req.body.fitnessLevel : user.fitnessLevel;
        user.activityLevel = req.body.activityLevel !== undefined ? req.body.activityLevel : user.activityLevel;
        user.heightUnit = req.body.heightUnit !== undefined ? req.body.heightUnit : user.heightUnit;
        user.heightFeet = req.body.heightFeet !== undefined ? req.body.heightFeet : user.heightFeet;
        user.heightInches = req.body.heightInches !== undefined ? req.body.heightInches : user.heightInches;
        user.heightCm = req.body.heightCm !== undefined ? req.body.heightCm : user.heightCm;
        user.weightUnit = req.body.weightUnit !== undefined ? req.body.weightUnit : user.weightUnit;
        
        // Handle numeric fields that might come in as empty strings
        if (req.body.height !== undefined && req.body.height !== "") user.height = Number(req.body.height);
        if (req.body.weightValue !== undefined && req.body.weightValue !== "") user.weightValue = Number(req.body.weightValue);
        if (req.body.goalWeightValue !== undefined && req.body.goalWeightValue !== "") user.goalWeightValue = Number(req.body.goalWeightValue);
        if (req.body.age !== undefined && req.body.age !== "") user.age = Number(req.body.age);

        user.emailNotifications = req.body.emailNotifications !== undefined ? req.body.emailNotifications : user.emailNotifications;
        user.smsReminders = req.body.smsReminders !== undefined ? req.body.smsReminders : user.smsReminders;
        user.publicProfile = req.body.publicProfile !== undefined ? req.body.publicProfile : user.publicProfile;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.json(mapUserToJSON(updatedUser, true));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Mock sending email
    console.log(`Mock: Password reset link sent to ${email}`);

    res.status(200).json({ message: 'Password reset link sent to your email' });
});

// @desc    Google login
// @route   POST /api/users/google-login
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { accessToken, isSignup } = req.body;
    
    if (!accessToken) {
        res.status(400);
        throw new Error('Google access token is required');
    }

    let payload;
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info from Google');
        }

        payload = await response.json();
    } catch (error) {
        console.error('Error verifying Google token', error);
        res.status(401);
        throw new Error('Invalid Google credential');
    }

    const { email, name, given_name, family_name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
        if (!isSignup) {
            res.status(404);
            throw new Error('Account not found. Please sign up.');
        }

        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        user = await User.create({
            name,
            firstName: given_name,
            lastName: family_name,
            email,
            password: randomPassword,
        });
    }

    const updatedUser = await updateStreak(user);
    res.json(mapUserToJSON(updatedUser, true));
});

export { registerUser, loginUser, getUserProfile, updateUserProfile, forgotPassword, googleLogin };
