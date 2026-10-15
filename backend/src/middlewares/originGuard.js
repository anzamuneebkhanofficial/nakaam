import { env } from '../config/env.js';
import { ApiError } from '../core/apiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedOrigins = new Set(env.corsOrigins);

export function originGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Exempt Better Auth internal routes from originGuard (handled by trustedOrigins)
  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  // In local development or testing, permit localhost
  if (env.isDev || env.isTest) {
    return next();
  }

  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);

  if (!origin || !allowedOrigins.has(origin)) {
    return next(new ApiError(403, 'FORBIDDEN_ORIGIN', 'Cross-origin mutation rejected'));
  }

  next();
}
