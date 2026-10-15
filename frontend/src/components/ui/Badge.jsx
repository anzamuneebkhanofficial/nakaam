import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-[#F6F2EC] text-[#3A3A3A] border border-[#E6E1DA]',
    red: 'bg-[#FCEEEE] text-[#8F1A1E] border border-transparent font-semibold',
    ink: 'bg-[#151515] text-white border border-transparent',
    outline: 'bg-transparent text-[#6B6B6B] border border-[#E6E1DA]',
    success: 'bg-[#E6F4EA] text-[#137333] border border-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
