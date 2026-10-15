import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { env } from './env.js';
import { createMongoRateLimitStorage } from './rateLimitStorage.js';
import { sendEmail } from '../modules/email/email.service.js';
import { verifyEmailTemplate, resetPasswordTemplate } from '../modules/email/templates/index.js';

const client = (globalThis.__authMongoClient ??= new MongoClient(env.MONGODB_URI, { maxPoolSize: 5 }));
const db = client.db();

export const auth = betterAuth({
  appName: 'Nakaam',
  baseURL: env.FRONTEND_URL,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.FRONTEND_URL],
  database: mongodbAdapter(db, { client }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userCount = await db.collection('user').countDocuments();
          const isAdmin = userCount === 0 || user.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
          const hasSmtp = Boolean(env.SMTP_USER);
          const isEmailVerified = isAdmin ? true : (!hasSmtp || Boolean(user.emailVerified));
          return {
            data: {
              ...user,
              role: isAdmin ? 'admin' : (user.role || 'user'),
              emailVerified: isEmailVerified,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: Boolean(env.SMTP_USER),
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60,
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ password, hash }) => bcrypt.compare(password, hash),
    },
    sendResetPassword: async ({ user, url }) => {
      return sendEmail({
        to: user.email,
        ...resetPasswordTemplate({
          name: user.name,
          url,
          expiresInMinutes: env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
        }),
      });
    },
  },
  emailVerification: {
    expiresIn: env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS * 60 * 60,
    sendOnSignUp: Boolean(env.SMTP_USER),
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      return sendEmail({ to: user.email, ...verifyEmailTemplate({ name: user.name, url }) });
    },
  },
  user: {
    additionalFields: {
      phone: { type: 'string', required: false, input: true },
      city: { type: 'string', required: false, input: true },
      role: { type: 'string', defaultValue: 'user', input: false },
      isBlocked: { type: 'boolean', defaultValue: false, input: false },
    },
    deleteUser: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * env.SESSION_MAX_AGE_DAYS,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 },
  },
  rateLimit: {
    enabled: env.isProd,
    storage: 'database',
    window: env.RATE_LIMIT_WINDOW_MINUTES * 60,
    max: 60,
    customStorage: createMongoRateLimitStorage(db.collection('rateLimit')),
  },
  advanced: {
    useSecureCookies: env.isProd,
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
      trustedProxies: ['127.0.0.1', '::1'],
    },
  },
});
