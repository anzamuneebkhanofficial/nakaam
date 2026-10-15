import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{ type: String, trim: true }],
    isVerifiedBuyer: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Public by default after submission
      index: true,
    },
    moderationNote: {
      type: String,
      default: '',
      trim: true,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    moderatedAt: {
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

// Reviews index (allow multiple reviews per user/product)
reviewSchema.index({ productId: 1, userId: 1 });
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// Drop legacy unique index if it exists in MongoDB to ensure repeatable reviews succeed
if (mongoose.connection) {
  mongoose.connection.on('open', () => {
    Review.collection?.dropIndex('productId_1_userId_1').catch(() => {});
  });
  if (mongoose.connection.readyState === 1) {
    Review.collection?.dropIndex('productId_1_userId_1').catch(() => {});
  }
}

