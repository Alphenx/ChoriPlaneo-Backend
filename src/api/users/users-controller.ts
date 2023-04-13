import { RequestHandler } from 'express';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { PlanModel } from '../plans/plans-schema.js';
import { User, UserModel } from './users-schema.js';
import { queryProjection } from './users-types.js';

export const getUsersController: RequestHandler<
  unknown,
  { users: User[] }
> = async (_req, res, next) => {
  try {
    const foundUsers = await UserModel.find({}, queryProjection).exec();
    res.json({ users: foundUsers });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById({ _id: userId }, queryProjection)
      .populate('createdPlans')
      .exec();

    if (user === null) {
      throw new CustomHTTPError(404, 'User not found.');
    }

    return res.json({ users: user });
  } catch (error) {
    next(error);
  }
};

export const getUserInfoController: RequestHandler = async (req, res, next) => {
  const { id } = res.locals;
  try {
    const user = await UserModel.findOne({ _id: id }, queryProjection)
      .populate({
        path: 'recommendedPlans',
        populate: {
          path: 'creator',
          select: 'name email',
        },
      })
      .populate({
        path: 'savedPlans',
        populate: {
          path: 'creator',
          select: 'name email',
        },
      })
      .populate('createdPlans')
      .exec();

    if (user === null) {
      throw new CustomHTTPError(404, 'Your plans have not been found.');
    }

    return res.json({ users: user });
  } catch (error) {
    next(error);
  }
};

// Patch Friend
export const addFriendByIdController: RequestHandler<{
  friendId: string;
}> = async (req, res, next) => {
  const { friendId } = req.params;
  const { id } = res.locals;

  try {
    const updatedFriend = await UserModel.updateOne(
      { _id: id },
      { $push: { friends: friendId } },
    ).exec();

    if (updatedFriend.matchedCount === 0) {
      throw new CustomHTTPError(404, 'User not found.');
    }

    if (updatedFriend.modifiedCount === 1) {
      return res.status(204).json({ msg: 'New friend has been added!' });
    }
  } catch (error) {
    next(error);
  }
};

// Patch Plan
export const savePlanByIdController: RequestHandler<{
  planId: string;
}> = async (req, res, next) => {
  const { planId } = req.params;
  const { id } = res.locals;
  try {
    const planToBeSaved = await UserModel.updateOne(
      { _id: id, savedPlans: { $ne: planId } },
      { $push: { savedPlans: planId } },
    ).exec();

    if (planToBeSaved.matchedCount === 0) {
      throw new CustomHTTPError(404, 'Plan is already saved.');
    }

    const userRegisteredInPlan = await PlanModel.updateOne(
      { _id: planId },
      { $push: { registeredUsers: id } },
    ).exec();

    if (
      userRegisteredInPlan.matchedCount === 0 ||
      userRegisteredInPlan.modifiedCount !== 1
    ) {
      throw new CustomHTTPError(404, 'User not registered in Plan.');
    }

    if (planToBeSaved.modifiedCount === 1) {
      return res.status(200).json({ msg: 'Plan successfully saved!' });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteSavedPlanByIdController: RequestHandler<{
  planId: string;
}> = async (req, res, next) => {
  const { planId } = req.params;
  const { id } = res.locals;
  try {
    const planToBeDeleteFromSaved = await UserModel.updateOne(
      { _id: id },
      { $pull: { savedPlans: planId } },
    ).exec();

    if (planToBeDeleteFromSaved.matchedCount === 0) {
      throw new CustomHTTPError(404, 'Plan not found.');
    }

    const userToBeDeletedFromRegistered = await PlanModel.updateOne(
      { _id: planId },
      { $pull: { registeredUsers: id } },
    ).exec();

    if (
      userToBeDeletedFromRegistered.matchedCount === 0 ||
      userToBeDeletedFromRegistered.modifiedCount !== 1
    ) {
      throw new CustomHTTPError(404, 'User not found.');
    }

    if (planToBeDeleteFromSaved.modifiedCount === 1) {
      return res.status(200).json({ msg: 'Plan successfully deleted!' });
    }
  } catch (error) {
    next(error);
  }
};
