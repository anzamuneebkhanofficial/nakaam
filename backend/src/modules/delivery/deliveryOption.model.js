import mongoose from 'mongoose';

const deliveryOptionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      enum: ['express', 'standard', 'economy'],
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    etaDaysMin: {
      type: Number,
      required: true,
    },
    etaDaysMax: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    freeAbove: {
      type: Number,
      default: null,
    },
    cities: [{ type: String, trim: true }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

deliveryOptionSchema.index({ isActive: 1, sortOrder: 1 });

export const DeliveryOption =
  mongoose.models.DeliveryOption || mongoose.model('DeliveryOption', deliveryOptionSchema);
