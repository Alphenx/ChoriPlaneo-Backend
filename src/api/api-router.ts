import express from 'express';
import plansRouter from './plans/plans-router.js';

const router = express.Router();

router.use('/plans', plansRouter);

export default router;
