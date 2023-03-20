import { NextFunction, Request, Response } from 'express';
import { PlanModel } from './plans-schema.js';
import {
  getPlanByIdController,
  getPlansController,
} from './plans-controller.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { queryProjectionPlan } from './plans-types.js';

describe('Given a getPlansController function from plans-controller', () => {
  const request = {} as Request;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const plans = [
    {
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
  ];

  test('When the database response is successfull, then it should respond with a list of plans', async () => {
    PlanModel.find = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(plans),
    }));
    await getPlansController(request, response as Response, next);
    expect(response.json).toHaveBeenCalledWith(plans);
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
    params: { planId: mockedId },
  } as Partial<Request>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const plan = {
    title: 'My choriplan',
    description: 'Chori description',
    creatorId: '1234',
    place: 'Malaga',
    status: true,
    date: '10/01/2000',
    creationDate: Date.now(),
    planImgURL: 'string',
    registeredUsers: [],
  };

  test('When the plan exists then it should respond with a plan', async () => {
    PlanModel.findById = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(plan),
    }));

    await getPlanByIdController(request as Request, response as Response, next);

    expect(response.json).toHaveBeenCalledWith(plan);
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
    await getPlanByIdController(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(expectedError);

    expect(PlanModel.findById).toHaveBeenCalledWith(
      { _id: mockedId },
      queryProjectionPlan,
    );
  });
});
