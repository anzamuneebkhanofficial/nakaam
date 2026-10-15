import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['order', 'payment', 'dispatched', 'darzi', 'system', 'sale'],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: null,
      trim: true,
    },
    readAt: {
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

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });
export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
