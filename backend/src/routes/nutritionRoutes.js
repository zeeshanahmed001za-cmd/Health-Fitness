import express from 'express';
import { addNutritionLog, getNutritionLogs, deleteNutritionLog } from '../controllers/nutritionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addNutritionLog)
    .get(protect, getNutritionLogs);

router.route('/:id')
    .delete(protect, deleteNutritionLog);

export default router;
