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
        .send({ name: 'Nutrition User', email: 'nutrition@test.com', password: 'password123' });
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

describe('Nutrition API Integration Tests', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/nutrition');
        expect(res.statusCode).toEqual(401);
    });

    it('should log a food entry', async () => {
        const res = await request(app)
            .post('/api/nutrition')
            .set('Authorization', `Bearer ${token}`)
            .send({
                activityType: 'food',
                name: 'Chicken Breast',
                category: 'lunch',
                calories: 350,
                protein: 45,
                carbs: 0,
                fat: 8
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.activityType).toBe('food');
        expect(res.body.name).toBe('Chicken Breast');
        expect(res.body.calories).toBe(350);
    });

    it('should log a water entry', async () => {
        const res = await request(app)
            .post('/api/nutrition')
            .set('Authorization', `Bearer ${token}`)
            .send({
                activityType: 'water',
                amount: 500
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.activityType).toBe('water');
        expect(res.body.amount).toBe(500);
    });

    it('should get all nutrition logs for a user', async () => {
        await request(app)
            .post('/api/nutrition')
            .set('Authorization', `Bearer ${token}`)
            .send({ activityType: 'food', name: 'Apple', category: 'snacks', calories: 95 });

        await request(app)
            .post('/api/nutrition')
            .set('Authorization', `Bearer ${token}`)
            .send({ activityType: 'water', amount: 250 });

        const res = await request(app)
            .get('/api/nutrition')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    it('should delete a nutrition log entry', async () => {
        const createRes = await request(app)
            .post('/api/nutrition')
            .set('Authorization', `Bearer ${token}`)
            .send({ activityType: 'food', name: 'Banana', category: 'breakfast', calories: 120 });

        const entryId = createRes.body._id;

        const deleteRes = await request(app)
            .delete(`/api/nutrition/${entryId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteRes.statusCode).toEqual(200);

        const getRes = await request(app)
            .get('/api/nutrition')
            .set('Authorization', `Bearer ${token}`);

        expect(getRes.body.length).toBe(0);
    });

    it('should require activityType when logging', async () => {
        const res = await request(app)
            .post('/api/nutrition')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mystery Food', calories: 200 }); // no activityType

        expect(res.statusCode).toEqual(500);
    });
});
