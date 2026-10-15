/**
 * Money utilities for Nakaam E-Commerce Platform
 * Rule 12: Money is ALWAYS an integer in PKR (no decimals, no floats).
 */

/**
 * Validates whether an amount is a valid non-negative integer PKR amount
 * @param {any} amount
 * @returns {boolean}
 */
export function isValidPKR(amount) {
  return typeof amount === 'number' && Number.isInteger(amount) && amount >= 0;
}

/**
 * Converts any numeric input to a sanitized integer PKR amount
 * @param {any} amount
 * @returns {number}
 */
export function toPKR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 0;
  }
  return Math.max(0, Math.round(amount));
}

/**
 * Formats integer amount in PKR
 * @param {number} amount
 * @returns {string}
 */
export function formatPKR(amount) {
  const pkr = toPKR(amount);
  return `PKR ${pkr.toLocaleString('en-PK')}`;
}
