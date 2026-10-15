import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Global Mongoose 9 configuration
// Note: Global sanitizeFilter treats internal query operators ($in, $or) as literal string values on typed schema paths
// Input sanitization is handled explicitly per request via validation schemas
mongoose.set('sanitizeFilter', false);

let connectPromise;
let connectionRetryPromise;
let stopConnectionRetries = false;

mongoose.connection.on('connected', () => {
  logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB runtime connection error:', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export function connectDB() {
  if (isDatabaseReady()) {
    return Promise.resolve(mongoose.connection);
  }

  if (connectPromise) {
    return connectPromise;
  }

  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  connectPromise = mongoose
    .connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => mongoose.connection)
    .finally(() => {
      connectPromise = undefined;
    });

  return connectPromise;
}

export function connectDBWithRetry() {
  if (connectionRetryPromise) {
    return connectionRetryPromise;
  }

  stopConnectionRetries = false;
  connectionRetryPromise = (async () => {
    let retryDelayMs = 1000;

    while (!stopConnectionRetries && !isDatabaseReady()) {
      try {
        await connectDB();
        return true;
      } catch (error) {
        if (stopConnectionRetries) {
          return false;
        }

        logger.warn(`MongoDB unavailable; retrying in ${retryDelayMs}ms`, {
          error: error.message,
        });
        await new Promise((resolve) => {
          const retryTimer = setTimeout(resolve, retryDelayMs);
          retryTimer.unref();
        });
        retryDelayMs = Math.min(retryDelayMs * 2, 30000);
      }
    }

    return isDatabaseReady();
  })().finally(() => {
    connectionRetryPromise = undefined;
  });

  return connectionRetryPromise;
}

export function stopDBConnectionRetries() {
  stopConnectionRetries = true;
}

export async function disconnectDB() {
  stopDBConnectionRetries();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly');
  }
}
