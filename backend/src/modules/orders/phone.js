const SUPPORTED_MOBILE_PREFIXES = new Map([
  ['92', { length: 10, prefix: /^3/ }],
  ['971', { length: 9, prefix: /^5/ }],
  ['966', { length: 9, prefix: /^5/ }],
  ['44', { length: 10, prefix: /^7/ }],
  ['1', { length: 10, prefix: /^[2-9]/ }],
  ['91', { length: 10, prefix: /^[6-9]/ }],
  ['61', { length: 9, prefix: /^4/ }],
  ['974', { length: 8, prefix: /^[3567]/ }],
  ['965', { length: 8, prefix: /^[4569]/ }],
]);

const CALLING_CODES = [...SUPPORTED_MOBILE_PREFIXES.keys()].sort((left, right) => right.length - left.length);

export function normalizeSupportedMobilePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const callingCode = CALLING_CODES.find((code) => digits.startsWith(code));
  if (!callingCode) return null;

  const nationalNumber = digits.slice(callingCode.length);
  const rules = SUPPORTED_MOBILE_PREFIXES.get(callingCode);
  if (nationalNumber.length !== rules.length || !rules.prefix.test(nationalNumber)) return null;
  return `+${callingCode}${nationalNumber}`;
}
