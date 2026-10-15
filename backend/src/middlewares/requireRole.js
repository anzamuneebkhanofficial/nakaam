import { env } from '../config/env.js';
import { ApiError } from '../core/apiError.js';

export function requireRole(roleOrRoles) {
  const allowed = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowed.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access restricted to ${allowed.join(', ')} role`));
    }

    next();
  };
}
