import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authMiddleware } from './auth-middleware';
import express from 'express';
dotenv.config();

describe('Given an authMiddleware', () => {
  const app = express();

  app.get('/protected', authMiddleware, (req, res) => {
    res.json({ msg: 'User id' });
  });

  test('When JWT token is not provided, then it should respond with an 401 error', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
  });

  test('When JWT token is invalid, then it should respond with an 403 error', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(403);
  });

  test('When a valid JWT token is provided, then it should set res.locals.email', async () => {
    // Generate a JWT token
    process.env.JWT_SECRET = 'mySecretToken';
    const token = jwt.sign(
      { email: 'chori@planero.com' },
      process.env.JWT_SECRET,
    );

    // Make a request with the JWT token
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ msg: 'User id' });
  });

  test('When JWT_SECRET is not defined, then it should respond with an 403 error', async () => {
    delete process.env.JWT_SECRET;
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(403);
  });
});
