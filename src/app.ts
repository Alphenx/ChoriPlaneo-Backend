import express from 'express';
import apiRouter from './api/api-router.js';
import cors from 'cors';

const app = express();

app.get('/', (_req, res) => {
  res.json('Hello world');
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use(cors());
app.use(express.json());
app.use('/api/v1', apiRouter);

export default app;
