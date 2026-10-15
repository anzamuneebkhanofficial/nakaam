/**
 * Date and timezone utilities for Nakaam E-Commerce Platform
 * Store timezone is strictly 'Asia/Karachi'
 */

export const STORE_TIMEZONE = 'Asia/Karachi';

/**
 * Checks if current date falls within a start and end range
 * @param {Date|string} startsAt
 * @param {Date|string} endsAt
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isWithinDateRange(startsAt, endsAt, now = new Date()) {
  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  if (startsAt) {
    const startTime = new Date(startsAt).getTime();
    if (currentTime < startTime) return false;
  }
  if (endsAt) {
    const endTime = new Date(endsAt).getTime();
    if (currentTime > endTime) return false;
  }
  return true;
}
