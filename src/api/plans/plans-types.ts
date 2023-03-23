import { Locals } from 'express';
import { Plan } from './plans-schema.js';

export const queryProjectionPlan = { __v: 0 };
export type PlanRequest = Omit<Plan, 'planImgURL' | 'registeredUsers'>;

export interface PlanLocals extends Locals {
  id: string;
}

export const queryProjectionCreator = {
  _id: 1,
  name: 1,
  email: 1,
  profileURL: 1,
};
