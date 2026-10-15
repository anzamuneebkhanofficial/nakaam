import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['percent', 'flat'],
      default: 'percent',
    },
    value: {
      type: Number,
      required: true,
      min: 1,
    },
    minSubtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    appliesTo: {
      audiences: [{ type: String, trim: true }],
      categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },
    allowOnSaleItems: {
      type: Boolean,
      default: false,
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

couponSchema.index({ code: 1, isActive: 1 });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
