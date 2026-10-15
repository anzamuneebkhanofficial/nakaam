import { apiClient } from '@/lib/apiClient';

/**
 * Upload files with real-time XHR upload progress reporting
 *
 * @param {Object} options
 * @param {File[]} options.files - Files to upload
 * @param {string} options.kind - 'product' | 'category' | 'banner' | 'payment_qr' | 'store'
 * @param {string} [options.entityId] - Target ID
 * @param {string[]} [options.clientIds] - Tracking client IDs matching each file
 * @param {Function} [options.onProgress] - (percent: number, loaded: number, total: number) => void
 * @param {AbortSignal} [options.signal] - For cancellation
 * @returns {Promise<{ uploaded: Array, failed: Array }>}
 */
export function uploadMediaFiles({
  files,
  kind = 'product',
  entityId = 'draft',
  clientIds = [],
  onProgress,
  signal,
}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('kind', kind);
    formData.append('entityId', entityId);
    if (clientIds && clientIds.length > 0) {
      formData.append('clientIds', JSON.stringify(clientIds));
    }

    if (signal) {
      if (signal.aborted) {
        return reject(new Error('Upload aborted'));
      }
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload aborted'));
      });
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent, event.loaded, event.total);
        }
      };
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 0) {
          return reject(new Error('Upload cancelled or network error'));
        }

        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && json?.success !== false) {
            resolve(json.data || json);
          } else {
            const message = json?.error?.message || json?.message || `Server error (${xhr.status})`;
            reject(new Error(message));
          }
        } catch {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ uploaded: [], failed: [] });
          } else {
            reject(new Error(`Server returned error status ${xhr.status}`));
          }
        }
      }
    };

    xhr.open('POST', '/api/admin/media/upload', true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(formData);
  });
}

/**
 * Delete a media asset from Cloudinary by its publicId
 *
 * @param {string} publicId
 * @returns {Promise<any>}
 */
export async function deleteMediaAsset(publicId) {
  return await apiClient('/admin/media', {
    method: 'DELETE',
    body: { publicId },
  });
}
