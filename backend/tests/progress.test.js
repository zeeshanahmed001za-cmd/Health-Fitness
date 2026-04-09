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
    // Re-register before each test since afterEach wipes the DB,
    // causing protect middleware to fail (user no longer in DB)
    const res = await request(app)
        .post('/api/users')
        .send({ name: 'Progress User', email: 'progress@test.com', password: 'password123' });
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

describe('Progress API Integration Tests', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/progress');
        expect(res.statusCode).toEqual(401);
    });

    it('should add a progress entry', async () => {
        const res = await request(app)
            .post('/api/progress')
            .set('Authorization', `Bearer ${token}`)
            .send({
                weight: 75,
                bodyFatPercentage: 18,
                measurements: { chest: 95, arms: 35, waist: 80, legs: 55 },
                notes: 'Feeling great!'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.weight).toBe(75);
        expect(res.body.bodyFatPercentage).toBe(18);
        expect(res.body.notes).toBe('Feeling great!');
    });

    it('should get progress history for a user', async () => {
        await request(app)
            .post('/api/progress')
            .set('Authorization', `Bearer ${token}`)
            .send({ weight: 75, bodyFatPercentage: 18 });

        await request(app)
            .post('/api/progress')
            .set('Authorization', `Bearer ${token}`)
            .send({ weight: 74, bodyFatPercentage: 17.5 });

        const res = await request(app)
            .get('/api/progress')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    it('should return an empty array when no progress entries exist', async () => {
        const res = await request(app)
            .get('/api/progress')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });

    it('should require weight when adding a progress entry', async () => {
        const res = await request(app)
            .post('/api/progress')
            .set('Authorization', `Bearer ${token}`)
            .send({ bodyFatPercentage: 18 }); // no weight

        expect(res.statusCode).toEqual(500);
    });
});
