import { LRUCache } from 'lru-cache';
import { CACHE_CONFIG, TTL } from './config.js';
import { tagManager } from './tagManager.js';
import { cacheRegistry } from './cacheRegistry.js';
import { logger } from '../../utils/logger.js';

// Apply ±10% jitter to TTL to prevent simultaneous cache stampede
function applyJitter(ttlMs) {
  if (!ttlMs || typeof ttlMs !== 'number') return ttlMs;
  const jitterFactor = 0.9 + Math.random() * 0.2; // 0.90 to 1.10
  return Math.round(ttlMs * jitterFactor);
}

const lru = new LRUCache({
  ...CACHE_CONFIG,
  dispose: (value, key, reason) => {
    tagManager.removeKey(key);
    if (reason === 'evict') {
      cacheRegistry.recordEviction();
      logger.debug(`Cache key evicted: ${key}`);
    }
  },
});

if (process.env.CACHE_DEBUG === 'true') {
  cacheRegistry.startPeriodicLog(() => lru.size);
}

// Map for single-flight deduplication of concurrent misses on the same key
const inFlight = new Map();

export function get(key) {
  if (lru.has(key)) {
    cacheRegistry.recordHit();
    return lru.get(key);
  }
  cacheRegistry.recordMiss();
  return undefined;
}

export function set(key, value, options = {}) {
  const ttl = applyJitter(options.ttl || CACHE_CONFIG.ttl);
  lru.set(key, value, { ttl });
  cacheRegistry.recordSet();

  if (options.tags && Array.isArray(options.tags)) {
    tagManager.addKeyWithTags(key, options.tags);
  }
  return value;
}

export function del(key) {
  tagManager.removeKey(key);
  return lru.delete(key);
}

export function invalidateTag(tag) {
  const keys = tagManager.clearTag(tag);
  for (const key of keys) {
    lru.delete(key);
  }
  if (keys.length > 0) {
    cacheRegistry.recordInvalidation(keys.length);
    logger.debug(`Cache invalidated tag: [${tag}] (${keys.length} keys purged)`);
  }
  return keys.length;
}

export async function getOrLoad(key, loaderFn, options = {}) {
  const cached = get(key);
  if (cached !== undefined) {
    return cached;
  }

  // Single-flight deduplication: reuse active in-flight Promise for identical key
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const loadPromise = (async () => {
    try {
      const data = await loaderFn();
      if (data !== undefined && data !== null) {
        set(key, data, options);
      }
      return data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, loadPromise);
  return loadPromise;
}

export function clear() {
  lru.clear();
}

export function size() {
  return lru.size;
}

export { TTL };
