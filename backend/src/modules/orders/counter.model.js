import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g. 'order', 'complaint'
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Atomically increments and gets the next sequence number
 * @param {string} name
 * @returns {Promise<number>}
 */
export async function getNextSequence(name) {
  if (mongoose.connection.readyState !== 1) {
    return Math.floor(1000 + Math.random() * 9000);
  }

  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  return counter.seq;
}

/**
 * Generates an order number in format: NK-YYMM-000123
 * @param {Date} [date]
 * @returns {Promise<string>}
 */
export async function generateOrderNumber(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const seq = await getNextSequence(`order_${yy}${mm}`);
  const paddedSeq = String(seq).padStart(6, '0');
  return `NK-${yy}${mm}-${paddedSeq}`;
}
