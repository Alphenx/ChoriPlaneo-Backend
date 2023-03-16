import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import connectDB from '../../database/connection.js';

import app from '../../app.js';
import log from '../../logger.js';
import { RegisterRequest } from './auth-types.js';

describe('Given an app with auth-router', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUrl = mongoServer.getUri();
    await connectDB(mongoUrl);
  });

  afterAll(async () => {
    await mongoServer.stop();
    await mongoose.connection.close();
  });

  test('When a user type valid name, email and password, then it should be registered', async () => {
    const user: RegisterRequest = {
      name: 'Pepe',
      email: 'user@email.com',
      password: 'pasuperSecurePsword',
    };

    await request(app).post('/auth/register').send(user).expect(201);
    log.info(user);
  });

  test('When a user type invalid name, then it should not be able to register', async () => {
    const invalidEmailUser: RegisterRequest = {
      name: 'Pe',
      email: 'userPepe@email.com',
      password: 'superSecurePassword',
    };
    await request(app)
      .post('/auth/register')
      .send(invalidEmailUser)
      .expect(400);
  });

  test('When a user type invalid email, then it should not be able to register', async () => {
    const invalidEmailUser: RegisterRequest = {
      name: 'Pepe',
      email: 'usermail.com',
      password: 'superSecurePassword',
    };
    await request(app)
      .post('/auth/register')
      .send(invalidEmailUser)
      .expect(400);
  });

  test('When the email is already in use, then it should not be able to register', async () => {
    const alreadyUsedEmailUser: RegisterRequest = {
      name: 'Pepe',
      email: 'user@email.com',
      password: 'superSecurePassword',
    };
    await request(app)
      .post('/auth/register')
      .send(alreadyUsedEmailUser)
      .expect(409);
  });

  test('When the password encryption algorithm environment variable is not defined, then the response should be an error', async () => {
    delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;
    const user: RegisterRequest = {
      name: 'Pepe',
      email: 'userPepito@email.com',
      password: 'superSecurePassword',
    };
    await request(app).post('/auth/register').send(user).expect(500);
  });
});
