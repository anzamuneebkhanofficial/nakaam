import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    placement: {
      type: String,
      required: true,
      enum: ['home_hero', 'home_strip', 'category'],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    ctaLabel: {
      type: String,
      default: 'Shop Now',
      trim: true,
    },
    ctaLink: {
      type: String,
      default: '/shop',
      trim: true,
    },
    imageDesktop: {
      type: String,
      required: true,
      trim: true,
    },
    imageMobile: {
      type: String,
      default: '',
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
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

bannerSchema.index({ placement: 1, isActive: 1, sortOrder: 1 });

export const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
