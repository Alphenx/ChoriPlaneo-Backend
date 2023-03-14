import { Joi } from 'express-validation';

const authValidation = {
  body: Joi.object({
    name: Joi.string().min(3).max(20),
    email: Joi.string().email().required(),
    password: Joi.string()
      .regex(/[a-zA-Z0-9]{3,30}/)
      .required(),
  }),
};

export default authValidation;
