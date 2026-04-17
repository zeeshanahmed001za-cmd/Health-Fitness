import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import User from '../src/models/User.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
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

describe('User API Integration Tests', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('name', 'Test User');
        expect(res.body).toHaveProperty('email', 'test@example.com');
        expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with an existing email', async () => {
        await User.create({
            name: 'Existing User',
            email: 'test@example.com',
            password: 'password123'
        });

        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Test User 2',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should login an existing user', async () => {
        await request(app)
            .post('/api/users')
            .send({
                name: 'Login User',
                email: 'login@example.com',
                password: 'password123'
            });

        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: 'login@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('email', 'login@example.com');
    });

    it('should get user profile for logged-in user', async () => {
        const createRes = await request(app)
            .post('/api/users')
            .send({
                name: 'Profile User',
                email: 'profile@example.com',
                password: 'password123'
            });
        
        const token = createRes.body.token;

        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Profile User');
        expect(res.body).toHaveProperty('email', 'profile@example.com');
    });

    it('should update user profile successfully', async () => {
        const createRes = await request(app)
            .post('/api/users')
            .send({
                name: 'Update User',
                email: 'update@example.com',
                password: 'password123'
            });
        
        const token = createRes.body.token;

        const res = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Updated First',
                lastName: 'Name',
                primaryGoal: 'Muscle Gain'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('firstName', 'Updated First');
        expect(res.body).toHaveProperty('lastName', 'Name');
        expect(res.body).toHaveProperty('primaryGoal', ['Muscle Gain']);
    });

    it('should handle forgot password missing user', async () => {
        const res = await request(app)
            .post('/api/users/forgot-password')
            .send({ email: 'norecord@example.com' });
            
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should handle forgot password existing user', async () => {
        await request(app)
            .post('/api/users')
            .send({
                name: 'Forgot User',
                email: 'forgot@example.com',
                password: 'password123'
            });

        const res = await request(app)
            .post('/api/users/forgot-password')
            .send({ email: 'forgot@example.com' });
            
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Password reset link sent to your email');
    });
});
