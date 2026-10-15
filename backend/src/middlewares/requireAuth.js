import mongoose from 'mongoose';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';
import { env } from '../config/env.js';
import { ApiError } from '../core/apiError.js';

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (session.user.isBlocked) {
      throw ApiError.forbidden('Your account has been suspended. Please contact support.');
    }

    if (env.SMTP_USER && !session.user.emailVerified) {
      throw ApiError.forbidden('Please verify your email address to proceed.', [
        { field: 'emailVerified', message: 'Email not verified' },
      ]);
    }

    // Attach user to request with normalized id, _id, and ObjectId
    const normalizedId = session.user.id
      ? session.user.id.toString()
      : session.user._id
      ? session.user._id.toString()
      : null;
    const validOid =
      normalizedId && mongoose.Types.ObjectId.isValid(normalizedId)
        ? new mongoose.Types.ObjectId(normalizedId)
        : null;

    req.user = {
      ...session.user,
      id: normalizedId,
      _id: validOid || normalizedId,
      oid: validOid,
    };
    req.session = session.session;

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session && session.user && !session.user.isBlocked) {
      const normalizedId = session.user.id
        ? session.user.id.toString()
        : session.user._id
        ? session.user._id.toString()
        : null;
      const validOid =
        normalizedId && mongoose.Types.ObjectId.isValid(normalizedId)
          ? new mongoose.Types.ObjectId(normalizedId)
          : null;

      req.user = {
        ...session.user,
        id: normalizedId,
        _id: validOid || normalizedId,
        oid: validOid,
      };
      req.session = session.session;
    }
    next();
  } catch {
    next();
  }
}

