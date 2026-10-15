import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generate a signed Cloudinary upload payload for client direct uploads.
 *
 * @param {Object} options
 * @param {string} options.kind - 'product' | 'banner' | 'proof' | 'category'
 * @param {string} [options.entityId] - e.g. productId or orderId
 * @returns {Object} Signed upload parameters
 */
export function generateSignedUploadParams({ kind = 'product', entityId = 'draft' }) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `${env.CLOUDINARY_ROOT_FOLDER}/${kind}s/${entityId}`;
  
  const paramsToSign = {
    folder,
    timestamp,
    upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET
  );

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder,
    uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
  };
}

/**
 * Rollback / delete an uploaded media asset immediately by its publicId.
 *
 * @param {string} publicId
 * @returns {Promise<Object>}
 */
export async function deleteMediaAsset(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary asset destroyed: ${publicId}`, result);
    return result;
  } catch (error) {
    logger.error(`Failed to destroy Cloudinary asset: ${publicId}`, error);
    return { result: 'error', error: error.message };
  }
}
