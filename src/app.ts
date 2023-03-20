import express from 'express';
import cors from 'cors';
import { errorHandler } from './utils/error-handler.js';
import authRouter from './api/auth/auth-router.js';
import apiRouter from './api/api-router.js';

const app = express();

app.get('/', (_req, res) => {
  res.json('Hello world');
});

app.use(cors());
app.use(express.json());

app.disable('x-powered-by');

app.use('/auth', authRouter);
app.use('/api/v1', apiRouter);

app.use(errorHandler);

export default app;
