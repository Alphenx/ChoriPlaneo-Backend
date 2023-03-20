import mongoose, { Schema } from 'mongoose';
import { User } from '../users/users-schema.js';

export interface Plan {
  creatorId: string;
  title: string;
  description: string;
  place: string;
  status: boolean;
  date: Date;
  planImgURL: string;
  registeredUsers: User[];
}

const planSchema = new Schema<Plan>({
  creatorId: String,
  title: String,
  description: String,
  place: String,
  status: Boolean,
  date: Date,
  planImgURL: String,
  registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export const PlanModel = mongoose.model<Plan>('Plan', planSchema, 'plans');
