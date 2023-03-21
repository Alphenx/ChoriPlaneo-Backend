import { Locals, RequestHandler } from 'express';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { queryProjectionPopulated } from '../users/users-types.js';

import { Plan, PlanModel } from './plans-schema.js';
import { queryProjectionPlan } from './plans-types.js';

export const getPlansController: RequestHandler<
  unknown,
  { plans: Plan[] }
> = async (_req, res, next) => {
  try {
    const foundPlans = await PlanModel.find({}, queryProjectionPlan).exec();
    res.json({ plans: foundPlans });
  } catch (error) {
    next(error);
  }
};

export interface PlanLocals extends Locals {
  id: string;
}

export const getPlanByIdController: RequestHandler<
  { planId: string },
  { plans: Plan }
> = async (req, res, next) => {
  const { planId } = req.params;
  try {
    const plan = await PlanModel.findById({ _id: planId }, queryProjectionPlan)
      .populate('registeredUsers', queryProjectionPopulated)
      .exec();

    if (plan === null) {
      throw new CustomHTTPError(404, 'Plan not found.');
    }

    return res.json({ plans: plan });
  } catch (error) {
    next(error);
  }
};
