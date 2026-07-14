import React from 'react';
import { LucideIcon } from 'lucide-react';

export type StackedIconVariant = 'primary' | 'danger' | 'success' | 'neutral' | 'info' | 'warning';

export interface StackedIconButtonProps {
  icon: LucideIcon;
  label: string;
  variant?: StackedIconVariant;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const variantStyles: Record<StackedIconVariant, { circle: string, textHover: string }> = {
  primary: {
    circle: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
    textHover: 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400',
  },
  danger: {
    circle: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
    textHover: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
  },
  success: {
    circle: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
    textHover: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
  },
  info: {
    circle: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white',
    textHover: 'group-hover:text-sky-500 dark:group-hover:text-sky-400',
  },
  warning: {
    circle: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
    textHover: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
  },
  neutral: {
    circle: 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-stone-500 group-hover:text-white',
    textHover: 'group-hover:text-stone-500 dark:group-hover:text-stone-400',
  }
};

export function StackedIconButton({
  icon: Icon,
  label,
  variant = 'primary',
  onClick,
  className = '',
  disabled = false,
}: StackedIconButtonProps) {
  const styles = variantStyles[variant];

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 group active:scale-95 transition-transform focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all flex items-center justify-center shadow-sm group-hover:shadow-lg ${styles.circle}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className={`text-[9px] sm:text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest transition-colors ${styles.textHover}`}>
        {label}
      </span>
    </button>
  );
}
