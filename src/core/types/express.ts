import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    password: string;
    firstName: string;
    lastName: string;
    is_active: boolean;
    lastLogin?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
