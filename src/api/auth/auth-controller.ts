import { RequestHandler } from 'express';
import { UserModel } from '../users/users-schema.js';
import { AuthRequest } from './auth-types.js';
import { encryptPassword } from './auth-utils.js';

export const registerUserController: RequestHandler<
  unknown,
  unknown,
  AuthRequest
> = async (req, res) => {
  const { email, password } = req.body;

  const existingDbUser = await UserModel.findOne({ email }).exec();

  if (existingDbUser !== null) {
    return res.status(409).json({ msg: 'User is already registered in app' });
  }

  const user = {
    email,
    password: encryptPassword(password),
  };
  await UserModel.create(user);

  res.status(201).json({ msg: 'Your account has been successfully created' });
};
