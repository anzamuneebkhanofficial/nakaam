const isProduction = process.env.NODE_ENV === 'production';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'admin_password_hash',
  'token',
  'secret',
  'authorization',
  'cookie',
  'cnic',
  'cnicencrypted',
]);

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '***REDACTED***';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitize(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const safeMeta = sanitize(meta);
  const requestId = meta?.requestId || meta?.id || undefined;

  if (isProduction) {
    const logObject = {
      time: timestamp,
      level,
      message,
      ...(requestId ? { requestId } : {}),
      ...(Object.keys(safeMeta).length > 0 ? { meta: safeMeta } : {}),
    };
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      JSON.stringify(logObject)
    );
  } else {
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${requestId ? ` [${requestId}]` : ''}:`;
    if (level === 'error') {
      console.error(prefix, message, safeMeta && Object.keys(safeMeta).length ? safeMeta : '');
    } else if (level === 'warn') {
      console.warn(prefix, message, safeMeta && Object.keys(safeMeta).length ? safeMeta : '');
    } else {
      console.log(prefix, message, safeMeta && Object.keys(safeMeta).length ? safeMeta : '');
    }
  }
}

export const logger = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => {
    if (!isProduction) log('debug', msg, meta);
  },
};
