import React, { InputHTMLAttributes, forwardRef, useId } from 'react';
import { Typography } from './Typography';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  inputSize?: 'sm' | 'md';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', inputSize = 'md', ...props }, ref) => {
    const id = useId();
    const inputId = props.id || id;
    
    const inputClass = inputSize === 'sm' ? 'input-field-sm' : 'input-field';
    const errorClass = error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : '';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label htmlFor={inputId}>
            <Typography variant="label">{label}</Typography>
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${inputClass} ${errorClass}`}
          {...props}
        />
        {(error || helperText) && (
          <Typography variant="helper" className={error ? 'text-rose-500' : ''}>
            {error || helperText}
          </Typography>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
