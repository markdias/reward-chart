import React, { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { Typography } from './Typography';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  selectSize?: 'sm' | 'md';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, className = '', selectSize = 'md', children, ...props }, ref) => {
    const id = useId();
    const selectId = props.id || id;
    
    // We use the same base classes as inputs for consistency
    const selectClass = selectSize === 'sm' ? 'input-field-sm' : 'input-field';
    const errorClass = error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : '';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label htmlFor={selectId}>
            <Typography variant="label">{label}</Typography>
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${selectClass} ${errorClass} appearance-auto`}
          {...props}
        >
          {children}
        </select>
        {(error || helperText) && (
          <Typography variant="helper" className={error ? 'text-rose-500' : ''}>
            {error || helperText}
          </Typography>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
