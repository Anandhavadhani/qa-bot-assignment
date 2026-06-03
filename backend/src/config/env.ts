import { logger } from '../utils/logger';

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  LOG_LEVEL: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRY: number;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY?: string;
  GROQ_API_KEY?: string;
  CORS_ORIGIN: string;
  MAX_FILE_SIZE_MB: number;
  CHUNK_SIZE: number;
  CHUNK_OVERLAP: number;
}

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'CORS_ORIGIN',
];

export function validateEnv(): EnvConfig {
  // Check required variables
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const config: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    DATABASE_URL: process.env.DATABASE_URL || '',
    REDIS_URL: process.env.REDIS_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRY: parseInt(process.env.JWT_EXPIRY || '3600', 10),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '',
    MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
    CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE || '500', 10),
    CHUNK_OVERLAP: parseInt(process.env.CHUNK_OVERLAP || '150', 10),
  };

  logger.info('Environment configuration loaded', {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    LOG_LEVEL: config.LOG_LEVEL,
  });

  return config;
}

export const envConfig = validateEnv();
