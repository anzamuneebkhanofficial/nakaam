import mongoose from 'mongoose';
import { isWithinDateRange } from '../../utils/dates.js';
import { Sale } from './sale.model.js';

/**
 * Retrieves currently active campaigns from MongoDB.
 * Filters strictly by isEnabled and within the valid start/end datetime range.
 *
 * @param {Date} [now=new Date()]
 * @returns {Promise<Array>}
 */
export async function getActiveSales(now = new Date()) {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Sale.find({
    isEnabled: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).lean();
}

/**
 * Resolves the final selling price for a product / variant based on
 * active sales campaigns and product-specific sales.
 *
 * Rules:
 * - basePrice = variant?.priceOverride ?? product.price
 * - Candidates = product.sale (if inside dates) + matching activeSales
 * - Discount: percent: round(basePrice * value / 100), flat: value
 * - Capped at maxDiscountAmount, never drops below PKR 1
 * - Lowest resulting price wins (never stack)
 * - Returns integer PKR values only
 *
 * @param {Object} product
 * @param {Object} [variant]
 * @param {Date} [now=new Date()]
 * @param {Array} [activeSales=[]]
 * @returns {Object}
 */
export function resolvePrice(product, variant = null, now = new Date(), activeSales = []) {
  const basePrice = Math.round(variant?.priceOverride ?? product.price ?? 0);
  let bestDiscount = 0;
  let winningSale = null;

  // 1. Check Product-level Sale
  if (product.sale && product.sale.isEnabled !== false) {
    const { isEnabled, salePrice, discountType, value, campaignName, startsAt, endsAt } = product.sale;
    const active = isEnabled || (value > 0) || (salePrice && salePrice > 0);
    if (active && isWithinDateRange(startsAt, endsAt, now)) {
      let discount = 0;
      if (salePrice && salePrice > 0 && salePrice < basePrice) {
        discount = Math.round(basePrice - salePrice);
      } else if (discountType === 'percent' && value > 0) {
        discount = Math.round((basePrice * value) / 100);
      } else if (discountType === 'flat' && value > 0) {
        discount = Math.round(value);
      }

      if (discount > bestDiscount) {
        bestDiscount = discount;
        winningSale = {
          source: 'product',
          saleId: null,
          saleLabel: campaignName || 'Special Offer',
          endsAt: endsAt || null,
        };
      }
    }
  }

  // 2. Check Active Campaigns (Sales)
  if (Array.isArray(activeSales)) {
    for (const campaign of activeSales) {
      if (!campaign.isEnabled) continue;
      if (!isWithinDateRange(campaign.startsAt, campaign.endsAt, now)) continue;

      // Check Exclusions
      if (campaign.excludeProductIds?.some((id) => id.toString() === product._id?.toString())) {
        continue;
      }

      // Check Scope: 'all' | 'categories' | 'products' | 'audiences'
      let inScope = false;
      const targetAudiences = campaign.targetAudiences || campaign.audiences || [];
      const targetCategoryIds = campaign.targetCategoryIds || campaign.categoryIds || [];
      const targetProductIds = campaign.targetProductIds || campaign.productIds || [];

      if (campaign.scope === 'all') {
        inScope = true;
      } else if (campaign.scope === 'products') {
        inScope = targetProductIds.some((id) => id.toString() === product._id?.toString());
      } else if (campaign.scope === 'categories') {
        const catId = product.category?._id?.toString() || product.category?.toString();
        const subCatId = product.subCategory?._id?.toString() || product.subCategory?.toString();
        inScope = targetCategoryIds.some((id) => {
          const cId = id.toString();
          return cId === catId || cId === subCatId;
        });
      } else if (campaign.scope === 'audiences') {
        inScope = targetAudiences.includes(product.audience);
      }

      if (!inScope) continue;

      // Calculate campaign discount
      let discount = 0;
      if (campaign.discountType === 'percent') {
        discount = Math.round((basePrice * campaign.value) / 100);
      } else if (campaign.discountType === 'flat') {
        discount = Math.round(campaign.value);
      }

      if (campaign.maxDiscountAmount && discount > campaign.maxDiscountAmount) {
        discount = Math.round(campaign.maxDiscountAmount);
      }

      if (discount > bestDiscount) {
        bestDiscount = discount;
        winningSale = {
          source: 'campaign',
          saleId: campaign._id?.toString() || null,
          saleLabel: campaign.badgeText || campaign.name || 'Sale',
          endsAt: campaign.endsAt || null,
        };
      }
    }
  }

  // Final Price cannot be lower than 1 PKR
  const finalPrice = Math.max(1, basePrice - bestDiscount);
  const savings = basePrice - finalPrice;
  const discountPercent = basePrice > 0 ? Math.round((savings / basePrice) * 100) : 0;
  // If there is an active discount, compareAtPrice is the basePrice before sale
  const effectiveCompareAt = bestDiscount > 0 ? basePrice : (product.compareAtPrice ?? null);

  return {
    basePrice,
    finalPrice,
    compareAtPrice: effectiveCompareAt,
    discountPercent,
    savings,
    saleId: winningSale?.saleId ?? null,
    saleLabel: winningSale?.saleLabel ?? null,
    endsAt: winningSale?.endsAt ?? null,
    source: winningSale?.source ?? null,
  };
}
