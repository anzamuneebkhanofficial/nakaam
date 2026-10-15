import mongoose from 'mongoose';
import { Product } from '../products/product.model.js';
import { Category } from '../categories/category.model.js';
import { Sale } from '../pricing/sale.model.js';
import { resolvePrice } from '../pricing/pricing.service.js';
import { getOrLoad } from '../../core/cache/index.js';
import { TTL } from '../../core/cache/config.js';

// Roman-Urdu synonym mapping for honest Pakistani search intent
const SYNONYMS = {
  kurti: 'kurta',
  kurtis: 'kurta',
  kamiz: 'kameez',
  qameez: 'kameez',
  chadar: 'bedsheet',
  chaadar: 'bedsheet',
  chaddar: 'bedsheet',
  chader: 'bedsheet',
  jooti: 'khussa',
  jutti: 'khussa',
  jootian: 'khussa',
  bachon: 'kids',
  bachay: 'kids',
  bacha: 'kids',
  wasket: 'waistcoat',
  waskat: 'waistcoat',
  kapray: 'pret',
  mardana: 'men',
  mardon: 'men',
  mard: 'men',
  zanana: 'women',
  aurat: 'women',
  khawateen: 'women',
  shalwar: 'shalwar kameez',
  salwar: 'shalwar kameez',
};

/**
 * Expands a query with common Pakistani Roman-Urdu synonyms
 * @param {string} text
 * @returns {string}
 */
export function expandSynonyms(text) {
  if (!text || typeof text !== 'string') return '';
  const tokens = text.toLowerCase().trim().split(/\s+/);
  const expanded = tokens.map((token) => SYNONYMS[token] || token);
  return expanded.join(' ');
}

/**
 * Provides search suggestions (products and categories) for autocomplete
 * @param {string} rawQuery
 * @returns {Promise<{ products: Array, categories: Array }>}
 */
export async function getSuggestions(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
    return { products: [], categories: [] };
  }

  const query = expandSynonyms(rawQuery);
  const cacheKey = `search:suggest:${query.toLowerCase().trim()}`;

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        return {
          query,
          originalQuery: rawQuery,
          products: [],
          categories: [],
        };
      }

      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const [matchedProducts, matchedCategories] = await Promise.all([
        Product.find({
          status: { $in: ['active', 'published'] },
          $or: [
            { name: regex },
            { tags: regex },
            { searchKeywords: regex },
            { fabric: regex },
          ],
        })
          .limit(8)
          .select('name slug price compareAtPrice images fabric audience')
          .lean(),
        Category.find({
          isActive: true,
          $or: [{ name: regex }, { slug: regex }],
        })
          .limit(4)
          .select('name slug audience')
          .lean(),
      ]);

      const now = new Date();
      const activeSales = await Sale.find({
        isEnabled: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      }).lean();

      const decoratedProducts = matchedProducts.map((p) => ({
        ...p,
        pricing: resolvePrice(p, null, now, activeSales),
      }));

      return {
        query,
        originalQuery: rawQuery,
        products: decoratedProducts,
        categories: matchedCategories,
      };
    },
    {
      ttl: TTL.SEARCH || 180000, // 3 minutes
      tags: ['search'],
    }
  );
}
