import express from 'express';
import { upload } from '../middlewares/image-upload-middleware.js';
import { supabaseMiddleware } from '../middlewares/supabase-middleware.js';
import {
  createPlanController,
  getPlanByIdController,
  getPlansController,
} from './plans-controller.js';

const router = express.Router();

router
  .route('/')
  .get(getPlansController)
  .post(upload.single('planImgURL'), supabaseMiddleware, createPlanController);

router.route('/:planId').get(getPlanByIdController);

export default router;
