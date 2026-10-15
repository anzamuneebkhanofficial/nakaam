import mongoose from 'mongoose';

const paymentAccountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['bank', 'wallet', 'crypto'],
      trim: true,
    },
    providerName: {
      type: String,
      required: true,
      trim: true,
    },
    accountTitle: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    iban: {
      type: String,
      default: '',
      trim: true,
    },
    network: {
      type: String,
      default: '',
      trim: true,
    },
    qrImage: {
      type: String,
      default: '',
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
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

paymentAccountSchema.index({ isActive: 1, sortOrder: 1 });

export const PaymentAccount =
  mongoose.models.PaymentAccount || mongoose.model('PaymentAccount', paymentAccountSchema);
