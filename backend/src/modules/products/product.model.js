import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    audience: {
      type: String,
      required: true,
      enum: ['women', 'men', 'kids', 'footwear', 'home', 'collections'],
      index: true,
    },
    tags: [{ type: String, trim: true }],
    searchKeywords: [{ type: String, trim: true }],
    price: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer PKR price',
      },
    },
    compareAtPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || Number.isInteger(v);
        },
        message: '{VALUE} is not an integer PKR compareAtPrice',
      },
    },
    sale: {
      isEnabled: { type: Boolean, default: false },
      salePrice: {
        type: Number,
        default: null,
        validate: {
          validator: function (v) {
            return v === null || (Number.isInteger(v) && v > 0);
          },
          message: '{VALUE} is not a valid integer PKR sale price',
        },
      },
      discountType: {
        type: String,
        enum: ['percent', 'flat', 'fixed'],
      },
      value: { type: Number, min: 0 },
      campaignName: { type: String, trim: true, default: null },
      startsAt: { type: Date },
      endsAt: { type: Date },
    },
    fabric: { type: String, trim: true },
    fabricComposition: { type: String, trim: true },
    care: [{ type: String, trim: true }],
    shrinkageNote: { type: String, trim: true },
    origin: { type: String, trim: true, default: 'Pakistan' },
    stock: { type: Number, default: 0, min: 0 },
    hasVariants: { type: Boolean, default: false },
    specifications: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    images: [
      {
        publicId: { type: String, trim: true },
        url: { type: String, required: true, trim: true },
        alt: { type: String, trim: true, default: '' },
        color: { type: String, trim: true },
        isTrueColor: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        width: { type: Number },
        height: { type: Number },
      },
    ],
    colors: [
      {
        name: { type: String, trim: true },
        hex: { type: String, trim: true },
      },
    ],
    variants: [
      {
        sku: { type: String, required: true, trim: true, uppercase: true },
        size: { type: String, required: true, trim: true },
        color: { type: String, trim: true },
        stock: { type: Number, default: 0, min: 0 },
        reservedStock: { type: Number, default: 0, min: 0 },
        priceOverride: { type: Number, default: null },
      },
    ],
    sizeChart: {
      unit: { type: String, default: 'cm' },
      rows: [
        {
          size: { type: String, trim: true },
          bustChest: { type: Number },
          waist: { type: Number },
          hips: { type: Number },
          length: { type: Number },
          shoulder: { type: Number },
          sleeve: { type: Number },
          footLengthCm: { type: Number },
        },
      ],
    },
    model: {
      heightCm: { type: Number },
      sizeWorn: { type: String, trim: true },
    },
    fit: {
      label: {
        type: String,
        enum: ['runs_small', 'true', 'runs_large', null],
        default: null,
      },
      votes: {
        small: { type: Number, default: 0 },
        true: { type: Number, default: 0 },
        large: { type: Number, default: 0 },
      },
      sampleSize: { type: Number, default: 0 },
    },
    occasion: [{ type: String, trim: true }],
    season: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    bundleWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
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

productSchema.index({ category: 1, status: 1, createdAt: -1 });
productSchema.index({ audience: 1, status: 1, price: 1 });
productSchema.index({ audience: 1, category: 1, status: 1, createdAt: -1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isBestSeller: 1, status: 1, createdAt: -1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, updatedAt: -1 });
productSchema.index({ 'variants.sku': 1 }, { sparse: true });
productSchema.index(
  {
    name: 'text',
    tags: 'text',
    searchKeywords: 'text',
    description: 'text',
  },
  {
    weights: {
      name: 10,
      searchKeywords: 8,
      tags: 5,
      description: 1,
    },
    name: 'ProductTextIndex',
  }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
