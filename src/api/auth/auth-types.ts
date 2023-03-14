import { User } from '../users/users-schema.js';

export type AuthRequest = Pick<User, 'email' | 'password'>;
