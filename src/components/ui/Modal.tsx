import React, { useEffect } from 'react';
import { Card } from './Card';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  isDashboardCard?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  className = '', 
  isDashboardCard = false 
}: ModalProps) {
  
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
        className="w-full max-w-sm md:max-w-md w-full animate-in fade-in zoom-in-95 duration-200 touch-target"
        onClick={(e) => e.stopPropagation()}
      >
        <Card isDashboardCard={isDashboardCard} className={`shadow-xl ${className}`}>
          {children}
        </Card>
      </div>
    </div>
  );
}
