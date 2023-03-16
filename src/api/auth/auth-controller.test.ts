import { UserModel } from '../users/users-schema';
import { NextFunction, Request, Response } from 'express';
import { loginUserController, registerUserController } from './auth-controller';
import { encryptPassword, generateJWTToken } from './auth-utils';
import dotenv from 'dotenv';
import { CustomHTTPError } from '../../utils/custom-http-error';
dotenv.config();

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('Given an auth-controller', () => {
  const request = {
    body: {
      email: 'register@gmail.com',
      password: 'password',
    },
  } as Partial<Request>;

  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  const newUser = {
    email: 'register@gmail.com',
    password: encryptPassword('password'),
  };

  // Register tests
  describe('When a user wants to sign up with a valid email and password', () => {
    test('Then the user will be registered', async () => {
      UserModel.create = jest.fn();
      UserModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      await registerUserController(
        request as Request,
        response as Response,
        jest.fn(),
      );

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        msg: 'Your account has been successfully created!',
      });
      expect(UserModel.create).toHaveBeenCalledWith(newUser);
    });
  });

  describe('When the user already exists', () => {
    test('Then you should receive a 409 error', async () => {
      UserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          matchedCount: 1,
        }),
      });

      const expectedError = new CustomHTTPError(
        409,
        'This account is already registered.',
      );

      await registerUserController(
        request as Request,
        response as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(expectedError);
      expect(UserModel.findOne).toHaveBeenCalledWith({
        email: 'register@gmail.com',
      });
    });
  });

  // Login tests
  describe('When the user tries to login with a valid account', () => {
    test('Then his token should be generated', async () => {
      UserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          matchedCount: 1,
        }),
      });
      await loginUserController(
        request as Request,
        response as Response,
        jest.fn(),
      );
      expect(response.status).toHaveBeenCalledWith(201);
    });
  });

  describe('When the user does not exist', () => {
    test('Then you should receive a 404 error', async () => {
      UserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await loginUserController(
        request as Request,
        response as Response,
        next as NextFunction,
      );

      expect(next).toHaveBeenCalled();
    });
  });

  test('When the user exists, then it should return the access token', async () => {
    UserModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

    await loginUserController(
      request as Request,
      response as Response,
      next as NextFunction,
    );

    expect(response.json).toHaveBeenCalledWith({
      accessToken: generateJWTToken(request.body.email),
    });
    expect(response.status).toHaveBeenCalledWith(201);
  });

  // Env tests
  describe('When the json web token secret environment variable does not exist', () => {
    test('Then the response should be an error', async () => {
      delete process.env.JWT_SECRET;

      await loginUserController(request as Request, response as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('When the password encryption algorithm environment variable does not exist', () => {
    test('Then the response should be an error', async () => {
      delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;

      await loginUserController(request as Request, response as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('When the password encryption key environment variable does not exist', () => {
    test('Then the response should be an error', async () => {
      delete process.env.PASSWORD_ENCRYPTION_KEY;

      const next = jest.fn();

      await loginUserController(request as Request, response as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
