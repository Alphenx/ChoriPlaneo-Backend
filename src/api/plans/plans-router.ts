import express from 'express';
import { validate } from 'express-validation';
import { upload } from '../middlewares/image-upload-middleware.js';
import { supabaseMiddleware } from '../middlewares/supabase-middleware.js';
import {
  createPlanController,
  getPlanByIdController,
  getPlansController,
} from './plans-controller.js';
import plansValidation from './plans-validation.js';

const router = express.Router();

router.use(validate(plansValidation));

router
  .route('/')
  .get(getPlansController)
  .post(upload.single('planImgURL'), supabaseMiddleware, createPlanController);

router.route('/:planId').get(getPlanByIdController);

export default router;
