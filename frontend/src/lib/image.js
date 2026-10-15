/**
 * Safe Image Resolution & Fallback Utilities
 * Prevents invalid/empty strings from being passed to Next.js <Image> or ReactDOM.preload
 */

export const DEFAULT_PRODUCT_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23F6F2EC"><rect width="600" height="800" fill="%23F6F2EC"/><rect x="40" y="40" width="520" height="720" rx="16" fill="none" stroke="%23E6E1DA" stroke-width="2" stroke-dasharray="8 8"/><text x="50%" y="48%" text-anchor="middle" font-family="serif" font-size="28" font-weight="700" fill="%238C827A" letter-spacing="4">NAKAAM</text><text x="50%" y="53%" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="%23A39B93" letter-spacing="2">COLLECTION</text></svg>';

export const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85';

/**
 * Extracts a valid, non-empty image URL string from any image representation
 * (string, Image object with .url, array of images, or null/undefined)
 */
export function getImageUrl(imageSource) {
  if (!imageSource) return null;

  // If it's a non-empty string
  if (typeof imageSource === 'string') {
    const trimmed = imageSource.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  // If it's an object with .url property
  if (typeof imageSource === 'object' && imageSource !== null) {
    if (typeof imageSource.url === 'string' && imageSource.url.trim().length > 0) {
      return imageSource.url.trim();
    }
  }

  return null;
}

/**
 * Resolves primary product image with optional fallback
 */
export function getProductImageUrl(product, order = 0, fallback = DEFAULT_PRODUCT_FALLBACK) {
  if (!product) return fallback;

  const images = Array.isArray(product.images) ? product.images : [];
  if (images.length === 0) {
    return fallback;
  }

  // Look for target order or first available
  const matched = images.find((img) => img && img.order === order) || images[0];
  const url = getImageUrl(matched);

  return url || fallback;
}
