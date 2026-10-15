'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { uploadMediaFiles, deleteMediaAsset } from './api';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Button } from '@/components/ui/Button';
import {
  Upload,
  Trash2,
  RotateCcw,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Compress an image in the browser using HTML5 Canvas.
 * Targets longest side <= 2000px, quality 0.85, output WebP (or JPEG fallback).
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
async function compressImageInBrowser(file) {
  // If not an image, return as is
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 2000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          mimeType,
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Reusable Image Uploader with live progress, drag-and-drop, and management.
 */
export function ImageUploader({
  images: imagesProp,
  value,
  onChange,
  kind = 'product',
  entityId = 'draft',
  maxFiles = 8,
  className = '',
}) {
  const images = React.useMemo(() => {
    return Array.isArray(imagesProp) ? imagesProp : Array.isArray(value) ? value : [];
  }, [imagesProp, value]);

  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeUploads, setActiveUploads] = useState([]); // [{ id, file, preview, status, progress, error, abortController }]
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { index, image }
  const [editingAltIndex, setEditingAltIndex] = useState(null);
  const [altInputText, setAltInputText] = useState('');

  const activeUploadsRef = useRef(activeUploads);
  activeUploadsRef.current = activeUploads;

  // Keep a mutable ref of current images so parallel uploads never overwrite each other
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const executeUpload = useCallback(
    async (uploadItem) => {
      try {
        // Step 1: Compress
        setActiveUploads((prev) =>
          prev.map((item) => (item.id === uploadItem.id ? { ...item, status: 'compressing' } : item))
        );

        const compressed = await compressImageInBrowser(uploadItem.file);

        // Step 2: Upload
        setActiveUploads((prev) =>
          prev.map((item) => (item.id === uploadItem.id ? { ...item, status: 'uploading', progress: 5 } : item))
        );

        const response = await uploadMediaFiles({
          files: [compressed],
          kind,
          entityId,
          clientIds: [uploadItem.id],
          signal: uploadItem.abortController.signal,
          onProgress: (percent) => {
            setActiveUploads((prev) =>
              prev.map((item) =>
                item.id === uploadItem.id ? { ...item, progress: Math.max(5, Math.min(95, percent)) } : item
              )
            );
          },
        });

        const uploadedRecord = response.uploaded?.[0];
        const failedRecord = response.failed?.[0];

        if (failedRecord) {
          throw new Error(failedRecord.message || 'Upload rejected by server');
        }

        if (uploadedRecord) {
          setActiveUploads((prev) =>
            prev.map((item) =>
              item.id === uploadItem.id ? { ...item, status: 'done', progress: 100 } : item
            )
          );

          const newImgObj = {
            url: uploadedRecord.url,
            publicId: uploadedRecord.publicId,
            alt: uploadItem.file.name.replace(/\.[^/.]+$/, ''),
            order: imagesRef.current.length,
            width: uploadedRecord.width,
            height: uploadedRecord.height,
          };

          const updatedImages = [...imagesRef.current, newImgObj];
          imagesRef.current = updatedImages;
          onChange(updatedImages);
          toast.success(`Uploaded "${uploadItem.file.name}"`);

          setTimeout(() => {
            setActiveUploads((prev) => prev.filter((item) => item.id !== uploadItem.id));
            URL.revokeObjectURL(uploadItem.preview);
          }, 600);
        }
      } catch (err) {
        if (err.message === 'Upload aborted') {
          setActiveUploads((prev) => prev.filter((item) => item.id !== uploadItem.id));
          URL.revokeObjectURL(uploadItem.preview);
          toast.info('Upload cancelled');
        } else {
          setActiveUploads((prev) =>
            prev.map((item) =>
              item.id === uploadItem.id
                ? { ...item, status: 'failed', error: err.message || 'Upload failed' }
                : item
            )
          );
          toast.error(`"${uploadItem.file.name}" failed: ${err.message || 'Upload error'}`);
        }
      }
    },
    [kind, entityId, onChange]
  );

  const processFiles = useCallback(
    async (fileList) => {
      const rawFiles = Array.from(fileList);
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      const remainingSlots = maxFiles - images.length - activeUploadsRef.current.filter((u) => u.status !== 'failed').length;
      if (remainingSlots <= 0) {
        toast.error(`Maximum of ${maxFiles} image${maxFiles > 1 ? 's' : ''} allowed.`);
        return;
      }

      const filesToUpload = rawFiles.slice(0, remainingSlots);
      if (rawFiles.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} more image${remainingSlots > 1 ? 's' : ''} could be added.`);
      }

      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 10 MB limit and cannot be uploaded.`);
          continue;
        }

        if (!validTypes.includes(file.type.toLowerCase())) {
          toast.error(`"${file.name}" is an unsupported format. Only JPEG, PNG, and WebP are allowed.`);
          continue;
        }

        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);
        const abortController = new AbortController();

        const uploadItem = {
          id: uploadId,
          file,
          preview: previewUrl,
          status: 'compressing',
          progress: 0,
          error: null,
          abortController,
        };

        setActiveUploads((prev) => [...prev, uploadItem]);
        executeUpload(uploadItem);
      }
    },
    [images.length, maxFiles, executeUpload]
  );

  // Handle clipboard paste
  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        processFiles(pastedFiles);
      }
    },
    [processFiles]
  );

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      activeUploadsRef.current.forEach((u) => {
        if (u.preview) URL.revokeObjectURL(u.preview);
      });
    };
  }, []);

  const totalCount = images.length + activeUploads.filter((u) => u.status !== 'failed').length;
  const isFull = totalCount >= maxFiles;

  const handleRetry = (uploadItem) => {
    const freshItem = {
      ...uploadItem,
      status: 'compressing',
      progress: 0,
      error: null,
      abortController: new AbortController(),
    };
    setActiveUploads((prev) => prev.map((item) => (item.id === uploadItem.id ? freshItem : item)));
    executeUpload(freshItem);
  };

  const handleCancel = (uploadItem) => {
    if (uploadItem.abortController) {
      uploadItem.abortController.abort();
    }
    setActiveUploads((prev) => prev.filter((item) => item.id !== uploadItem.id));
    URL.revokeObjectURL(uploadItem.preview);
  };

  // Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isFull) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isFull && e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Image Reordering
  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Update order indices
    const reordered = copy.map((img, idx) => ({ ...img, order: idx }));
    onChange(reordered);
  };

  const handleMakePrimary = (index) => {
    if (index === 0) return;
    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.unshift(moved);
    const reordered = copy.map((img, idx) => ({ ...img, order: idx }));
    onChange(reordered);
    toast.success('Primary image updated');
  };

  // Alt Text Edit
  const openAltEditor = (index) => {
    setEditingAltIndex(index);
    setAltInputText(images[index]?.alt || '');
  };

  const saveAltText = () => {
    if (editingAltIndex === null) return;
    const copy = [...images];
    copy[editingAltIndex] = { ...copy[editingAltIndex], alt: altInputText.trim() };
    onChange(copy);
    setEditingAltIndex(null);
    toast.success('Alt text updated');
  };

  // Delete Image
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const { index, image } = deleteCandidate;

    const copy = [...images];
    copy.splice(index, 1);
    const reordered = copy.map((img, idx) => ({ ...img, order: idx }));
    onChange(reordered);
    setDeleteCandidate(null);
    toast.success('Image removed');

    if (image.publicId) {
      try {
        await deleteMediaAsset(image.publicId);
      } catch (err) {
        // Silently handled: the product save will guarantee reconciliation
      }
    }
  };

  // Replace Image — remove existing image at index, then trigger the file picker
  const handleReplaceImage = (index) => {
    const img = images[index];
    // Remove existing image from state
    const copy = [...images];
    copy.splice(index, 1);
    const reordered = copy.map((im, idx) => ({ ...im, order: idx }));
    onChange(reordered);
    // Background cleanup
    if (img?.publicId) {
      deleteMediaAsset(img.publicId).catch(() => {});
    }
    // Track which slot we were replacing so UX is clear, then open picker
    setReplacingIndex(index);
    setTimeout(() => replaceFileInputRef.current?.click(), 50);
  };

  const isUploadingAny = activeUploads.some((u) => u.status === 'uploading' || u.status === 'compressing');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden replace file input */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={false}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            processFiles(e.target.files);
            setReplacingIndex(null);
            e.target.value = '';
          }
        }}
      />

      {/* Header Counter */}
      <div className="flex items-center text-xs">
        <span className="font-semibold text-[#151515]">
          Attached Imagery{' '}
          <span className="font-mono text-[#6B6B6B]">
            ({images.length} of {maxFiles})
          </span>
        </span>
      </div>

      {/* Grid of Images + Uploading Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Existing Images */}
        {images.map((img, idx) => (
          <div
            key={img.publicId || img.url || idx}
            className={`group relative aspect-[3/4] rounded-xl overflow-hidden border bg-[#F6F2EC] transition-all shadow-2xs hover:shadow-sm ${
              idx === 0 ? 'border-[#151515] ring-2 ring-[#151515]/20' : 'border-[#E6E1DA] hover:border-[#151515]'
            }`}
          >
            <img
              src={img.url}
              alt={img.alt || `Product image ${idx + 1}`}
              className="w-full h-full object-cover select-none"
            />

            {/* Top-Right: Replace & Delete buttons (always clearly visible, never clipped) */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={() => handleReplaceImage(idx)}
                className="p-1.5 rounded-lg bg-white/95 hover:bg-[#151515] text-[#151515] hover:text-white border border-[#E6E1DA] shadow-sm transition-colors cursor-pointer"
                title="Replace with another image"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteCandidate({ index: idx, image: img })}
                className="p-1.5 rounded-lg bg-white/95 hover:bg-[#D12C2F] text-[#D12C2F] hover:text-white border border-[#FCEEEE] shadow-sm transition-colors cursor-pointer"
                title="Delete this image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom-Left: Cover Badge / Set Cover Button */}
            <div className="absolute bottom-2 left-2 z-20">
              {idx === 0 ? (
                <div className="px-2 py-0.5 rounded-md bg-[#151515] text-white text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-current text-amber-400" />
                  Cover
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMakePrimary(idx)}
                  title="Set this image as cover"
                  className="px-2 py-0.5 rounded-md bg-white/95 hover:bg-[#151515] text-[#151515] hover:text-white text-[9px] font-bold shadow-sm border border-[#E6E1DA] transition-colors cursor-pointer"
                >
                  Set Cover
                </button>
              )}
            </div>
          </div>
        ))}

        {/* In-Flight Active Uploads */}
        {activeUploads.map((uploadItem) => (
          <div
            key={uploadItem.id}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden border flex flex-col items-center justify-center p-3 text-center bg-[#F6F2EC] ${
              uploadItem.status === 'failed' ? 'border-[#D12C2F] bg-[#FCEEEE]/30' : 'border-[#E6E1DA]'
            }`}
          >
            {/* Background preview with blur */}
            {uploadItem.preview && (
              <img
                src={uploadItem.preview}
                alt="Uploading preview"
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
            )}

            {/* Content overlay */}
            <div className="relative z-10 w-full flex flex-col items-center gap-2">
              {uploadItem.status === 'compressing' && (
                <>
                  <Loader2 className="w-6 h-6 text-[#151515] animate-spin" />
                  <p className="text-[10px] font-semibold text-[#151515]">Compressing...</p>
                </>
              )}

              {uploadItem.status === 'uploading' && (
                <>
                  <Loader2 className="w-7 h-7 text-[#151515] animate-spin" />
                  <button
                    type="button"
                    onClick={() => handleCancel(uploadItem)}
                    className="text-[10px] text-[#6B6B6B] hover:text-[#D12C2F] underline"
                  >
                    Cancel
                  </button>
                </>
              )}

              {uploadItem.status === 'done' && (
                <div className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  Done
                </div>
              )}

              {uploadItem.status === 'failed' && (
                <>
                  <AlertCircle className="w-6 h-6 text-[#D12C2F]" />
                  <p className="text-[10px] font-semibold text-[#D12C2F] line-clamp-2 px-1">
                    {uploadItem.error || 'Upload failed'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => handleRetry(uploadItem)}
                      className="px-2 py-0.5 rounded bg-[#151515] text-white text-[10px] font-semibold hover:bg-black"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(uploadItem)}
                      className="p-1 text-[#6B6B6B] hover:text-[#151515]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Drop Zone & File Picker Button */}
      {!isFull && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            isDragging
              ? 'border-[#D12C2F] bg-[#FCEEEE]/20'
              : 'border-[#E6E1DA] hover:border-[#151515] bg-[#F6F2EC]/40 hover:bg-[#F6F2EC]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                processFiles(e.target.files);
                e.target.value = ''; // Reset input
              }
            }}
          />

          <div className="flex flex-col items-center gap-1.5 pointer-events-none">
            <div className="p-2.5 rounded-full bg-white border border-[#E6E1DA] text-[#151515] shadow-2xs">
              <Upload className="w-4 h-4 text-[#D12C2F]" />
            </div>
            <p className="text-xs font-semibold text-[#151515]">
              Click to upload or drag & drop images
            </p>
            <p className="text-[10px] text-[#6B6B6B]">
              JPEG, PNG, WebP &bull; up to 10 MB each (auto-compressed)
            </p>
          </div>
        </div>
      )}

      {/* Alt Text Modal */}
      {editingAltIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151515]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-serif text-base font-bold text-[#151515]">Edit Image Alt Text</h3>
            <p className="text-xs text-[#6B6B6B]">
              Provide descriptive text for screen readers and search engines.
            </p>
            <input
              type="text"
              autoFocus
              value={altInputText}
              onChange={(e) => setAltInputText(e.target.value)}
              placeholder="e.g. Front view of Crimson Lawn Kurta"
              className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingAltIndex(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={saveAltText}
                className="text-xs font-bold"
              >
                Save Alt Text
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Image Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={confirmDelete}
        title="Remove Product Image?"
        message="Are you sure you want to remove this image? It will be deleted when you save the product."
        confirmText="Yes, Remove"
      />
    </div>
  );
}
