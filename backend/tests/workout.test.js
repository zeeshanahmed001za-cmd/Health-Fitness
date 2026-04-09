import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongoServer;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    const res = await request(app)
        .post('/api/users')
        .send({ name: 'Workout User', email: 'workout@test.com', password: 'password123' });
    token = res.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

describe('Workout API Integration Tests', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/workouts');
        expect(res.statusCode).toEqual(401);
    });

    it('should create a new workout', async () => {
        const res = await request(app)
            .post('/api/workouts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 'Strength',
                duration: 60,
                caloriesBurned: 400,
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 8, weight: 80 },
                    { name: 'Squat', sets: 4, reps: 6, weight: 100 }
                ],
                notes: 'Great upper body session'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.type).toBe('Strength');
        expect(res.body.duration).toBe(60);
        expect(res.body.exercises).toHaveLength(2);
    });

    it('should get all workouts for a user', async () => {
        await request(app)
            .post('/api/workouts')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'Cardio', duration: 30 });

        await request(app)
            .post('/api/workouts')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'Flexibility', duration: 45 });

        const res = await request(app)
            .get('/api/workouts')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    it('should delete a workout', async () => {
        const createRes = await request(app)
            .post('/api/workouts')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'Other', duration: 20 });

        const workoutId = createRes.body._id;

        const deleteRes = await request(app)
            .delete(`/api/workouts/${workoutId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteRes.statusCode).toEqual(200);

        const getRes = await request(app)
            .get('/api/workouts')
            .set('Authorization', `Bearer ${token}`);

        expect(getRes.body.length).toBe(0);
    });

    it('should reject invalid workout type', async () => {
        const res = await request(app)
            .post('/api/workouts')
            .set('Authorization', `Bearer ${token}`)
            .send({ type: 'InvalidType', duration: 30 });

        expect(res.statusCode).toEqual(500);
    });

    it('should return empty array when no workouts exist', async () => {
        const res = await request(app)
            .get('/api/workouts')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });
});
