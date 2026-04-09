import express from 'express';
import {
    addProgressEntry,
    getProgressHistory
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addProgressEntry)
    .get(protect, getProgressHistory);

export default router;
