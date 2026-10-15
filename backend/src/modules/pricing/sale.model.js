import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bannerText: { type: String, default: '', trim: true },
    discountType: { type: String, required: true, enum: ['percent', 'flat'], default: 'percent' },
    value: { type: Number, required: true, min: 1 },
    scope: { type: String, enum: ['all', 'categories', 'products', 'audiences'], default: 'all' },
    targetAudiences: [{ type: String, trim: true }],
    targetCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    targetProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    excludeProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date, required: true },
    isEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

saleSchema.index({ isEnabled: 1, startsAt: 1, endsAt: 1 });

export const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
