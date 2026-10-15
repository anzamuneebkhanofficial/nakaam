import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDBWithRetry, disconnectDB, stopDBConnectionRetries } from './config/db.js';
import { ensureTtlIndexes } from './config/ttlIndexes.js';
import { syncAdminUser } from './modules/auth/syncAdmin.js';

process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception thrown:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('CRITICAL: Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

async function startServer() {
  try {
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Nakaam API server active on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });

    void connectDBWithRetry()
      .then(async (connected) => {
        if (connected) {
          await ensureTtlIndexes();
          await syncAdminUser();
        }
      })
      .catch((error) => {
        logger.error('Database initialization task failed:', { error: error.message });
      });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      stopDBConnectionRetries();
      server.close(async () => {
        try {
          await disconnectDB();
          logger.info('Closed out remaining connections. Exiting process.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during database disconnect:', { error: err.message });
          process.exit(1);
        }
      });

      // Force shutdown after 10s if stuck
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal server startup failure:', { error: error.message });
    process.exit(1);
  }
}

startServer();
