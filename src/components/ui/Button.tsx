import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Typography } from '../ui/Typography';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'info' 
  | 'purple' 
  | 'warning' 
  | 'dark'
  | 'ghost'
  | 'outline'
  | 'none';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'none';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Native iOS Base Classes
    const baseClasses = variant !== 'none' 
      ? 'transition-opacity active:opacity-60 font-semibold' 
      : '';

    const iosFont = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

    // Base classes based on variant (Native iOS theme)
    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses = 'bg-[#007AFF] text-white active:bg-[#005bb5] active:opacity-100 transition-colors';
        break;
      case 'secondary':
        variantClasses = 'bg-[#E5E5EA] dark:bg-[#1C1C1E] text-black dark:text-white';
        break;
      case 'danger':
        variantClasses = 'bg-[#FF3B30] text-white active:bg-[#c92a22] active:opacity-100 transition-colors';
        break;
      case 'info':
        variantClasses = 'bg-[#5AC8FA] text-white active:bg-[#47a1c9] active:opacity-100 transition-colors';
        break;
      case 'purple':
        variantClasses = 'bg-[#AF52DE] text-white active:bg-[#8e42b5] active:opacity-100 transition-colors';
        break;
      case 'warning':
        variantClasses = 'bg-[#FF9500] text-white active:bg-[#cc7700] active:opacity-100 transition-colors';
        break;
      case 'dark':
        variantClasses = 'bg-black text-white dark:bg-white dark:text-black';
        break;
      case 'ghost':
        variantClasses = 'bg-transparent text-[#007AFF]';
        break;
      case 'outline':
        variantClasses = 'bg-transparent border-[1.5px] border-[#E5E5EA] dark:border-[#38383A] text-black dark:text-white';
        break;
      case 'none':
        variantClasses = '';
        break;
    }

    // Size classes (iOS Standard rounded)
    let sizeClasses = '';
    switch (size) {
      case 'sm':
        if (!['icon', 'icon-sm', 'none'].includes(size)) sizeClasses = 'text-[13px] px-4 py-2 rounded-[10px]';
        break;
      case 'md':
        if (!['icon', 'icon-sm', 'none'].includes(size)) sizeClasses = 'text-[17px] leading-[22px] px-6 py-2.5 rounded-[14px]';
        break;
      case 'lg':
        if (!['icon', 'icon-sm', 'none'].includes(size)) sizeClasses = 'text-[17px] leading-[22px] px-8 py-3.5 rounded-[14px]';
        break;
      case 'icon':
        sizeClasses = 'p-2.5 rounded-[12px] touch-target';
        break;
      case 'icon-sm':
        sizeClasses = 'p-1.5 rounded-[10px] touch-target';
        break;
      case 'none':
        sizeClasses = '';
        break;
    }

    const widthClass = fullWidth 
      ? `w-full flex ${variant !== 'none' ? 'justify-center' : ''}`
      : (variant !== 'none' ? 'inline-flex justify-center' : '');
    const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const combinedClasses = [
      `btn-${variant}`,
      variantClasses,
      sizeClasses,
      widthClass,
      disabledClass,
      baseClasses,
      variant !== 'none' ? 'items-center gap-2' : 'items-center',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#007AFF]',
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
        style={variant !== 'none' ? { ...iosFont, ...(props.style || {}) } : props.style}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="shrink-0 flex items-center justify-center">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0 flex items-center justify-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
