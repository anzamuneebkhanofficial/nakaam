import * as yup from 'yup';
import { respond } from '../../core/respond.js';
import { ApiError } from '../../core/apiError.js';
import { env } from '../../config/env.js';
import * as mediaService from './media.service.js';
import { verifyMagicBytes, uploadBufferToCloudinary, runWithConcurrency } from './media.upload.js';

const uploadSchema = yup.object({
  kind: yup
    .string()
    .oneOf(['product', 'category', 'banner', 'payment_qr', 'store'])
    .required('kind is required'),
  entityId: yup.string().default('draft'),
});

const FOLDER_MAP = {
  product: 'products',
  category: 'categories',
  banner: 'banners',
  payment_qr: 'payments',
  store: 'store',
};

export function signUpload(req, res) {
  const { kind = 'product', entityId } = req.body;
  const payload = mediaService.generateSignedUploadParams({ kind, entityId });
  return respond(res, payload);
}

export async function uploadMedia(req, res) {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No files provided for upload');
  }

  const { kind, entityId } = await uploadSchema.validate(req.body);

  let clientIds = [];
  if (req.body.clientIds) {
    try {
      clientIds = typeof req.body.clientIds === 'string' ? JSON.parse(req.body.clientIds) : req.body.clientIds;
    } catch {
      clientIds = [];
    }
  }

  const subFolder = FOLDER_MAP[kind] || `${kind}s`;
  const folder = kind === 'store'
    ? `${env.CLOUDINARY_ROOT_FOLDER}/store`
    : `${env.CLOUDINARY_ROOT_FOLDER}/${subFolder}/${entityId || 'draft'}`;

  const uploaded = [];
  const failed = [];
  const uploadTasks = [];

  req.files.forEach((file, index) => {
    const clientId = clientIds[index] || `file_${index}`;
    const magic = verifyMagicBytes(file.buffer);

    if (!magic.isValid) {
      failed.push({
        clientId,
        name: file.originalname,
        code: 'INVALID_FILE_TYPE',
        message: 'File magic bytes do not match supported image formats (JPEG, PNG, WebP)',
      });
      return;
    }

    uploadTasks.push(async () => {
      try {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder,
        });

        return {
          success: true,
          data: {
            clientId,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
          },
        };
      } catch (err) {
        return {
          success: false,
          data: {
            clientId,
            name: file.originalname,
            code: 'UPLOAD_FAILED',
            message: err.message || 'Cloudinary upload failed',
          },
        };
      }
    });
  });

  const taskResults = await runWithConcurrency(uploadTasks, 3);

  taskResults.forEach((resItem) => {
    if (resItem?.success) {
      uploaded.push(resItem.data);
    } else if (resItem?.data) {
      failed.push(resItem.data);
    } else if (resItem?.error) {
      failed.push({
        clientId: 'unknown',
        code: 'UPLOAD_FAILED',
        message: resItem.error.message || 'Upload failed',
      });
    }
  });

  return respond(res, {
    uploaded,
    failed,
  });
}

export async function deleteAsset(req, res) {
  const publicId = req.body?.publicId || req.params?.publicId;
  if (!publicId) {
    throw ApiError.badRequest('publicId is required');
  }

  // Security check: ensure publicId belongs to the root folder
  if (!publicId.startsWith(env.CLOUDINARY_ROOT_FOLDER)) {
    throw ApiError.forbidden('Cannot delete assets outside of this application folder');
  }

  const result = await mediaService.deleteMediaAsset(publicId);
  return respond(res, result);
}
