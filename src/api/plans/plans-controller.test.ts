import { NextFunction, Request, Response } from 'express';
import { PlanModel } from './plans-schema.js';
import {
  createPlanController,
  getPlanByIdController,
  getPlansController,
} from './plans-controller.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { queryProjectionPlan } from './plans-types.js';
import { UserModel } from '../users/users-schema.js';

describe('Given a getPlansController function from plans-controller', () => {
  const request = {} as Request;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const foundPlans = [
    {
      creationDate: 1679390950982,
      creatorId: '1234',
      date: '10/01/2000',
      description: 'Chori description',
      place: 'Malaga',
      planImgURL: 'string',
      registeredUsers: [],
      status: true,
      title: 'My choriplan',
    },
  ];

  test('When the database response is successfull, then it should respond with a list of plans', async () => {
    PlanModel.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(foundPlans),
    }));
    await getPlansController(request, response as Response, next);
    expect(response.json).toHaveBeenCalledWith({ plans: foundPlans });
  });

  test('When the database throws an error then it should respond with status 500', async () => {
    PlanModel.find = jest.fn();
    await getPlansController(
      request,
      response as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalled();
  });
});

describe('Given a getPlanByIdController from plans-controller', () => {
  const mockedId = '123213';

  const request = {
    params: { planId: '123213' },
  } as Partial<Request<{ planId: string }>>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const plan = {
    plans: {
      title: 'My choriplan',
      description: 'Chori description',
      creatorId: '1234',
      place: 'Malaga',
      status: true,
      date: '10/01/2000',
      creationDate: Date.now(),
      planImgURL: 'string',
      registeredUsers: [],
    },
  };

  test('When the plan exists then it should respond with a plan', async () => {
    PlanModel.findById = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(plan),
    }));

    await getPlanByIdController(
      request as Request<{ planId: string }>,
      response as Response,
      next,
    );

    expect(response.json).toHaveBeenCalledWith({ plans: plan });
    expect(PlanModel.findById).toHaveBeenCalledWith(
      { _id: mockedId },
      queryProjectionPlan,
    );
  });

  test('When the plan does not exist then it should return a 404 status', async () => {
    PlanModel.findById = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    }));
    const expectedError = new CustomHTTPError(404, 'Plan not found.');
    await getPlanByIdController(
      request as Request<{ planId: string }>,
      response as Response,
      next,
    );

    expect(next).toHaveBeenCalledWith(expectedError);

    expect(PlanModel.findById).toHaveBeenCalledWith(
      { _id: mockedId },
      queryProjectionPlan,
    );
  });
});

describe('Given an createPlanController from plans-controller', () => {
  const plan = {
    title: 'My Plan',
    description: 'My plan description',
    creator: '456',
    place: 'My place',
    status: true,
    date: new Date(),
  };

  const newPlan = {
    _id: '123',
    ...plan,
  };

  const req: Partial<Request> = {
    body: plan,
  };

  const res: Partial<Response> = {
    locals: {
      id: '456',
    },
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const next = jest.fn();

  describe('When a user wants to create a plan with valid info', () => {
    test('Then the plan will be registered', async () => {
      PlanModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      PlanModel.create = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(newPlan),
      }));

      UserModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
        }),
      }));

      await createPlanController(req as Request, res as Response, next);

      expect(PlanModel.findOne).toHaveBeenCalledWith({ title: plan.title });
      expect(PlanModel.create).toHaveBeenCalledWith(plan);

      expect(UserModel.updateOne).toHaveBeenCalledWith(
        { _id: res.locals?.id },
        { $push: { createdPlans: newPlan._id } },
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Your plan has been successfully created!',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('When a user wants to create a plan with valid info but creator is not matched', () => {
    test('Then it should respond with a 404', async () => {
      PlanModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      PlanModel.create = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(newPlan),
      }));

      UserModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({
          matchedCount: 0,
        }),
      }));

      await createPlanController(req as Request, res as Response, next);

      expect(PlanModel.findOne).toHaveBeenCalledWith({ title: plan.title });
      expect(PlanModel.create).toHaveBeenCalledWith(plan);

      expect(UserModel.updateOne).toHaveBeenCalledWith(
        { _id: res.locals?.id },
        { $push: { createdPlans: newPlan._id } },
      );

      expect(next).toHaveBeenCalled();
    });
  });

  describe('When a user wants to create a plan with valid info but creator is not found', () => {
    test('Then it should respond with a 404', async () => {
      PlanModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      PlanModel.create = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(newPlan),
      }));

      UserModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValueOnce({
          matchedCount: 1,
          modifiedCount: 0,
        }),
      }));

      await createPlanController(req as Request, res as Response, next);

      expect(PlanModel.findOne).toHaveBeenCalledWith({ title: plan.title });
      expect(PlanModel.create).toHaveBeenCalledWith(plan);

      expect(UserModel.updateOne).toHaveBeenCalledWith(
        { _id: res.locals?.id },
        { $push: { createdPlans: newPlan._id } },
      );

      expect(next).toHaveBeenCalled();
    });
  });

  describe('When the user already exists', () => {
    test('Then you should receive a 409 error', async () => {
      PlanModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          matchedCount: 1,
        }),
      });

      const expectedError = new CustomHTTPError(
        409,
        'This plan is already registered.',
      );

      await createPlanController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
      expect(PlanModel.findOne).toHaveBeenCalledWith({
        title: 'My Plan',
      });
    });
  });
});
