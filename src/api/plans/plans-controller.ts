import { RequestHandler } from 'express';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { UserModel } from '../users/users-schema.js';
import { queryProjectionPopulated } from '../users/users-types.js';

import { Plan, PlanModel } from './plans-schema.js';
import {
  PlanRequest,
  queryProjectionCreator,
  queryProjectionPlan,
} from './plans-types.js';

export const getPlansController: RequestHandler<
  unknown,
  { plans: Plan[] }
> = async (_req, res, next) => {
  try {
    const foundPlans = await PlanModel.find({}, queryProjectionPlan)
      .populate('creator', queryProjectionCreator)
      .exec();
    res.json({ plans: foundPlans });
  } catch (error) {
    next(error);
  }
};

export const getPlanByIdController: RequestHandler<
  { planId: string },
  { plans: Plan }
> = async (req, res, next) => {
  const { planId } = req.params;
  try {
    const plan = await PlanModel.findById({ _id: planId }, queryProjectionPlan)
      .populate('creator', queryProjectionCreator)
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

export const createPlanController: RequestHandler<
  unknown,
  unknown,
  PlanRequest
> = async (req, res, next) => {
  const { id } = res.locals;
  const { picture } = res.locals;
  try {
    const { title, description, place, status, date } = req.body;

    const existingDbPlan = await PlanModel.findOne({ title }).exec();
    if (existingDbPlan !== null) {
      throw new CustomHTTPError(409, 'This plan is already registered.');
    }

    const plan = {
      title,
      description,
      planImgURL: picture,
      creator: id,
      place,
      status,
      date,
    };
    const newPlan = await (await PlanModel.create(plan)).populate('creator');
    const updateUserWithPlan = await UserModel.updateOne(
      { _id: id },
      { $push: { createdPlans: newPlan._id } },
    ).exec();

    if (updateUserWithPlan.matchedCount === 0) {
      throw new CustomHTTPError(404, 'Creator not found.');
    }

    if (updateUserWithPlan.modifiedCount !== 1) {
      throw new CustomHTTPError(404, 'Creator not updated.');
    }

    res.status(201).json({ msg: 'Your plan has been successfully created!' });
  } catch (error) {
    next(error);
  }
};
