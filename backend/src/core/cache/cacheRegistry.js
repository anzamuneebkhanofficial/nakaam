import { logger } from '../../utils/logger.js';

class CacheRegistry {
  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      invalidations: 0,
    };
    this.intervalId = null;
  }

  recordHit() {
    this.stats.hits++;
  }

  recordMiss() {
    this.stats.misses++;
  }

  recordSet() {
    this.stats.sets++;
  }

  recordEviction() {
    this.stats.evictions++;
  }

  recordInvalidation(count = 1) {
    this.stats.invalidations += count;
  }

  getStats(size = 0) {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? ((this.stats.hits / totalRequests) * 100).toFixed(2) + '%' : '0%';
    return {
      cachedItemsCount: size,
      servedFromMemory: this.stats.hits,
      fetchedFromDatabase: this.stats.misses,
      savedToMemory: this.stats.sets,
      cacheEfficiency: hitRate,
    };
  }

  startPeriodicLog(getCacheSizeFn, intervalMs = 60000) {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      const size = typeof getCacheSizeFn === 'function' ? getCacheSizeFn() : 0;
      logger.debug('Memory Cache Status', this.getStats(size));
    }, intervalMs);
    if (this.intervalId.unref) {
      this.intervalId.unref(); // Don't hold node process open
    }
  }

  stopPeriodicLog() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const cacheRegistry = new CacheRegistry();
