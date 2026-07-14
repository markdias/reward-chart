import React, { useEffect } from 'react';
import { Card } from './Card';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  isDashboardCard?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  className = '', 
  isDashboardCard = false,
  maxWidth = 'md',
  padding = 'md'
}: ModalProps) {
  
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  }[maxWidth];
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`w-full ${maxWidthClass} w-full animate-in fade-in zoom-in-95 duration-200 touch-target`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card padding={padding} isDashboardCard={isDashboardCard} className={`shadow-xl ${className}`}>
          {children}
        </Card>
      </div>
    </div>
  );
}
