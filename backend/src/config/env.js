import dotenv from 'dotenv';
import * as yup from 'yup';

// Load .env file
dotenv.config();

const envSchema = yup.object({
  NODE_ENV: yup
    .string()
    .oneOf(['development', 'test', 'production'])
    .default('development'),
  PORT: yup.number().default(5000),
  FRONTEND_URL: yup.string().default('http://localhost:3000'),
  CORS_ALLOWED_ORIGINS: yup.string().default('http://localhost:3000'),
  MONGODB_URI: yup.string().required('MONGODB_URI is required'),
  BETTER_AUTH_SECRET: yup
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters')
    .required('BETTER_AUTH_SECRET is required'),
  BETTER_AUTH_URL: yup.string().default('http://localhost:5000'),
  FIELD_ENCRYPTION_KEY: yup
    .string()
    .required('FIELD_ENCRYPTION_KEY is required for sensitive fields'),
  ADMIN_EMAIL: yup.string().email().required('ADMIN_EMAIL is required'),
  ADMIN_PASSWORD: yup.string().default(''),
  ADMIN_PASSWORD_HASH: yup.string().default(''),
  ADMIN_NAME: yup.string().default('Nakaam Admin'),
  ADMIN_PHONE: yup.string().default('03001234567'),
  ADMIN_ROLE: yup.string().default('admin'),
  PAGINATION_DEFAULT_LIMIT: yup.number().default(20),
  CACHE_MAX_ENTRIES: yup.number().default(50000),
  CACHE_TTL_STOCK: yup.number().default(15),
  CACHE_TTL_PRODUCT: yup.number().default(180),
  CACHE_TTL_CATEGORY: yup.number().default(720),
  CLOUDINARY_CLOUD_NAME: yup.string().default('demo'),
  CLOUDINARY_API_KEY: yup.string().default('1234567890'),
  CLOUDINARY_API_SECRET: yup.string().default('abcdefghijklmnopqrstuvwxyz'),
  CLOUDINARY_UPLOAD_PRESET: yup.string().default('nakaam_signed'),
  CLOUDINARY_ROOT_FOLDER: yup.string().default('nakaam-dev'),
  MAX_UPLOAD_FILES: yup.number().default(20),
  MAX_UPLOAD_FILE_SIZE_MB: yup.number().default(5),
  SMTP_HOST: yup.string().default('smtp.mailtrap.io'),
  SMTP_PORT: yup.number().default(2525),
  SMTP_USER: yup.string().default(''),
  SMTP_PASS: yup.string().default(''),
  MAIL_FROM: yup.string().default('Nakaam <no-reply@nakaam.com>'),
  STORE_WHATSAPP_NUMBER: yup.string().default('923001234567'),
  EMAIL_VERIFICATION_TOKEN_TTL_HOURS: yup.number().integer().min(1).default(24),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: yup.number().integer().min(1).default(60),
  SESSION_MAX_AGE_DAYS: yup.number().integer().min(1).default(14),
  RATE_LIMIT_WINDOW_MINUTES: yup.number().integer().min(1).default(15),
  ABANDONED_CART_RETENTION_DAYS: yup.number().integer().min(1).default(30),
  NOTIFICATION_RETENTION_DAYS: yup.number().integer().min(1).default(60),
  UNPAID_ORDER_EXPIRY_HOURS: yup.number().integer().min(1).default(24),
  RESOLVED_DELIVERY_REPORTS_RETENTION_DAYS: yup.number().integer().min(1).default(180),
  CLOSED_COMPLAINTS_RETENTION_DAYS: yup.number().integer().min(1).default(365),
  ACCOUNT_DELETE_ORDER_MODE: yup
    .string()
    .oneOf(['anonymize', 'cascade'])
    .default('anonymize'),
});

let validatedEnv;
try {
  validatedEnv = envSchema.validateSync(process.env, {
    abortEarly: false,
    stripUnknown: true,
  });
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Fatal: Environment variable validation failed:');
  if (error.inner && error.inner.length) {
    error.inner.forEach((err) => {
      console.error(`  - ${err.path}: ${err.message}`);
    });
  } else {
    console.error(`  - ${error.message}`);
  }
  process.exit(1);
}

export const env = {
  ...validatedEnv,
  corsOrigins: validatedEnv.CORS_ALLOWED_ORIGINS
    ? validatedEnv.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000'],
  isProd: validatedEnv.NODE_ENV === 'production',
  isDev: validatedEnv.NODE_ENV === 'development',
  isTest: validatedEnv.NODE_ENV === 'test',
};
