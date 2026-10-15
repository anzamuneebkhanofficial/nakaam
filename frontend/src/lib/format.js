/**
 * Formats integer amount in PKR currency
 * Money is always an integer in PKR (no floats/decimals)
 * @param {number} amount
 * @returns {string}
 */
export function formatPKR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'PKR 0';
  }
  const formattedNumber = Math.round(amount).toLocaleString('en-PK');
  return `PKR ${formattedNumber}`;
}

/**
 * Formats ISO date string to readable format
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats Pakistani mobile phone number (+92 3XX XXXXXXX)
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('923') && cleaned.length === 12) {
    return `+92 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    return `+92 ${cleaned.slice(1, 4)} ${cleaned.slice(4)}`;
  }
  return phone;
}
