import { Plan } from './plans-schema.js';

export const queryProjectionPlan = { __v: 0 };
export type PlanRequest = Omit<Plan, 'planImgURL' | 'registeredUsers'>;
