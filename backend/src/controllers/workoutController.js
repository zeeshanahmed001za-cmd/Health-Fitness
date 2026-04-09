import asyncHandler from 'express-async-handler';
import Workout from '../models/Workout.js';

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = asyncHandler(async (req, res) => {
    const { type, duration, caloriesBurned, exercises, notes } = req.body;

    const workout = new Workout({
        user: req.user._id,
        type,
        duration,
        caloriesBurned,
        exercises,
        notes
    });

    const createdWorkout = await workout.save();
    res.status(201).json(createdWorkout);
});

// @desc    Get user workouts
// @route   GET /api/workouts
// @access  Private
const getWorkouts = asyncHandler(async (req, res) => {
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 });
    res.json(workouts);
});

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res) => {
    const workout = await Workout.findById(req.params.id);

    if (workout) {
        // Confirm user owns this workout
        if (workout.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to delete this workout');
        }

        await workout.deleteOne();
        res.json({ message: 'Workout removed' });
    } else {
        res.status(404);
        throw new Error('Workout not found');
    }
});

export { createWorkout, getWorkouts, deleteWorkout };
