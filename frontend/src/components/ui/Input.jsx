'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(
  ({ className, type = 'text', error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';

    const inputType = isPasswordField
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          <input
            type={inputType}
            className={cn(
              'flex h-12 w-full rounded-[12px] border border-[#E6E1DA] bg-white px-4 py-2 text-sm text-[#151515] placeholder:text-[#9A9A9A]',
              'transition-colors focus-visible:border-[#151515] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#151515]',
              'disabled:cursor-not-allowed disabled:bg-[#F6F2EC] disabled:opacity-50',
              isPasswordField && 'pr-12',
              error && 'border-[#BA1A1A] focus-visible:border-[#BA1A1A] focus-visible:ring-[#BA1A1A]',
              className
            )}
            ref={ref}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={props.disabled}
              aria-pressed={showPassword}
              className="absolute right-3.5 p-1 rounded-md text-[#6B6B6B] hover:text-[#151515] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151515] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer select-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#BA1A1A] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
