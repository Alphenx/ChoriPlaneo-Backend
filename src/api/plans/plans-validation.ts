import { Joi } from 'express-validation';

const plansValidation = {
  body: Joi.object({
    title: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(3).max(200).required(),
    place: Joi.string().min(3).max(50).required(),
    date: Joi.date().required(),
    status: Joi.string(),
  }),
};

export default plansValidation;
