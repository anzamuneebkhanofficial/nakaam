import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String, default: '' },
    phone: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBlocked: { type: Boolean, default: false },
    riskNote: { type: String, default: '' },
  },
  {
    collection: 'user', // Maps directly to Better Auth user collection
    strict: false,
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ role: 1, isBlocked: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
