import mongoose from 'mongoose';
import { ORDER_STATUSES } from './order.constants.js';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantSku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    saleLabel: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'Order must contain at least one item'],
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      saleSavings: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, default: null, trim: true, uppercase: true },
      discount: { type: Number, default: 0, min: 0 },
      prepaidDiscount: { type: Number, default: 0, min: 0 },
      deliveryFee: { type: Number, required: true, default: 0, min: 0 },
      total: { type: Number, required: true, min: 1 },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['COD', 'MANUAL'],
      default: 'COD',
      index: true,
    },
    payment: {
      status: {
        type: String,
        required: true,
        enum: [
          'unpaid',
          'awaiting_proof',
          'proof_submitted',
          'verified',
          'rejected',
          'cod_pending',
          'cod_collected',
          'refunded',
        ],
        default: 'cod_pending',
        index: true,
      },
      accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentAccount' },
      accountSnapshot: {
        type: { type: String },
        providerName: { type: String },
        accountTitle: { type: String },
        accountNumberMasked: { type: String },
      },
      amountDue: { type: Number, required: true },
      amountVerified: { type: Number, default: null },
      proof: {
        via: { type: String, enum: ['whatsapp', 'upload', null], default: null },
        imageUrl: { type: String, default: null },
        publicId: { type: String, default: null },
        txnRef: { type: String, default: null, trim: true },
        submittedAt: { type: Date, default: null },
        retainedDeletedAt: { type: Date, default: null },
      },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: { type: Date },
      rejectionReason: { type: String, trim: true },
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: 'placed',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        by: { type: String, enum: ['system', 'user', 'admin'], default: 'system' },
        byUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true, default: 'Lahore' },
      area: { type: String, trim: true },
      street: { type: String, required: true, trim: true },
      houseNo: { type: String, trim: true },
      landmark: { type: String, trim: true },
    },
    delivery: {
      optionCode: { type: String, required: true, default: 'standard' },
      label: { type: String, default: 'Standard Courier (3-4 Days)' },
      etaDaysMin: { type: Number, default: 3 },
      etaDaysMax: { type: Number, default: 4 },
      fee: { type: Number, default: 250 },
      courier: { type: String, default: 'TCS / Leopards' },
      trackingNumber: { type: String, default: null },
    },
    customerNote: { type: String, default: '', trim: true },
    adminNote: { type: String, default: '', trim: true },
    cod: {
      confirmedAt: { type: Date },
      confirmedVia: { type: String, enum: ['whatsapp', 'call', 'admin'] },
      attempts: { type: Number, default: 0 },
    },
    inspectionAcknowledged: {
      type: Boolean,
      default: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1, createdAt: -1 });
orderSchema.index({ status: 1, 'payment.status': 1 });
orderSchema.index({ 'shippingAddress.phone': 1 });
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
