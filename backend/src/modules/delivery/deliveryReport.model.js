import mongoose from 'mongoose';

const deliveryReportSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    issueType: {
      type: String,
      required: true,
      enum: ['delayed', 'wrong_address', 'damaged', 'courier_unreachable', 'other'],
    },
    preferredContactMethod: {
      type: String,
      enum: ['whatsapp', 'call', 'email'],
      default: 'whatsapp',
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'closed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

deliveryReportSchema.index({ createdAt: -1 });
deliveryReportSchema.index({ status: 1, createdAt: -1 });

export const DeliveryReport =
  mongoose.models.DeliveryReport || mongoose.model('DeliveryReport', deliveryReportSchema);
