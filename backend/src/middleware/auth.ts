import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserProfile } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: UserProfile;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    
    try {
      const decoded = jwt.verify(token, secret) as { userId: string; email: string };
      // Attach user info to request - in a real app, you'd fetch from database
      req.user = { id: decoded.userId, email: decoded.email } as UserProfile;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
    return;
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
      
      try {
        const decoded = jwt.verify(token, secret) as { userId: string; email: string };
        req.user = { id: decoded.userId, email: decoded.email } as UserProfile;
      } catch (error) {
        // Token invalid, but continue without auth
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

