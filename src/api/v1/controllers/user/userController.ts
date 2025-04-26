import { Response } from 'express';
import { getUserById, updateUser, changeUserPassword } from '../../services/userService';
import { ResponseHandler } from '../../../../utils/responseHandler';
import { asyncHandler } from '../../../../core/middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../../core/types';
import { UpdateUser, ChangePassword } from '../../../../core/models/User';

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
export const getUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const user = await getUserById(userId);

  if (!user) {
    return ResponseHandler.notFound(res, 'User not found');
  }

  // Remove sensitive information
  const { password, ...userResponse } = user;

  return ResponseHandler.success(
    res,
    { user: userResponse },
    'User profile retrieved successfully',
  );
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input data
 */
export const updateUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const userData = req.body as UpdateUser;

  const updatedUser = await updateUser(userId, userData);

  // Remove sensitive information
  const { password, ...userResponse } = updatedUser;

  return ResponseHandler.success(res, { user: userResponse }, 'User profile updated successfully');
});

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 *       400:
 *         description: Invalid input data
 */
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const passwordData = req.body as ChangePassword;

  await changeUserPassword(userId, passwordData);

  return ResponseHandler.success(res, null, 'Password changed successfully');
});
