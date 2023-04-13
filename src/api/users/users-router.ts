import express from 'express';
import {
  addFriendByIdController,
  getUserInfoController,
  getUserByIdController,
  getUsersController,
  savePlanByIdController,
  deleteSavedPlanByIdController,
} from './users-controller.js';

const router = express.Router();

router.route('/').get(getUsersController);
router.route('/info').get(getUserInfoController);
router.route('/:userId').get(getUserByIdController);
router.route('/friends/:friendId').patch(addFriendByIdController);
router.route('/save-plan/:planId').patch(savePlanByIdController);
router.route('/delete-plan/:planId').patch(deleteSavedPlanByIdController);

export default router;
