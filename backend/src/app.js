import express from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173', // Vite default development port
    'http://localhost:3000', // Create React App default development port
    process.env.FRONTEND_URL // Production frontend URL (set this in your hosting environment)
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, postman, or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
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
