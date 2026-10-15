import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = new Set(env.corsOrigins);

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin) || env.isDev) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy violation: Origin ${origin} not permitted`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-Id',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400, // 24 hours preflight cache
};

export const corsMiddleware = cors(corsOptions);
