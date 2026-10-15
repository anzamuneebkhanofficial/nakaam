import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
      index: true,
    },
    resolutionMessage: {
      type: String,
      default: null,
      trim: true,
    },
    resolvedAt: {
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

complaintSchema.index({ userId: 1, status: 1, createdAt: -1 });
// Auto-delete resolved complaints 7 days after resolution (7 * 24 * 3600 = 604800 seconds)
complaintSchema.index({ resolvedAt: 1 }, { expireAfterSeconds: 604800 });

export const Complaint =
  mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
