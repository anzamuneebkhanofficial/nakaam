import bcrypt from 'bcrypt';
import { auth } from '../../config/auth.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * Idempotently synchronizes the Administrator account and credentials
 * from the environment variables (ADMIN_EMAIL, ADMIN_PASSWORD_HASH, etc.)
 * directly into the database through Better Auth's internal adapter.
 */
export async function syncAdminUser() {
  if (!env.ADMIN_EMAIL) {
    logger.warn('ADMIN_EMAIL not configured in environment. Skipping admin sync.');
    return;
  }

  try {
    const authContextKey = String.fromCharCode(36) + 'context';
    const ctx = await auth[authContextKey];
    if (!ctx || !ctx.internalAdapter) {
      logger.warn('Better Auth context or internalAdapter not ready.');
      return;
    }

    const adapter = ctx.internalAdapter;
    const normalizedEmail = env.ADMIN_EMAIL.toLowerCase().trim();

    // Determine target password: plain text ADMIN_PASSWORD or ADMIN_PASSWORD_HASH
    const rawPassword = (env.ADMIN_PASSWORD || env.ADMIN_PASSWORD_HASH || '').trim();
    if (!rawPassword) {
      logger.warn('Neither ADMIN_PASSWORD nor ADMIN_PASSWORD_HASH set in environment.');
      return;
    }

    const isBcrypt =
      rawPassword.startsWith('$2a$') ||
      rawPassword.startsWith('$2b$') ||
      rawPassword.startsWith('$2y$');
    const targetHash = isBcrypt ? rawPassword : await bcrypt.hash(rawPassword, 10);

    // Lookup user by email
    const userRecord = await adapter.findUserByEmail(normalizedEmail, { includeAccounts: true });

    let userId;
    if (!userRecord || !userRecord.user) {
      logger.info(`Admin user [${normalizedEmail}] not found in database. Provisioning from ENV...`);
      const created = await adapter.createUser({
        name: env.ADMIN_NAME || 'Nakaam Admin',
        email: normalizedEmail,
        emailVerified: true,
        image: '',
        role: 'admin',
        phone: env.ADMIN_PHONE || '03001234567',
        city: 'Lahore',
        isBlocked: false,
      });

      userId = created.id;
      await adapter.linkAccount({
        userId,
        providerId: 'credential',
        accountId: userId,
        password: targetHash,
      });

      logger.info(`✅ Admin user and credential account successfully provisioned from ENV: ${normalizedEmail}`);
    } else {
      userId = userRecord.user.id;

      // Ensure user attributes are in sync with ENV
      const userUpdates = {};
      if (userRecord.user.role !== 'admin') userUpdates.role = 'admin';
      if (!userRecord.user.emailVerified) userUpdates.emailVerified = true;
      if (userRecord.user.isBlocked) userUpdates.isBlocked = false;
      if (env.ADMIN_NAME && userRecord.user.name !== env.ADMIN_NAME) userUpdates.name = env.ADMIN_NAME;
      if (env.ADMIN_PHONE && userRecord.user.phone !== env.ADMIN_PHONE) userUpdates.phone = env.ADMIN_PHONE;

      if (Object.keys(userUpdates).length > 0) {
        await adapter.updateUser(userId, userUpdates);
        logger.info(`Synchronized admin profile attributes with ENV configuration`);
      }

      // Ensure credential account exists and password hash matches ENV
      const credentialAccount = userRecord.accounts?.find(
        (acc) => acc.providerId === 'credential' && (acc.accountId === userId || acc.userId === userId)
      );

      if (!credentialAccount) {
        await adapter.linkAccount({
          userId,
          providerId: 'credential',
          accountId: userId,
          password: targetHash,
        });
        logger.info(`✅ Linked credential account for admin user with ENV password hash`);
      } else if (credentialAccount.password !== targetHash) {
        // Password hash in .env changed, update to match
        await adapter.updatePassword(userId, targetHash);
        logger.info(`✅ Updated admin credential password hash in database to match ENV`);
      }
    }
  } catch (err) {
    logger.error('Error synchronizing admin credentials from ENV:', {
      error: err.message,
      stack: err.stack,
    });
  }
}
