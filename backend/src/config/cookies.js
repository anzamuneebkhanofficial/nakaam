import { env } from './env.js';

export const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'lax' : 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
  path: '/',
};
