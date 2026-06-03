import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, RegisterRequest, LoginRequest, LoginResponse } from '../models';
import { userRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private jwtSecret: string;
  private jwtExpiry: string;
  private jwtRefreshExpiry: string;
  private bcryptRounds: number = 10;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiry = process.env.JWT_EXPIRY || '1h';
    this.jwtRefreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    if (!process.env.JWT_SECRET) {
      logger.warn('JWT_SECRET not set, using default insecure value');
    }
  }

  async register(req: RegisterRequest): Promise<LoginResponse> {
    // Validate input
    if (!req.username || !req.email || !req.password) {
      throw new Error('Missing required fields: username, email, password');
    }

    if (req.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUserByEmail = await userRepository.findByEmail(req.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await userRepository.findByUsername(req.username);
    if (existingUserByUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(req.password, this.bcryptRounds);

    // Create user
    const user = await userRepository.create(req.username, req.email, passwordHash);

    // Generate tokens
    const tokens = this.generateTokens(user);

    logger.info(`User registered: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      expiresIn: this.parseExpiry(this.jwtExpiry),
    };
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    // Validate input
    if (!req.email || !req.password) {
      throw new Error('Missing required fields: email, password');
    }

    // Find user
    const user = await userRepository.findByEmail(req.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(req.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    logger.info(`User logged in: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      expiresIn: this.parseExpiry(this.jwtExpiry),
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as TokenPayload;

      // Get user from database to ensure still active
      const user = await userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token
      const newAccessToken = (jwt.sign as any)(
        {
          userId: user.id,
          email: user.email,
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiry },
      );

      logger.info(`Token refreshed for user: ${user.email}`);

      return {
        accessToken: newAccessToken,
        expiresIn: this.parseExpiry(this.jwtExpiry),
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  validateToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      logger.debug('Token validation failed:', error);
      return null;
    }
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = (jwt.sign as any)(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
    });

    const refreshToken = (jwt.sign as any)(payload, this.jwtSecret, {
      expiresIn: this.jwtRefreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  private parseExpiry(expiry: string): number {
    // Parse expiry string like "1h", "7d", "30m" into seconds
    const match = expiry.match(/^(\d+)([dhms])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        return 3600;
    }
  }
}

export const authService = new AuthService();
