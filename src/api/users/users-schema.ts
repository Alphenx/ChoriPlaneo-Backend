import mongoose, { Schema } from 'mongoose';
import { Plan } from '../plans/plans-schema';

export interface User {
  name: string;
  email: string;
  password: string;
  profileURL: string;
  friends: User[];
  recommendedPlans: Plan[];
  createdPlans: Plan[];
}

const userSchema = new Schema<User>({
  name: String,
  email: String,
  password: String,
  profileURL: String,
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  recommendedPlans: [{ type: Schema.Types.ObjectId, ref: 'Plan' }],
  createdPlans: [{ type: Schema.Types.ObjectId, ref: 'Plan' }],
});

export const UserModel = mongoose.model<User>('User', userSchema, 'users');
