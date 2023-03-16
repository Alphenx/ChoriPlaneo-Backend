import { RequestHandler } from 'express';
import { CustomHTTPError } from '../../utils/custom-http-error.js';
import { UserModel } from '../users/users-schema.js';
import { RegisterRequest, LoginResponse, LoginRequest } from './auth-types.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';

export const registerUserController: RequestHandler<
  unknown,
  unknown,
  RegisterRequest
> = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingDbUser = await UserModel.findOne({ email }).exec();

    if (existingDbUser !== null) {
      throw new CustomHTTPError(409, 'This account is already registered.');
    }

    const user = {
      name,
      email,
      password: encryptPassword(password),
    };
    await UserModel.create(user);

    res
      .status(201)
      .json({ msg: 'Your account has been successfully created!' });
  } catch (error) {
    next(error);
  }
};

export const loginUserController: RequestHandler<
  unknown,
  LoginResponse | { msg: string },
  LoginRequest
> = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user: LoginRequest = {
      email,
      password: encryptPassword(password),
    };

    const existingUser = await UserModel.findOne(user).exec();

    if (existingUser === null) {
      throw new CustomHTTPError(
        404,
        'Your password is invalid or this account does not exist.',
      );
    }

    const userToken = generateJWTToken(email);
    return res.status(201).json({ accessToken: userToken });
  } catch (error) {
    next(error);
  }
};
