'use client';

import React, { useEffect } from 'react';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Reusable Confirmation Modal
 * Replaces browser's default window.confirm() dialog.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Triggered when Cancel or backdrop clicked
 * @param {Function} props.onConfirm - Triggered when Yes/Confirm button clicked
 * @param {string} [props.title] - Modal title
 * @param {string|React.ReactNode} [props.message] - Modal body text/node
 * @param {string} [props.confirmText] - Label for confirm button (default: "Yes, Delete")
 * @param {string} [props.cancelText] - Label for cancel button (default: "Cancel")
 * @param {string} [props.variant] - 'danger' | 'default' (default: 'danger')
 * @param {boolean} [props.isLoading] - Loading spinner on confirm button
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151515]/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop click */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white border border-[#E6E1DA] rounded-2xl shadow-xl overflow-hidden p-6 z-10 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                variant === 'danger'
                  ? 'bg-[#FCEEEE] text-[#D12C2F]'
                  : 'bg-[#F6F2EC] text-[#151515]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="confirm-modal-title"
                className="font-serif text-lg font-bold text-[#151515]"
              >
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#6B6B6B] leading-relaxed">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E6E1DA]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="text-xs font-semibold px-4"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
            className="text-xs font-bold px-4"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
