import mongoose from 'mongoose';
import { Order } from './order.model.js';
import { generateOrderNumber } from './counter.model.js';
import { Product } from '../products/product.model.js';
import { DeliveryOption } from '../delivery/deliveryOption.model.js';
import { StoreSettings } from '../settings/storeSettings.model.js';
import { PaymentAccount } from '../payments/paymentAccount.model.js';
import { Coupon } from '../coupons/coupon.model.js';
import { Sale } from '../pricing/sale.model.js';
import { validateCoupon } from '../coupons/coupon.service.js';
import { resolvePrice } from '../pricing/pricing.service.js';
import { clearCart } from '../cart/cart.service.js';
import { User } from '../users/user.model.js';
import { sendOrderConfirmedEmail } from '../email/email.service.js';
import { notifyUser, notifyAdmins } from '../notifications/notification.service.js';
import { handleMutation } from '../../core/cache/mutationHandler.js';
import { parsePagination, formatPaginated } from '../../core/pagination.js';
import { ApiError } from '../../core/apiError.js';
import { env } from '../../config/env.js';
import { normalizeSupportedMobilePhone } from './phone.js';

/**
 * Computes a live checkout price quote without mutating DB state
 */
export async function getCheckoutQuote({
  items = [],
  city = 'Lahore',
  deliveryOptionCode = 'standard',
  paymentMethod = 'COD',
  couponCode = null,
  userId = null,
}) {
  if (!items || items.length === 0) {
    throw ApiError.badRequest('Cart is empty. Please add items before checking out');
  }

  // 1. Resolve Items & Live Prices
  let subtotal = 0;
  let saleSavings = 0;
  const decoratedItems = [];

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const productIds = items.map((i) => i.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds }, status: { $in: ['active', 'published'] } }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const now = new Date();
  const activeSales = await Sale.find({
    isEnabled: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).lean();

    for (const item of items) {
      const product = productMap.get(String(item.productId));
      if (!product) {
        throw ApiError.badRequest(`Product in cart is no longer available`);
      }

      // Find variant defensively with multiple fallback strategies
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
        variant = product.variants.find((v) => ((v.stock || 0) - (v.reservedStock || 0)) >= (item.quantity || 1)) || product.variants[0];
      }
      if (!variant) {
        throw ApiError.badRequest(`Variant ${item.variantSku || item.size || 'unknown'} for ${product.name} not found`);
      }

      const availableStock = Math.max(0, (variant.stock || 0) - (variant.reservedStock || 0));
      if (availableStock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for ${product.name} (${variant.size}). Available: ${availableStock}`
        );
      }

      const pricing = resolvePrice(product, variant, now, activeSales);
      const unitPrice = pricing.finalPrice;
      const originalPrice = pricing.compareAtPrice || pricing.basePrice;
      const qty = item.quantity;
      const lineTotal = unitPrice * qty;

      subtotal += lineTotal;
      saleSavings += Math.max(0, originalPrice - unitPrice) * qty;

      const primaryImage =
        product.images?.find((img) => img.order === 0)?.url ||
        product.images?.[0]?.url ||
        '';

      decoratedItems.push({
        productId: product._id,
        variantSku: variant.sku,
        name: product.name,
        image: primaryImage,
        size: item.size || variant.size,
        color: item.color || variant.color || null,
        originalPrice,
        unitPrice,
        saleLabel: pricing.saleLabel || null,
        quantity: qty,
        lineTotal,
      });
    }

  // 2. Resolve Delivery Option & Fee
  let deliveryFee = 250;
  let deliveryOption = {
    code: deliveryOptionCode || 'standard',
    label: 'Standard Courier (3-4 Days)',
    etaDaysMin: 3,
    etaDaysMax: 4,
    fee: 250,
  };

  if (mongoose.connection.readyState === 1) {
    const option = await DeliveryOption.findOne({
      code: deliveryOptionCode,
      isActive: true,
    }).lean();

    if (option) {
      deliveryOption = {
        code: option.code,
        label: option.label,
        etaDaysMin: option.etaDaysMin,
        etaDaysMax: option.etaDaysMax,
        fee: option.fee,
      };
      if (option.freeAbove && subtotal >= option.freeAbove) {
        deliveryFee = 0;
      } else {
        deliveryFee = option.fee;
      }
    }
  }

  // 3. Resolve Coupon
  let couponDiscount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    try {
      const couponResult = await validateCoupon({
        code: couponCode,
        subtotal,
        userId,
      });
      couponDiscount = couponResult.discount;
      appliedCoupon = couponResult;
    } catch (err) {
      // Re-throw or ignore if optional
      throw err;
    }
  }

  // 4. Resolve Prepaid Discount (Direct Bank / Raast incentive)
  let prepaidDiscount = 0;
  if (paymentMethod === 'MANUAL') {
    // 5% standard discount on prepaid orders
    prepaidDiscount = Math.round(subtotal * 0.05);
  }

  // 5. Final Grand Total (Strict Integer PKR)
  const total = Math.max(1, subtotal + deliveryFee - couponDiscount - prepaidDiscount);

  return {
    pricing: {
      subtotal,
      saleSavings,
      deliveryFee,
      couponDiscount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      prepaidDiscount,
      total,
    },
    items: decoratedItems,
    delivery: deliveryOption,
  };
}

/**
 * Creates an order atomically with inventory deduction and idempotency
 */
export async function createOrder(payload, idempotencyKey = null, userId = null) {
  const {
    items,
    shippingAddress,
    deliveryOptionCode = 'standard',
    paymentMethod = 'COD',
    couponCode = null,
    customerNote = '',
    inspectionAcknowledged = true,
  } = payload;

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
    throw ApiError.badRequest('Full shipping address (Name, Phone, Street, City) is required');
  }
  const normalizedPhone = normalizeSupportedMobilePhone(shippingAddress.phone);
  if (!normalizedPhone) {
    throw ApiError.badRequest('Enter a valid mobile number with a supported country calling code');
  }
  const normalizedShippingAddress = { ...shippingAddress, phone: normalizedPhone };

  // Idempotency check
  if (idempotencyKey && mongoose.connection.readyState === 1) {
    const existing = await Order.findOne({ idempotencyKey }).lean();
    if (existing) {
      return existing;
    }
  }

  // Calculate guaranteed quote
  const quote = await getCheckoutQuote({
    items,
    city: normalizedShippingAddress.city,
    deliveryOptionCode,
    paymentMethod,
    couponCode,
    userId,
  });

  const orderNumber = await generateOrderNumber();

  return handleMutation({
    tags: ['orders', 'inventory', 'stock'],
    action: async () => {
      if (mongoose.connection.readyState !== 1) {
        throw ApiError.serviceUnavailable('Database connection offline');
      }

      // Decrement stock atomically per item with compensatory rollback on partial failure
      const decrementedItems = [];
      for (const item of quote.items) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            'variants.sku': item.variantSku,
            'variants.stock': { $gte: item.quantity },
          },
          {
            $inc: {
              'variants.$.stock': -item.quantity,
              stock: -item.quantity,
              soldCount: item.quantity,
            },
          },
          { returnDocument: 'after' }
        );

        if (!updated) {
          // Compensatory Rollback: Re-increment any previously decremented items
          for (const prev of decrementedItems) {
            await Product.updateOne(
              { _id: prev.productId, 'variants.sku': prev.variantSku },
              {
                $inc: {
                  'variants.$.stock': prev.quantity,
                  stock: prev.quantity,
                  soldCount: -prev.quantity,
                },
              }
            ).catch(() => {});
          }

          throw ApiError.conflict(
            `Item ${item.name} (${item.size}) just sold out or has insufficient stock.`
          );
        }

        decrementedItems.push(item);
      }

      // Atomically increment coupon usedCount if coupon applied
      if (couponCode && quote.pricing?.discount > 0) {
        Coupon.updateOne(
          { code: couponCode.trim().toUpperCase() },
          { $inc: { usedCount: 1 } }
        ).catch(() => {});
      }

      // Snapshot payment account for MANUAL transfer
      let accountSnapshot = null;
      let accountId = null;
      if (paymentMethod === 'MANUAL') {
        const activeAccount = await PaymentAccount.findOne({ isActive: true })
          .sort({ sortOrder: 1 })
          .lean();
        if (activeAccount) {
          accountId = activeAccount._id;
          accountSnapshot = {
            type: activeAccount.type,
            providerName: activeAccount.providerName,
            accountTitle: activeAccount.accountTitle,
            accountNumberMasked: activeAccount.accountNumber,
          };
        }
      }

      const initialStatus = paymentMethod === 'COD' ? 'awaiting_confirmation' : 'awaiting_payment';
      const initialPaymentStatus = paymentMethod === 'COD' ? 'cod_pending' : 'awaiting_proof';
      const expiresAt =
        paymentMethod === 'MANUAL'
          ? new Date(Date.now() + env.UNPAID_ORDER_EXPIRY_HOURS * 60 * 60 * 1000)
          : null;

      const order = new Order({
        orderNumber,
        userId,
        items: quote.items,
        pricing: quote.pricing,
        paymentMethod,
        payment: {
          status: initialPaymentStatus,
          accountId,
          accountSnapshot,
          amountDue: quote.pricing.total,
          proof: { via: null },
        },
        status: initialStatus,
        statusHistory: [
          {
            status: initialStatus,
            at: new Date(),
            by: 'user',
            note: 'Order placed successfully',
          },
        ],
        shippingAddress: normalizedShippingAddress,
        delivery: quote.delivery,
        customerNote,
        inspectionAcknowledged,
        idempotencyKey,
        expiresAt,
      });

      await order.save();

      // Dispatch real-time in-app notifications
      if (userId) {
        notifyUser(userId, {
          type: 'order',
          title: `Order Booked (#${orderNumber})`,
          body: `Your order for Rs ${quote.pricing.total.toLocaleString()} has entered our Master Darzi queue.`,
          link: `/user/orders/${orderNumber}`,
        }).catch(() => {});
      }

      notifyAdmins({
        type: 'order',
        title: `New Order Placed: #${orderNumber}`,
        body: `New order from ${shippingAddress.fullName} (${shippingAddress.city}) for Rs ${quote.pricing.total.toLocaleString()}.`,
        link: `/admin/orders`,
      }).catch(() => {});

      // Clear user's active cart in background
      if (userId) {
        clearCart(userId).catch(() => {});
      }

      // Dispatch order confirmation email asynchronously
      const orderObj = order.toObject();
      const recipientEmail = shippingAddress?.email;
      if (recipientEmail) {
        sendOrderConfirmedEmail({
          to: recipientEmail,
          order: orderObj,
          customerName: shippingAddress.fullName,
        }).catch(() => {});
      } else if (userId && mongoose.connection.readyState === 1) {
        User.findById(userId)
          .lean()
          .then((u) => {
            if (u?.email) {
              sendOrderConfirmedEmail({
                to: u.email,
                order: orderObj,
                customerName: shippingAddress.fullName || u.name,
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }

      return orderObj;
    },
  }).then((res) => res.result);
}

/**
 * Submits manual payment proof (receipt upload or WhatsApp notice)
 */
export async function submitPaymentProof(orderId, { via = 'upload', imageUrl, publicId, txnRef, userId }) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = {
    ...(mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId }),
    userId,
  };
  const order = await Order.findOne(query);

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  order.payment.status = 'proof_submitted';
  order.expiresAt = null;
  order.payment.proof = {
    via,
    imageUrl: imageUrl || null,
    publicId: publicId || null,
    txnRef: txnRef ? txnRef.trim() : null,
    submittedAt: new Date(),
  };

  order.statusHistory.push({
    status: order.status,
    at: new Date(),
    by: 'user',
    note: `Payment proof submitted via ${via} (Ref: ${txnRef || 'None'})`,
  });

  await order.save();
  return order.toObject();
}

/**
 * Customer confirms that parcel has been successfully delivered and received
 */
export async function confirmDeliveryReceipt(orderId, { notes = '', rating = 5, userId }) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = {
    ...(mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId }),
    userId,
  };
  const order = await Order.findOne(query);

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.status === 'delivered') {
    return order.toObject();
  }

  if (!['dispatched', 'out_for_delivery'].includes(order.status)) {
    throw ApiError.conflict('Delivery can only be confirmed after the order has been dispatched');
  }

  const update = {
    status: 'delivered',
    ...(order.paymentMethod === 'COD' && order.payment.status === 'cod_pending'
      ? { 'payment.status': 'cod_collected' }
      : {}),
  };
  const confirmedOrder = await Order.findOneAndUpdate(
    { ...query, status: { $in: ['dispatched', 'out_for_delivery'] } },
    {
      $set: update,
      $push: {
        statusHistory: {
          status: 'delivered',
          at: new Date(),
          by: 'user',
          note: notes ? `Customer confirmed receipt: ${notes}` : 'Customer confirmed parcel receipt at doorstep',
        },
      },
    },
    { returnDocument: 'after' }
  );
  if (!confirmedOrder) {
    const latestOrder = await Order.findOne(query);
    if (latestOrder?.status === 'delivered') return latestOrder.toObject();
    throw ApiError.conflict('Delivery can only be confirmed after the order has been dispatched');
  }

  // Invalidate caches
  handleMutation({ tags: ['orders', 'admin-metrics'], action: async () => {} }).catch(() => {});

  // Notify admins
  notifyAdmins({
    type: 'order',
    title: `Delivery Confirmed by Customer (#${order.orderNumber})`,
    body: `Customer ${order.shippingAddress?.fullName} confirmed parcel received in ${order.shippingAddress?.city}.`,
    link: `/admin/orders/${order.orderNumber}`,
  }).catch(() => {});

  return confirmedOrder.toObject();
}


/**
 * Retrieves order details and tracking status
 */
export async function getOrderById(orderIdentifier, userId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = {
    ...(mongoose.isValidObjectId(orderIdentifier)
      ? { _id: orderIdentifier }
      : { orderNumber: orderIdentifier }),
    userId,
  };

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return order;
}

/**
 * Lists orders belonging strictly to the authenticated user with backend-driven pagination
 */
export async function listOrdersByUser(userId, query = {}) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const { page, limit, skip } = parsePagination(query);
  const filter = { userId };

  if (query.status && query.status !== 'All') {
    if (query.status === 'In Progress') {
      filter.status = { $in: ['placed', 'awaiting_payment', 'awaiting_confirmation', 'confirmed', 'processing'] };
    } else if (query.status === 'Dispatched') {
      filter.status = { $in: ['dispatched', 'out_for_delivery'] };
    } else if (query.status === 'Delivered') {
      filter.status = 'delivered';
    } else {
      filter.status = query.status.toLowerCase();
    }
  }

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('orderNumber items pricing paymentMethod payment status delivery createdAt')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return formatPaginated(items, total, page, limit);
}
