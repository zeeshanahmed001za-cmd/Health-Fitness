import express from 'express';
import {
    createWorkout,
    getWorkouts,
    deleteWorkout
} from '../controllers/workoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createWorkout)
    .get(protect, getWorkouts);

router.route('/:id')
    .delete(protect, deleteWorkout);

export default router;
