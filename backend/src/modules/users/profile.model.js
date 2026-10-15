import mongoose from 'mongoose';

const measurementsSchema = new mongoose.Schema(
  {
    bustChest: { type: Number, default: null }, // cm
    waist: { type: Number, default: null },
    hips: { type: Number, default: null },
    shoulder: { type: Number, default: null },
    height: { type: Number, default: null },
    footLengthCm: { type: Number, default: null },
  },
  { _id: false }
);

const familyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: {
      type: String,
      required: true,
      enum: ['Mother', 'Father', 'Daughter', 'Son', 'Sister', 'Brother', 'Spouse', 'Other'],
      default: 'Other',
    },
    ageGroup: {
      type: String,
      enum: ['adult', 'teen', 'child', 'infant'],
      default: 'adult',
    },
    gender: {
      type: String,
      enum: ['female', 'male', 'other'],
      default: 'female',
    },
    measurements: {
      type: measurementsSchema,
      default: () => ({}),
    },
    shoeSize: { type: String, default: null },
  },
  { timestamps: true }
);

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ['female', 'male', 'other', null],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    measurements: {
      type: measurementsSchema,
      default: () => ({}),
    },
    familyMembers: {
      type: [familyMemberSchema],
      default: [],
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
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

export const UserProfile =
  mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);
