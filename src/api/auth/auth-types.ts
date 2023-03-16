import { User } from '../users/users-schema.js';

export type RegisterRequest = Pick<User, 'email' | 'password' | 'name'>;
export type LoginRequest = Pick<User, 'email' | 'password'>;

export interface LoginResponse {
  accessToken: string;
}
