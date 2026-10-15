import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';
import { ApiError } from '../../core/apiError.js';
import { logger } from '../../utils/logger.js';

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

/**
 * Verify real file type by examining magic bytes at the start of the buffer.
 *
 * @param {Buffer} buffer
 * @returns {{ isValid: boolean, format?: string }}
 */
export function verifyMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) {
    return { isValid: false };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, format: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, format: 'png' };
  }

  // WebP: RIFF (bytes 0..3 = 'RIFF') and WEBP (bytes 8..11 = 'WEBP')
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, format: 'webp' };
  }

  return { isValid: false };
}

/**
 * Multer memory storage configuration
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: (env.MAX_UPLOAD_FILE_SIZE_MB || 5) * 1024 * 1024,
    files: env.MAX_UPLOAD_FILES || 20,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      return cb(new ApiError(415, 'INVALID_FILE_TYPE', `Unsupported image type: ${file.mimetype}. Allowed: JPEG, PNG, WebP`));
    }
    cb(null, true);
  },
});

/**
 * Upload single buffer to Cloudinary via upload_stream
 *
 * @param {Buffer} buffer
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        overwrite: false,
        use_filename: false,
        unique_filename: true,
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary stream upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Execute tasks with a concurrency limit (default 3)
 *
 * @param {Array<Function>} taskFns
 * @param {number} concurrency
 * @returns {Promise<Array<any>>}
 */
export async function runWithConcurrency(taskFns, concurrency = 3) {
  const results = new Array(taskFns.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < taskFns.length) {
      const currentIndex = nextIndex++;
      try {
        results[currentIndex] = await taskFns[currentIndex]();
      } catch (err) {
        results[currentIndex] = { error: err };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, taskFns.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
