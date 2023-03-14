import { UserModel } from '../users/users-schema';
import { Request, Response } from 'express';
import { registerUserController } from './auth-controller';
import { encryptPassword } from './auth-utils';
import dotenv from 'dotenv';
dotenv.config();
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

  const newUser = {
    email: 'register@gmail.com',
    password: encryptPassword('password'),
  };

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
        msg: 'Your account has been successfully created',
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

      await registerUserController(
        request as Request,
        response as Response,
        jest.fn(),
      );

      expect(response.status).toHaveBeenCalledWith(409);
      expect(response.json).toHaveBeenCalledWith({
        msg: 'User is already registered in app',
      });
      expect(UserModel.findOne).toHaveBeenCalledWith({
        email: 'register@gmail.com',
      });
    });
  });
});
