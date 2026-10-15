import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth.js';
import { env } from './config/env.js';
import { isDatabaseReady } from './config/db.js';
import { corsMiddleware } from './config/cors.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { originGuard } from './middlewares/originGuard.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiRateLimiter } from './middlewares/rateLimiters.js';
import { respond } from './core/respond.js';

// Feature Modules
import { authRouter } from './modules/auth/index.js';
import { categoryRouter } from './modules/categories/index.js';
import { productRouter } from './modules/products/index.js';
import { searchRouter } from './modules/search/index.js';
import { bannerRouter } from './modules/banners/index.js';
import { settingsRouter } from './modules/settings/index.js';
import { deliveryRouter } from './modules/delivery/index.js';
import { paymentRouter } from './modules/payments/index.js';
import { cartRoutes } from './modules/cart/cart.routes.js';
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { couponRoutes } from './modules/coupons/coupon.routes.js';
import { accountRoutes } from './modules/users/account.routes.js';
import { wishlistRoutes } from './modules/wishlist/wishlist.routes.js';
import { complaintRoutes } from './modules/complaints/complaint.routes.js';
import { adminRoutes } from './modules/admin/index.js';

export function createApp() {
  const app = express();

  // Basic security and request parsing pipeline
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(compression());
  app.use(hpp());
  app.use(requestIdMiddleware);

  // Rate limiting for API paths
  app.use('/api', apiRateLimiter);

  // Liveness and database readiness check
  app.get('/api/health', (req, res) => {
    const databaseReady = isDatabaseReady();
    const data = {
      service: 'nakaam-backend',
      time: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      env: env.NODE_ENV,
      database: databaseReady ? 'connected' : 'disconnected',
    };

    return res.status(databaseReady ? 200 : 503).json({
      success: databaseReady,
      data,
      ...(databaseReady
        ? {}
        : {
            error: {
              code: 'DATABASE_UNAVAILABLE',
              message: 'Database connection is temporarily unavailable',
            },
          }),
    });
  });

  // Prevent database-backed routes from returning misleading empty or missing results.
  app.use('/api', (req, res, next) => {
    if (!isDatabaseReady()) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database connection is temporarily unavailable',
        },
      });
    }

    return next();
  });

  // Better Auth router mounted BEFORE express.json()
  app.all('/api/auth/*splat', toNodeHandler(auth));

  // Body parsing (max 1mb) for custom application routes
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Origin guard for non-GET mutations
  app.use('/api', originGuard);

  // Identity & Account Routes
  app.use('/api', authRouter);

  // Public Catalog & Search Routes
  app.use('/api/categories', categoryRouter);
  app.use('/api/products', productRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/banners', bannerRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/delivery', deliveryRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/checkout', ordersRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/me', accountRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 Handler for undefined routes
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
