import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151515] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#D12C2F] text-white hover:bg-[#B32226] active:bg-[#991B1F] shadow-sm',
      secondary:
        'bg-[#151515] text-white hover:bg-[#2A2A2A] active:bg-[#000000]',
      outline:
        'bg-white text-[#151515] border border-[#E6E1DA] hover:bg-[#F6F2EC] active:bg-[#EFEAE2]',
      ghost:
        'bg-transparent text-[#151515] hover:bg-[#EFEAE2] active:bg-[#E5DFD5]',
      destructive:
        'bg-[#BA1A1A] text-white hover:bg-[#93000A]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs rounded-[8px]',
      default: 'h-12 px-6 text-sm rounded-[12px]',
      lg: 'h-13 px-8 text-base rounded-[12px]',
      icon: 'h-10 w-10 p-0 rounded-[10px]',
    };

    const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        className: cn(combinedClassName, children.props.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
