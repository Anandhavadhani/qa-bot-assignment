import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (client) return client;
  client = createClient({ url: REDIS_URL });
  client.on('error', (err) => logger.error('Redis client error:', err));
  await client.connect();
  logger.info('Connected to Redis for queueing');
  return client;
}

export interface ParseJob {
  documentId: string;
  path: string;
  fileType?: string;
  attempts?: number;
}

export async function enqueueParseJob(payload: ParseJob): Promise<void> {
  const c = await getRedisClient();
  const job: ParseJob = { ...payload, attempts: payload.attempts || 0 };
  // Use LPUSH so worker uses BRPOP
  await c.lPush('q:parse_jobs', JSON.stringify(job));
  logger.info('Enqueued parse job', { documentId: payload.documentId });
}

export async function closeRedisClient(): Promise<void> {
  if (!client) return;
  try {
    await client.disconnect();
    client = null;
  } catch (err) {
    logger.error('Error disconnecting Redis client:', err);
  }
}
