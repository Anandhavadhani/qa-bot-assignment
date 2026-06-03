import { Response } from 'express';
import { RegisterRequest, LoginRequest } from '../models';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body as RegisterRequest;

      // Basic validation
      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username, email, and password are required',
          },
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format',
          },
        });
        return;
      }

      const result = await authService.register({ username, email, password });

      res.status(201).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';

      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      // Basic validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
        return;
      }

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  async refresh(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
          },
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';

      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Logout is handled by removing token on client side
      // Server-side: Could implement token blacklist if needed
      logger.info(`User logged out: ${req.userId}`);

      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Logout error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Logout failed',
        },
      });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: req.userId,
          email: req.email,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error('Get current user error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get current user',
        },
      });
    }
  }
}

export const authController = new AuthController();
