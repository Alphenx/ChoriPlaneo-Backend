import express from 'express';
import { validate } from 'express-validation';
import { registerUserController } from './auth-controller.js';
import authValidation from './auth-validation.js';

const router = express.Router();
router.use(validate(authValidation));

router.route('/register').post(registerUserController);

export default router;
