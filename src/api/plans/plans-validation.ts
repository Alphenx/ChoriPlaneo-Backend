import { Joi } from 'express-validation';

const plansValidation = {
  body: Joi.object({
    title: Joi.string().min(3).max(50),
    description: Joi.string().min(3).max(200),
    place: Joi.string().min(3).max(50),
    date: Joi.date(),
    status: Joi.string(),
  }),
};

export default plansValidation;
