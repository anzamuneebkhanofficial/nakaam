export const CACHE_CONFIG = {
  max: 50000,
  ttl: 1000 * 60 * 5, // 5 minutes default
  updateAgeOnGet: true,
  allowStale: false,
};

export const TTL = {
  STOCK: 15_000,          // 15 seconds
  PRICE: 45_000,          // 45 seconds
  PRODUCT: 180_000,       // 3 minutes
  CATEGORY: 720_000,      // 12 minutes
  SETTINGS: 2_700_000,    // 45 minutes
  SEARCH: 180_000,        // 3 minutes
  BANNER: 1_200_000,      // 20 minutes
  NOTIFICATIONS: 5_000,   // 5 seconds
};
