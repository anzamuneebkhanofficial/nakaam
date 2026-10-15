import mongoose from 'mongoose';
import { PaymentAccount } from './paymentAccount.model.js';
import { getOrLoad } from '../../core/cache/index.js';

export async function getActivePaymentAccounts() {
  const cacheKey = 'payments:accounts:active';

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        return [
          {
            type: 'bank',
            providerName: 'HBL',
            accountTitle: 'Nakaam Studio',
            accountNumber: '01234567890123',
          },
        ];
      }

      return PaymentAccount.find({ isActive: true })
        .sort({ sortOrder: 1, providerName: 1 })
        .lean();
    },
    {
      ttl: 3600000, // 1 hour
      tags: ['payments'],
    }
  );
}
