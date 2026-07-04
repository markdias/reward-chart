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

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'none';

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
    // Playful Sticker Base Classes
    const isSticker = variant !== 'none';
    const baseClasses = isSticker 
      ? 'transition-transform hover:-translate-y-1 active:translate-y-0 shadow-lg font-black' 
      : 'transition-colors active:scale-95 font-bold';

    // Base classes based on variant using Tailwind v4 theme colors
    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses = 'bg-primary text-white';
        break;
      case 'secondary':
        variantClasses = 'bg-surface border-2 border-neutral-border text-dark';
        break;
      case 'danger':
        variantClasses = 'bg-danger text-white';
        break;
      case 'info':
        variantClasses = 'bg-info text-white';
        break;
      case 'purple':
        variantClasses = 'bg-accent-purple text-white';
        break;
      case 'warning':
        variantClasses = 'bg-warning text-dark';
        break;
      case 'dark':
        variantClasses = 'bg-dark text-white';
        break;
      case 'ghost':
        variantClasses = 'bg-transparent hover:bg-stone-100 text-stone-600';
        break;
      case 'outline':
        variantClasses = 'bg-transparent hover:bg-stone-50 border-2 border-stone-300 text-stone-600';
        break;
      case 'none':
        variantClasses = '';
        break;
    }

    // Size classes
    let sizeClasses = '';
    switch (size) {
      case 'sm':
        if (!['icon', 'none'].includes(size)) sizeClasses = 'text-xs px-4 py-2 rounded-xl';
        break;
      case 'md':
        if (!['icon', 'none'].includes(size)) sizeClasses = 'text-sm px-6 py-3 rounded-2xl';
        break;
      case 'lg':
        if (!['icon', 'none'].includes(size)) sizeClasses = 'text-lg px-8 py-4 rounded-3xl';
        break;
      case 'icon':
        sizeClasses = 'p-2 rounded-xl';
        break;
      case 'none':
        sizeClasses = '';
        break;
    }

    const widthClass = fullWidth ? 'w-full flex justify-center' : 'inline-flex justify-center';
    const disabledClass = disabled || isLoading ? 'opacity-70 cursor-not-allowed pointer-events-none' : '';

    const combinedClasses = [
      `btn-${variant}`,
      variantClasses,
      sizeClasses,
      widthClass,
      disabledClass,
      baseClasses,
      'items-center gap-2 uppercase tracking-wider',
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
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
