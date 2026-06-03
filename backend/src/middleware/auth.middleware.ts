import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
  id?: string;
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authorization header',
        },
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization header format. Expected "Bearer {token}"',
        },
      });
      return;
    }

    const token = parts[1];
    const decoded = authService.validateToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.email = decoded.email;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    logger.debug(`User authenticated: ${decoded.userId}`);
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication error',
      },
    });
  }
};

export const optionalAuthMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const decoded = authService.validateToken(token);

        if (decoded) {
          req.userId = decoded.userId;
          req.email = decoded.email;
          req.user = {
            id: decoded.userId,
            email: decoded.email,
          };
        }
      }
    }

    next();
  } catch (error) {
    logger.debug('Optional auth middleware error:', error);
    next();
  }
};
