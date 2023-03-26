import express from 'express';
import plansRouter from './plans/plans-router.js';
import usersRouter from './users/users-router.js';

const router = express.Router();

router.use('/plans', plansRouter);
router.use('/users', usersRouter);
export default router;
