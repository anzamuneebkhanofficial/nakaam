import mongoose from 'mongoose';
import { Cart } from './cart.model.js';
import { Product } from '../products/product.model.js';
import { Sale } from '../pricing/sale.model.js';
import { resolvePrice } from '../pricing/pricing.service.js';
import { ApiError } from '../../core/apiError.js';

/**
 * Decorates cart items with live product pricing, image, and available stock
 * @param {Array} items
 * @returns {Promise<{ items: Array, subtotal: number, totalQuantity: number }>}
 */
export async function resolveCartDetails(items = []) {
  if (!items || items.length === 0) {
    return { items: [], subtotal: 0, totalQuantity: 0 };
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const now = new Date();
  const activeSales = await Sale.find({
    isEnabled: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).lean();

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, status: { $in: ['active', 'published'] } })
    .select('name slug images price compareAtPrice sale variants fabric audience category subCategory')
    .lean();

  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  let totalQuantity = 0;
  const decoratedItems = [];

  for (const item of items) {
    const product = productMap.get(String(item.productId));
    if (!product) continue; // Product inactive or deleted

    let variant = product.variants?.find((v) => v.sku === item.variantSku);
    if (!variant && item.variantSku) {
      const upperSku = String(item.variantSku).trim().toUpperCase();
      variant = product.variants?.find((v) => v.sku?.toUpperCase() === upperSku);
    }
    if (!variant && item.size) {
      const targetSize = String(item.size).trim().toUpperCase();
      variant = product.variants?.find((v) => v.size && String(v.size).trim().toUpperCase() === targetSize);
    }
    if (!variant && item.variantSku) {
      const lowerSku = String(item.variantSku).trim().toLowerCase();
      variant = product.variants?.find((v) => {
        if (!v.size) return false;
        const s = String(v.size).trim().toLowerCase();
        return lowerSku.endsWith(`-${s}`) || lowerSku.endsWith(`_${s}`);
      });
    }
    if (!variant && product.variants?.length === 1) {
      variant = product.variants[0];
    }
    if (!variant && product.variants?.length > 0) {
      variant = product.variants[0];
    }

    const availableStock = variant
      ? Math.max(0, (variant.stock || 0) - (variant.reservedStock || 0))
      : 0;

    const pricing = resolvePrice(product, variant, now, activeSales);
    const unitPrice = pricing.finalPrice;
    const originalPrice = pricing.compareAtPrice || pricing.basePrice;
    const quantity = Math.min(item.quantity, 10);
    const lineTotal = unitPrice * quantity;

    subtotal += lineTotal;
    totalQuantity += quantity;

    const primaryImage =
      product.images?.find((img) => img.order === 0)?.url ||
      product.images?.[0]?.url ||
      '';

    decoratedItems.push({
      _id: item._id,
      productId: product._id,
      slug: product.slug,
      name: product.name,
      variantSku: item.variantSku,
      image: primaryImage,
      size: item.size || variant?.size || 'Standard',
      color: item.color || variant?.color || null,
      unitPrice,
      originalPrice,
      quantity,
      lineTotal,
      availableStock,
      priceChanged: item.priceAtAdd ? item.priceAtAdd !== unitPrice : false,
      previousPrice: item.priceAtAdd,
    });
  }

  return {
    items: decoratedItems,
    subtotal,
    totalQuantity,
  };
}

/**
 * Gets a user's cart with live prices
 * @param {string} userId
 */
export async function getCart(userId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  let cart = await Cart.findOne({ userId }).lean();
  if (!cart) {
    return { items: [], subtotal: 0, totalQuantity: 0 };
  }

  return resolveCartDetails(cart.items);
}

/**
 * Adds an item to a user's cart
 */
export async function addToCart(userId, { productId, variantSku, quantity = 1, size, color }) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');
  if (!productId || !variantSku) throw ApiError.badRequest('Product ID and variant SKU are required');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const product = await Product.findOne({ _id: productId, status: { $in: ['active', 'published'] } }).lean();
  if (!product) throw ApiError.notFound('Product not found or inactive');

  let variant = product.variants?.find((v) => v.sku === variantSku);
  if (!variant && variantSku) {
    const upperSku = String(variantSku).trim().toUpperCase();
    variant = product.variants?.find((v) => v.sku?.toUpperCase() === upperSku);
  }
  if (!variant && size) {
    const targetSize = String(size).trim().toUpperCase();
    variant = product.variants?.find((v) => v.size && String(v.size).trim().toUpperCase() === targetSize);
  }
  if (!variant && variantSku) {
    const lowerSku = String(variantSku).trim().toLowerCase();
    variant = product.variants?.find((v) => {
      if (!v.size) return false;
      const s = String(v.size).trim().toLowerCase();
      return lowerSku.endsWith(`-${s}`) || lowerSku.endsWith(`_${s}`);
    });
  }
  if (!variant && product.variants?.length === 1) {
    variant = product.variants[0];
  }
  if (!variant && product.variants?.length > 0) {
    variant = product.variants[0];
  }
  if (!variant) throw ApiError.notFound('Variant not found');

  const resolvedSku = variant.sku;
  const availableStock = Math.max(0, (variant.stock || 0) - (variant.reservedStock || 0));
  if (availableStock <= 0) {
    throw ApiError.badRequest('Selected size is out of stock');
  }

  const pricing = resolvePrice(product, variant);

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.variantSku === resolvedSku || item.variantSku === variantSku
  );
  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty > availableStock) {
      throw ApiError.badRequest(`Cannot add more than available stock (${availableStock})`);
    }
    if (newQty > 10) {
      throw ApiError.badRequest('Maximum 10 items per product line');
    }
    cart.items[existingIndex].quantity = newQty;
  } else {
    if (cart.items.length >= 50) {
      throw ApiError.badRequest('Cart item limit of 50 reached');
    }
    cart.items.push({
      productId,
      variantSku: resolvedSku,
      quantity: Math.min(quantity, Math.min(10, availableStock)),
      size: variant.size || size || 'Standard',
      color: variant.color || color || null,
      priceAtAdd: pricing.finalPrice,
    });
  }

  await cart.save();
  return resolveCartDetails(cart.items);
}

/**
 * Updates item quantity in cart
 */
export async function updateCartItem(userId, { variantSku, quantity }) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) throw ApiError.notFound('Cart not found');

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.variantSku !== variantSku);
  } else {
    const item = cart.items.find((i) => i.variantSku === variantSku);
    if (!item) throw ApiError.notFound('Item not in cart');
    item.quantity = Math.min(10, quantity);
  }

  await cart.save();
  return resolveCartDetails(cart.items);
}

/**
 * Removes an item from the cart
 */
export async function removeFromCart(userId, variantSku) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) return { items: [], subtotal: 0, totalQuantity: 0 };

  cart.items = cart.items.filter((i) => i.variantSku !== variantSku);
  await cart.save();
  return resolveCartDetails(cart.items);
}

/**
 * Clears the user's cart
 */
export async function clearCart(userId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  await Cart.findOneAndUpdate({ userId }, { items: [] });
}

/**
 * Merges guest items into authenticated cart
 */
export async function mergeGuestCart(userId, guestItems = []) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');
  if (!Array.isArray(guestItems)) throw ApiError.badRequest('Cart items must be an array');
  if (guestItems.length === 0) return getCart(userId);
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  for (const gItem of guestItems) {
    if (!gItem.productId || !gItem.variantSku) continue;
    const existing = cart.items.find((i) => i.variantSku === gItem.variantSku);
    if (existing) {
      existing.quantity = Math.min(10, existing.quantity + (gItem.quantity || 1));
    } else if (cart.items.length < 50) {
      cart.items.push({
        productId: gItem.productId,
        variantSku: gItem.variantSku,
        quantity: Math.min(10, gItem.quantity || 1),
        size: gItem.size,
        color: gItem.color,
        priceAtAdd: gItem.priceAtAdd || gItem.unitPrice,
      });
    }
  }

  await cart.save();
  return resolveCartDetails(cart.items);
}
