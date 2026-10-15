import mongoose from 'mongoose';
import { Banner } from './banner.model.js';
import { getOrLoad } from '../../core/cache/index.js';
import { TTL } from '../../core/cache/config.js';

export async function getActiveBanners(placement = null) {
  const cacheKey = `banners:${placement || 'all'}`;

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        return [];
      }

      const now = new Date();
      const query = {
        isActive: true,
        $and: [
          { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
          { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
        ],
      };

      if (placement) {
        query.placement = placement;
      }

      return Banner.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
    },
    {
      ttl: TTL.BANNER,
      tags: ['banners'],
    }
  );
}
