import express from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/nutrition', nutritionRoutes);

app.get('/', (req, res) => {
    res.send('Health & Fitness API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
