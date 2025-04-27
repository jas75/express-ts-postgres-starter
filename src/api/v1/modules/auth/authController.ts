import { Request, Response } from 'express';
import { LoginUser, RegisterUser } from '../../../../core/models/User';
import { login, refreshToken, revokeRefreshToken } from '../../services/authService';
import { createUser } from '../../services/userService';
import { ResponseHandler } from '../../../../utils/responseHandler';
import { asyncHandler } from '../../../../core/middleware/asyncHandler';
import { HttpStatusCode } from '../../../../core/types';
import { logger } from '../../../../utils/logger';

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const credentials = req.body as LoginUser;
  const { user, token, refreshToken: refresh } = await login(credentials);

  return ResponseHandler.success(res, { user, token, refreshToken: refresh }, 'Login successful');
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    logger.info('Starting user registration process', { email: req.body.email });

    const userData = req.body as RegisterUser;

    const newUser = await createUser(userData);

    // Remove password from response using type-safe omit
    const userResponse = Object.fromEntries(
      Object.entries(newUser).filter(([key]) => key !== 'password'),
    );

    return ResponseHandler.created(res, { user: userResponse }, 'User registered successfully');
  } catch (error) {
    logger.error('Registration failed', {
      email: req.body.email,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error; // Re-throw to let asyncHandler and error middleware handle it
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
export const refreshAuthToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshTokenString } = req.body;

  if (!refreshTokenString) {
    return ResponseHandler.error(res, 'Refresh token is required', HttpStatusCode.BAD_REQUEST);
  }

  const tokens = await refreshToken(refreshTokenString);
  return ResponseHandler.success(res, tokens, 'Token refreshed successfully');
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  return ResponseHandler.success(res, null, 'Logout successful');
});
