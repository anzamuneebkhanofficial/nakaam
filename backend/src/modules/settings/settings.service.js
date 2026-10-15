import mongoose from 'mongoose';
import { StoreSettings } from './storeSettings.model.js';
import { getOrLoad } from '../../core/cache/index.js';
import { TTL } from '../../core/cache/config.js';
import { env } from '../../config/env.js';

const DEFAULT_SETTINGS = {
  storeName: 'Nakaam',
  logoUrl: '',
  supportPhones: [
    { label: 'Customer Concierge', number: '+92 42 111 625 226' },
    { label: 'WhatsApp Care', number: env.STORE_WHATSAPP_NUMBER },
  ],
  whatsappNumber: env.STORE_WHATSAPP_NUMBER,
  supportEmail: 'care@nakaam.com',
  serviceCities: [
    {
      name: 'Lahore',
      areas: ['Gulberg', 'DHA', 'Model Town', 'Johar Town', 'Cantt', 'Bahria Town', 'Faisal Town'],
    },
  ],
  codEnabled: true,
  codMaxAmount: 50000,
  prepaidDiscount: { type: 'percent', value: 5 },
  freeShippingThreshold: 5000,
  returnWindowDays: 7,
  exchangeCoversSaleItems: true,
  announcementBar: {
    text: 'Doorstep inspection before payment across Lahore • Free shipping on orders over PKR 5,000',
    link: '/shipping-returns',
    isActive: true,
  },
  social: { instagram: '@nakaam.official', facebook: 'nakaampk', whatsapp: env.STORE_WHATSAPP_NUMBER },
  maintenanceMode: false,
};

export async function getPublicSettings() {
  const cacheKey = 'settings:public';

  return getOrLoad(
    cacheKey,
    async () => {
      // If DB is offline / not connected, return fallback immediately
      if (mongoose.connection.readyState !== 1) {
        return DEFAULT_SETTINGS;
      }

      const settings = await StoreSettings.findOne({ key: 'main' }).lean();
      if (!settings) {
        return DEFAULT_SETTINGS;
      }

      return {
        storeName: settings.storeName,
        logoUrl: settings.logoUrl,
        supportPhones: [
          ...(settings.supportPhones || []).filter((phone) => !/whatsapp/i.test(phone.label || '')),
          { label: 'WhatsApp Care', number: env.STORE_WHATSAPP_NUMBER },
        ],
        whatsappNumber: env.STORE_WHATSAPP_NUMBER,
        supportEmail: settings.supportEmail,
        serviceCities: settings.serviceCities,
        codEnabled: settings.codEnabled,
        codMaxAmount: settings.codMaxAmount,
        prepaidDiscount: settings.prepaidDiscount,
        freeShippingThreshold: settings.freeShippingThreshold,
        returnWindowDays: settings.returnWindowDays,
        exchangeCoversSaleItems: settings.exchangeCoversSaleItems,
        announcementBar: settings.announcementBar,
        social: { ...settings.social, whatsapp: env.STORE_WHATSAPP_NUMBER },
        maintenanceMode: settings.maintenanceMode,
      };
    },
    {
      ttl: TTL.SETTINGS,
      tags: ['settings'],
    }
  );
}

export async function getAdminSettings() {
  if (mongoose.connection.readyState !== 1) {
    return DEFAULT_SETTINGS;
  }
  const settings = await StoreSettings.findOne({ key: 'main' }).lean();
  return settings || DEFAULT_SETTINGS;
}

export async function updateStoreSettings(updates) {
  if (mongoose.connection.readyState !== 1) {
    return { ...DEFAULT_SETTINGS, ...updates };
  }
  const settings = await StoreSettings.findOneAndUpdate(
    { key: 'main' },
    { $set: updates },
    { upsert: true, returnDocument: 'after', runValidators: true }
  ).lean();

  const { invalidateTag } = await import('../../core/cache/index.js');
  invalidateTag('settings');
  return settings;
}
