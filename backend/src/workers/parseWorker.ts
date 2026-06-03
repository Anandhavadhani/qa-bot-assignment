import { getRedisClient, ParseJob } from '../utils/queue';
import { documentParserService } from '../services/documentParser.service';
import { logger } from '../utils/logger';

const MAX_ATTEMPTS = parseInt(process.env.PARSE_JOB_MAX_ATTEMPTS || '3', 10);
const CONCURRENCY = parseInt(process.env.PARSE_WORKER_CONCURRENCY || '2', 10);

async function workerLoop(id: number) {
  const client = await getRedisClient();
  logger.info(`Worker ${id} started, waiting for jobs...`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await processOneJob(id, client);
    } catch (err) {
      logger.error('Worker loop error (will retry in 5s):', err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

export async function processOneJob(id: number, client?: any) {
  const c = client || (await getRedisClient());
  const res = await c.brPop('q:parse_jobs', 0);
  if (!res) return;
  const jobJson = (res as { element: string }).element;
  const job = JSON.parse(jobJson) as ParseJob;
  const attempts = job.attempts || 0;
  logger.info(`Worker ${id} processing parse job`, { documentId: job.documentId, attempts });
  try {
    await documentParserService.parseDocument(job.documentId, job.path, job.fileType);
  } catch (err) {
    logger.error(`Worker ${id} error processing parse job:`, err);
    if (attempts + 1 < MAX_ATTEMPTS) {
      // Re-enqueue with incremented attempts
      const retryJob: ParseJob = { ...job, attempts: attempts + 1 };
      await c.lPush('q:parse_jobs', JSON.stringify(retryJob));
      logger.info(`Re-enqueued job ${job.documentId} (attempt ${attempts + 1})`);
    } else {
      logger.error(`Job ${job.documentId} reached max attempts (${MAX_ATTEMPTS}), marking failed`);
      try {
        await documentParserService.parseDocument(job.documentId, job.path, job.fileType);
      } catch (e) {
        // Last resort: mark document failed via repository (service already handles marking failed on catch)
        logger.error('Failed to parse document after max attempts:', e);
      }
    }
  }
}

async function runWorkers() {
  const workers: Promise<void>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(workerLoop(i + 1));
  }
  await Promise.all(workers);
}

if (!process.env.JEST_WORKER_ID) {
  runWorkers().catch((err) => {
    logger.error('Worker failed to start:', err);
    process.exit(1);
  });
}
