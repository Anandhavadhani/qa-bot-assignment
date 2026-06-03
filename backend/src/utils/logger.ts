import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';

let loggerInstance;
if (process.env.NODE_ENV === 'test') {
  // Use a minimal logger in tests to avoid transport child processes
  loggerInstance = pino({ level: 'silent' });
} else {
  const pinoTransport =
    process.env.NODE_ENV === 'production'
      ? pino.transport({
          targets: [
            {
              target: 'pino/file',
              options: { destination: './logs/app.log' },
            },
            {
              target: 'pino',
              level: 'error',
              options: { destination: './logs/error.log' },
            },
          ],
        })
      : pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        });

  loggerInstance = pino(
    {
      level,
      base: {
        service: 'qa-bot-backend',
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pinoTransport
  );
}

export const logger = loggerInstance;

// Extend logger with convenience methods
logger.debug = logger.debug.bind(logger);
logger.info = logger.info.bind(logger);
logger.warn = logger.warn.bind(logger);
logger.error = logger.error.bind(logger);
