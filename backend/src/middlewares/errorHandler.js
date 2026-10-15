import { ApiError } from '../core/apiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected internal server error occurred';
  let details = null;

  // 1. ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // 2. Yup ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.inner && err.inner.length
      ? err.inner.map((item) => ({ field: item.path, message: item.message }))
      : [{ field: err.path || 'value', message: err.message }];
  }
  // 3. Mongoose CastError (bad ObjectId or invalid query type)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = err.kind === 'ObjectId' ? 'INVALID_ID' : 'INVALID_PARAM';
    message = `Invalid format for field: ${err.path}`;
    details = null;
  }
  // 4. MongoDB Duplicate Key (11000)
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE';
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }
  // 5. Malformed JSON Body
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Malformed JSON payload received';
  }
  // 6. Payload too large
  else if (err.type === 'entity.too.large') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request payload exceeds permitted size limit';
  }
  // 7. Multer upload errors
  else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      code = 'PAYLOAD_TOO_LARGE';
      message = 'Image file exceeds maximum allowed size (5 MB)';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      statusCode = 400;
      code = 'TOO_MANY_FILES';
      message = 'Too many files uploaded in a single request';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      statusCode = 400;
      code = 'UNEXPECTED_FILE';
      message = `Unexpected upload field: ${err.field}`;
    } else {
      statusCode = 400;
      code = 'UPLOAD_ERROR';
      message = err.message;
    }
  }

  // Log error based on severity
  if (statusCode >= 500) {
    logger.error(`[5xx Error] ${req.method} ${req.originalUrl}: ${err.message}`, {
      requestId: req.id,
      stack: err.stack,
    });
  } else {
    logger.warn(`[4xx Warning] ${req.method} ${req.originalUrl}: ${message}`, {
      requestId: req.id,
      code,
      details,
    });
  }

  const responseBody = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId: req.id,
      ...(!env.isProd && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  };

  return res.status(statusCode).json(responseBody);
}
