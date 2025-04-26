import { hash, compare } from 'bcrypt';
import { db } from '../../../core/database/postgresql';
import { User, RegisterUser, UpdateUser, ChangePassword } from '../../../core/models/User';
import { AppError } from '../../../core/middleware/errorHandler';
import { config } from '../../../config/app';
import { logger } from '../../../utils/logger';

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const result = await db.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error fetching user by ID', { error, userId: id });
    throw new AppError(`Error fetching user: ${(error as Error).message}`, 500);
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await db.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error fetching user by email', { error, email });
    throw new AppError(`Error fetching user: ${(error as Error).message}`, 500);
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData: RegisterUser): Promise<User> => {
  logger.info('Starting createUser service', { email: userData.email });

  return db.transaction(async (client) => {
    try {
      // Check if user already exists
      logger.debug('Checking if user already exists');
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [
        userData.email,
      ]);

      if (existingUser.rows.length > 0) {
        logger.warn('User with this email already exists', { email: userData.email });
        throw new AppError('User with this email already exists', 409);
      }

      // Hash password
      logger.debug('Hashing password');
      const hashedPassword = await hash(userData.password, config.auth.saltRounds);

      // Insert new user
      logger.debug('Inserting new user into database');
      const result = await client.query(
        `INSERT INTO users (
          email, password, first_name, last_name, role, 
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'user', true, NOW(), NOW()) 
        RETURNING *`,
        [userData.email, hashedPassword, userData.firstName, userData.lastName],
      );

      logger.info('User created successfully', {
        userId: result.rows[0].id,
        email: userData.email,
      });
      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error creating user', {
        error: (error as Error).message,
        email: userData.email,
        stack: (error as Error).stack,
      });
      throw new AppError(`Error creating user: ${(error as Error).message}`, 500);
    }
  });
};

/**
 * Update user profile
 */
export const updateUser = async (userId: string, userData: UpdateUser): Promise<User> => {
  try {
    // Check if user exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Check if email is already taken (if updating email)
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await getUserByEmail(userData.email);
      if (emailExists) {
        throw new AppError('Email is already in use', 409);
      }
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (userData.firstName) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(userData.firstName);
      paramIndex++;
    }

    if (userData.lastName) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(userData.lastName);
      paramIndex++;
    }

    if (userData.email) {
      updates.push(`email = $${paramIndex}`);
      values.push(userData.email);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    // Add the user ID as the last parameter
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const result = await db.query<User>(query, values);
    return result.rows[0];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating user', { error, userId });
    throw new AppError(`Error updating user: ${(error as Error).message}`, 500);
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (
  userId: string,
  passwordData: ChangePassword,
): Promise<void> => {
  try {
    // Get the user
    const user = await getUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await compare(passwordData.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await hash(passwordData.newPassword, config.auth.saltRounds);

    // Update password
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [
      hashedPassword,
      userId,
    ]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error changing password', { error, userId });
    throw new AppError(`Error changing password: ${(error as Error).message}`, 500);
  }
};
