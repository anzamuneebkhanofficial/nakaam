import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main',
      unique: true,
      required: true,
    },
    storeName: {
      type: String,
      default: 'Nakaam',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    supportPhones: [
      {
        label: { type: String, trim: true },
        number: { type: String, trim: true },
      },
    ],
    whatsappNumber: {
      type: String,
      default: '923000000000',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: 'support@nakaam.com',
      trim: true,
    },
    serviceCities: [
      {
        name: { type: String, required: true, trim: true },
        areas: [{ type: String, trim: true }],
      },
    ],
    codEnabled: {
      type: Boolean,
      default: true,
    },
    codMaxAmount: {
      type: Number,
      default: 50000,
    },
    codRequiresConfirmation: {
      type: Boolean,
      default: true,
    },
    prepaidDiscount: {
      type: {
        type: String,
        enum: ['percent', 'flat'],
        default: 'percent',
      },
      value: { type: Number, default: 5 },
    },
    freeShippingThreshold: {
      type: Number,
      default: 5000,
    },
    manualPaymentWindowHours: {
      type: Number,
      default: 24,
    },
    returnWindowDays: {
      type: Number,
      default: 7,
    },
    exchangeCoversSaleItems: {
      type: Boolean,
      default: true,
    },
    whatsappTemplates: {
      orderConfirm: { type: String, default: '' },
      paymentProof: { type: String, default: '' },
      paymentVerified: { type: String, default: '' },
      dispatched: { type: String, default: '' },
    },
    announcementBar: {
      text: {
        type: String,
        default: 'Doorstep inspection before payment across Lahore • Free shipping on orders over PKR 5,000',
      },
      link: { type: String, default: '/shipping-returns' },
      isActive: { type: Boolean, default: true },
    },
    social: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
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

export const StoreSettings =
  mongoose.models.StoreSettings || mongoose.model('StoreSettings', storeSettingsSchema);
