import express from 'express';
import {
  getPlanByIdController,
  getPlansController,
} from './plans-controller.js';

const router = express.Router();

router.route('/').get(getPlansController);

router.route('/:planId').get(getPlanByIdController);

export default router;
