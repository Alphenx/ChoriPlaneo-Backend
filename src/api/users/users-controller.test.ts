import { NextFunction, Request, Response } from 'express';
import { User, UserModel } from './users-schema.js';
import {
  addFriendByIdController,
  getUserInfoController,
  getUserByIdController,
  getUsersController,
  savePlanByIdController,
} from './users-controller.js';
import { queryProjection } from './users-types.js';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { PlanModel } from '../plans/plans-schema.js';

describe('Given a getUsersController function from users-controller', () => {
  const request = {} as Request;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const users = [
    {
      name: 'pepito',
      email: 'pepito@gmail.com',
      password: 'pepito123456',
      profileURL: 'https://pepito-img.com',
      friends: [],
    },
  ];

  test('When the database response is successfull, then it should respond with a list of users', async () => {
    UserModel.find = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(users),
    }));
    await getUsersController(request, response as Response, next);
    expect(response.json).toHaveBeenCalledWith({ users });
  });

  test('When the database throws an error then it should respond with status 500', async () => {
    UserModel.find = jest.fn();
    await getUsersController(
      request,
      response as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalled();
  });
});

describe('Given a getUserByIdController from users-controller', () => {
  const mockedId = '123213';

  const request = {
    params: { userId: mockedId },
  } as Partial<Request<{ userId: string }, { users: User }>>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const user = {
    name: 'pepito',
    email: 'pepito@gmail.com',
    password: 'pepito123456',
    profileURL: 'https://pepito-img.com',
    friends: [],
  };

  test('When the user exists then it should respond with a user', async () => {
    UserModel.findById = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(user),
    }));

    await getUserByIdController(request as Request, response as Response, next);

    expect(response.json).toHaveBeenCalledWith({ users: user });
    expect(UserModel.findById).toHaveBeenCalledWith(
      { _id: mockedId },
      queryProjection,
    );
  });

  test('When the user does not exist then it should return a 404 status', async () => {
    UserModel.findById = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    }));
    const expectedError = new CustomHTTPError(404, 'User not found.');
    await getUserByIdController(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(expectedError);

    expect(UserModel.findById).toHaveBeenCalledWith(
      { _id: mockedId },
      queryProjection,
    );
  });
});

describe('Given a getUserByEmailController from users-controller', () => {
  const mockedId = '123213';

  const request = {} as Partial<Request>;

  const response = {
    locals: { id: mockedId },
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const user = {
    name: 'pepito',
    email: 'pepito@gmail.com',
    password: 'pepito123456',
    profileURL: 'https://pepito-img.com',
    friends: [],
  };

  test('When the user exists then it should respond with a user', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(user),
    }));

    await getUserInfoController(
      request as Request,
      response as Response,
      jest.fn(),
    );

    expect(response.json).toHaveBeenCalledWith({ users: user });
  });

  test('When the user does not exist then it should return a 404 status', async () => {
    UserModel.findOne = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    }));
    const expectedError = new CustomHTTPError(
      404,
      'Your plans have not been found.',
    );

    await getUserInfoController(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(expectedError);

    expect(UserModel.findOne).toHaveBeenCalledWith(
      { id: mockedId },
      queryProjection,
    );
  });
});

describe('Given a addFriendByIdController from user-controller', () => {
  const mockRequest = {
    params: {
      friendId: 'id2',
    },
  } as Request<{ id: string; friendId: string }>;

  const mockResponse = {
    locals: { id: 'id1' },
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  test('When the user is found and the friend is added, then it should respond with a 204 status', async () => {
    UserModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      }),
    });

    await addFriendByIdController(mockRequest, mockResponse as Response, next);

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: mockResponse.locals?.id },
      { $push: { friends: mockRequest.params.friendId } },
    );
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'New friend has been added!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('When the user is not found, then it should respond with a 404 status', async () => {
    UserModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 0,
      }),
    });

    const expectedError = new CustomHTTPError(404, 'User not found.');

    await addFriendByIdController(mockRequest, mockResponse as Response, next);

    expect(next).toHaveBeenCalledWith(expectedError);

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: mockResponse.locals?.id },
      { $push: { friends: mockRequest.params.friendId } },
    );
  });

  test('When there is an error during the update, then it should respond with a 500 status', async () => {
    UserModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 0,
      }),
    });

    await addFriendByIdController(
      mockRequest,
      mockResponse as Response,
      jest.fn(),
    );

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: mockResponse.locals?.id },
      { $push: { friends: mockRequest.params.friendId } },
    );
    expect(next).toHaveBeenCalled();
  });
});

describe('Given a savePlanByIdController from user-controller', () => {
  const mockRequest = {
    params: {
      planId: 'id2',
    },
  } as Request<{ id: string; planId: string }>;

  const mockResponse = {
    locals: { id: 'id1' },
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  test('When the user is found and the plan is added, then it should respond with a 204 status', async () => {
    UserModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      }),
    });

    PlanModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      }),
    });

    await savePlanByIdController(mockRequest, mockResponse as Response, next);

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: mockResponse.locals?.id },
      { $push: { savedPlans: mockRequest.params.planId } },
    );
    expect(PlanModel.updateOne).toHaveBeenCalledWith(
      { _id: mockRequest.params.planId },
      { $push: { registeredUsers: mockResponse.locals?.id } },
    );
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'Plan successfully saved!',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('When the user is not found, then it should respond with a 404 status', async () => {
    UserModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 0,
      }),
    });

    const expectedError = new CustomHTTPError(404, 'Plan not found.');

    await savePlanByIdController(mockRequest, mockResponse as Response, next);

    expect(next).toHaveBeenCalledWith(expectedError);

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: mockResponse.locals?.id },
      { $push: { savedPlans: mockRequest.params.planId } },
    );
  });

  test('When the user is found but the plan is not registered, then it should respond with a 404 status', async () => {
    UserModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      }),
    });

    PlanModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 0,
      }),
    });
    const expectedError = new CustomHTTPError(
      404,
      'User not registered at Plan.',
    );

    await savePlanByIdController(mockRequest, mockResponse as Response, next);

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: mockResponse.locals?.id },
      { $push: { savedPlans: mockRequest.params.planId } },
    );
    expect(PlanModel.updateOne).toHaveBeenCalledWith(
      { _id: mockRequest.params.planId },
      { $push: { registeredUsers: mockResponse.locals?.id } },
    );

    expect(next).toHaveBeenCalledWith(expectedError);
  });

  test('When there is an error during the update, then it should respond with a 500 status', async () => {
    UserModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 0,
      }),
    });

    await savePlanByIdController(
      mockRequest,
      mockResponse as Response,
      jest.fn(),
    );

    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: mockResponse.locals?.id },
      { $push: { savedPlans: mockRequest.params.planId } },
    );
    expect(next).toHaveBeenCalled();
  });
});
