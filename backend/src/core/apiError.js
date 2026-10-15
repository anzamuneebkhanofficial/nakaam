export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null, code = 'BAD_REQUEST') {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new ApiError(401, code, message);
  }

  static forbidden(message = 'Access denied', code = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static conflict(message = 'Resource conflict', code = 'CONFLICT') {
    return new ApiError(409, code, message);
  }

  static unprocessable(message = 'Validation failed', details = [], code = 'VALIDATION_ERROR') {
    return new ApiError(422, code, message, details);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.', code = 'TOO_MANY_REQUESTS') {
    return new ApiError(429, code, message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable', code = 'SERVICE_UNAVAILABLE') {
    return new ApiError(503, code, message);
  }

  static internal(message = 'An unexpected internal error occurred', code = 'INTERNAL_ERROR') {
    return new ApiError(500, code, message);
  }
}
