/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt, { Secret } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginUser, SafeUser } from '../../../../core/models/User';
import { getUserByEmail } from '../user/userService';
import { AppError } from '../../../../core/middleware/errorHandler';
import { config } from '../../../../config/app';
import { db } from '../../../../core/database/postgresql';
import { logger } from '../../../../utils/logger';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

interface Tokens {
  token: string;
  refreshToken: string;
}

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const secret: Secret = config.auth.jwtSecret || 'fallback-secret';
  // Handle expiresIn separately to avoid type issues
  return jwt.sign(payload, secret);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = async (userId: string): Promise<string> => {
  try {
    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Store refresh token in database
    await db.query(
      `INSERT INTO refresh_tokens (id, user_id, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [tokenId, userId, expiresAt],
    );

    return tokenId;
  } catch (error) {
    logger.error('Failed to generate refresh token', { error, userId });
    throw new AppError('Failed to generate refresh token', 500);
  }
};

/**
 * Authenticate user and generate tokens
 */
export const login = async (
  credentials: LoginUser,
): Promise<{ user: SafeUser; token: string; refreshToken: string }> => {
  try {
    const user = await getUserByEmail(credentials.email);

    console.log('user', user);
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email: credentials.email });
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_active) {
      console.log('user.isActive', user.is_active);
      logger.warn('Login attempt for inactive account', { email: credentials.email });
      throw new AppError('Account is inactive', 403);
    }

    const isPasswordValid = await compare(credentials.password, user.password);

    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', { email: credentials.email });
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login time
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Remove sensitive information
    const { password, ...safeUser } = user;

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user.id as string,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(user.id as string);

    return {
      user: safeUser as SafeUser,
      token: accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Authentication error', { error, email: credentials.email });
    throw new AppError(`Authentication error: ${(error as Error).message}`, 500);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refreshTokenId: string): Promise<Tokens> => {
  try {
    interface TokenData {
      id: string;
      email: string;
      role: string;
    }

    // Get refresh token from database
    const tokenResult = await db.query<TokenData>(
      `SELECT rt.*, u.id, u.email, u.role 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.id = $1 AND rt.revoked = false AND rt.expires_at > NOW()`,
      [refreshTokenId],
    );

    if (tokenResult.rows.length === 0) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const tokenData = tokenResult.rows[0];
    const { id, email, role } = tokenData;

    // Generate new access token
    const tokenPayload: TokenPayload = { id, email, role };
    const accessToken = generateAccessToken(tokenPayload);

    // Generate new refresh token
    const newRefreshToken = await generateRefreshToken(id);

    // Revoke old refresh token
    await db.query('UPDATE refresh_tokens SET revoked = true, updated_at = NOW() WHERE id = $1', [
      refreshTokenId,
    ]);

    return {
      token: accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error refreshing token', { error, refreshTokenId });
    throw new AppError('Failed to refresh token', 500);
  }
};

/**
 * Revoke refresh token (logout)
 */
export const revokeRefreshToken = async (refreshTokenId: string): Promise<void> => {
  try {
    await db.query('UPDATE refresh_tokens SET revoked = true, updated_at = NOW() WHERE id = $1', [
      refreshTokenId,
    ]);
  } catch (error) {
    logger.error('Error revoking refresh token', { error, refreshTokenId });
    throw new AppError('Failed to revoke token', 500);
  }
};
