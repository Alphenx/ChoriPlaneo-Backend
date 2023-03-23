import mongoose, { Schema } from 'mongoose';
import { User } from '../users/users-schema.js';

export interface Plan {
  creator: User;
  title: string;
  description: string;
  place: string;
  status: string | undefined;
  date: Date;
  planImgURL: string;
  registeredUsers: User[];
}

const planSchema = new Schema<Plan>({
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  place: String,
  status: String,
  date: Date,
  planImgURL: String,
  registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export const PlanModel = mongoose.model<Plan>('Plan', planSchema, 'plans');
