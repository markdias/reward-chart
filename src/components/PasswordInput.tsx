import React, { useState } from 'react';
import { Typography } from './ui/Typography';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { evaluatePassword } from '../utils/security';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPolicy?: boolean;
}

export function PasswordInput({ value, onChange, placeholder = "••••••••", className = "", showPolicy = false }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { policy, strength } = evaluatePassword(value);

  const getStrengthColor = () => {
    if (value.length === 0) return 'bg-stone-200';
    if (strength < 5) return 'bg-rose-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (value.length === 0) return 'Strength';
    if (strength < 5) return 'Weak';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl pr-10 ${className}`}
        />
        <Button
          variant="none"
          size="none"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {showPolicy && (
        <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-100">
          <div className="flex items-center justify-between text-xs font-sans font-bold uppercase tracking-widest text-stone-500 mb-2">
            <span>Password Strength:</span>
            <span className={strength === 5 ? 'text-emerald-600' : (strength >= 3 ? 'text-amber-600' : 'text-rose-600')}>
              {getStrengthLabel()}
            </span>
          </div>
          
          <div className="flex gap-1 h-1.5 mb-3">
            <div className={`flex-1 rounded-full ${value.length > 0 ? getStrengthColor() : 'bg-stone-200'}`} />
            <div className={`flex-1 rounded-full ${strength >= 2 ? getStrengthColor() : 'bg-stone-200'}`} />
            <div className={`flex-1 rounded-full ${strength >= 3 ? getStrengthColor() : 'bg-stone-200'}`} />
            <div className={`flex-1 rounded-full ${strength >= 4 ? getStrengthColor() : 'bg-stone-200'}`} />
            <div className={`flex-1 rounded-full ${strength === 5 ? getStrengthColor() : 'bg-stone-200'}`} />
          </div>

          <div className="grid grid-cols-1 gap-1 text-[10px] font-sans font-medium text-stone-500">
            <div className={`flex items-center gap-2 ${policy.minLength ? 'text-emerald-600' : ''}`}>
              {policy.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              At least 8 characters
            </div>
            <div className={`flex items-center gap-2 ${policy.hasUpper ? 'text-emerald-600' : ''}`}>
              {policy.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              One uppercase letter
            </div>
            <div className={`flex items-center gap-2 ${policy.hasLower ? 'text-emerald-600' : ''}`}>
              {policy.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              One lowercase letter
            </div>
            <div className={`flex items-center gap-2 ${policy.hasNumber ? 'text-emerald-600' : ''}`}>
              {policy.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              One number
            </div>
            <div className={`flex items-center gap-2 ${policy.hasSpecial ? 'text-emerald-600' : ''}`}>
              {policy.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              One special character
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
