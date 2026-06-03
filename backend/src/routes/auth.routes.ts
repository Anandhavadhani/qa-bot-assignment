import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { username: string, email: string, password: string }
 * Response: { accessToken, refreshToken, user, expiresIn }
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * POST /api/auth/login
 * Login an existing user
 * Body: { email: string, password: string }
 * Response: { accessToken, refreshToken, user, expiresIn }
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * POST /api/auth/refresh
 * Refresh the access token
 * Body: { refreshToken: string }
 * Response: { accessToken, expiresIn }
 */
router.post('/refresh', (req, res) => authController.refresh(req, res));

/**
 * POST /api/auth/logout
 * Logout the current user (requires auth)
 * Response: { message: string }
 */
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

/**
 * GET /api/auth/me
 * Get current authenticated user info (requires auth)
 * Response: { id, email }
 */
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

export default router;
