import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import User from '../src/models/User.js';
import Nutrition from '../src/models/Nutrition.js';
import Workout from '../src/models/Workout.js';
import Progress from '../src/models/Progress.js';

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create a test user for auth
    const userRes = await request(app)
        .post('/api/users')
        .send({
            name: 'Quick Log User',
            email: 'quicklog@example.com',
            password: 'password123'
        });
    
    userToken = userRes.body.token;
    userId = userRes.body._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Keep user but clear other collections
    await Nutrition.deleteMany();
    await Workout.deleteMany();
    await Progress.deleteMany();
});

describe('Quick Log API Integration', () => {
    it('should return 400 if no text is provided', async () => {
        const res = await request(app)
            .post('/api/nutrition/quick-log')
            .set('Authorization', `Bearer ${userToken}`)
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'No text provided');
    });

    it('should ask for refinement if no rule matched', async () => {
        const res = await request(app)
            .post('/api/nutrition/quick-log')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ text: 'xyz123' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('needsRefinement', true);
        expect(res.body).toHaveProperty('name', 'xyz123');
    });

    it('should ask for refinement if food has no clear calories', async () => {
        // e.g., if a food match returned with 0 calories
        // we can trigger food rule by forcing a low calorie match or just using a mock
        // wait, parseWithRules currently only returns food if calories are explicit.
        // If we want to simulate 0 calories, we could send "0 calories apple"
        const res = await request(app)
            .post('/api/nutrition/quick-log')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ text: '0 calories apple' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('needsRefinement', true);
        expect(res.body).toHaveProperty('activityType', 'food');
    });

    it('should log a food item successfully', async () => {
        const res = await request(app)
            .post('/api/nutrition/quick-log')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ text: 'ate 500 calories of pizza' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toMatch(/Logged.*pizza/i);
        expect(res.body.data).toHaveProperty('calories', 500);
        
        // Verify in DB
        const nutrition = await Nutrition.find({ user: userId });
        expect(nutrition).toHaveLength(1);
        expect(nutrition[0].calories).toEqual(500);
    });

    it('should log water successfully', async () => {
        const res = await request(app)
            .post('/api/nutrition/quick-log')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ text: 'drank 2 glasses of water' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toMatch(/Logged 500ml of water!/);
        
        // Verify in DB
        const nutrition = await Nutrition.find({ user: userId });
        expect(nutrition).toHaveLength(1);
        expect(nutrition[0].activityType).toEqual('water');
        expect(nutrition[0].amount).toEqual(500);
    });

    it('should log a workout successfully', async () => {
        const res = await request(app)
            .post('/api/nutrition/quick-log')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ text: 'ran for 30 minutes' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toMatch(/Logged 30 mins of ran!/);
        
        // Verify in DB
        const workouts = await Workout.find({ user: userId });
        expect(workouts).toHaveLength(1);
        expect(workouts[0].type).toEqual('Cardio');
        expect(workouts[0].duration).toEqual(30);
    });

    it('should log weight successfully', async () => {
        const res = await request(app)
            .post('/api/nutrition/quick-log')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ text: 'weighed 70.5 kg' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toMatch(/Logged weight: 70.5 kg/);
        
        const weights = await Progress.find({ user: userId });
        expect(weights).toHaveLength(1);
        expect(weights[0].weight).toEqual(70.5);
    });
});
