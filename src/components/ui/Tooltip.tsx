import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export const Tooltip = ({ 
  children, 
  content,
  position = 'bottom',
  align = 'center'
}: { 
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
      default:
        return 'top-full mt-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return '-bottom-1 border-t-stone-800';
      case 'bottom':
      default:
        return '-top-1 border-b-stone-800';
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'left':
        return 'left-0';
      case 'right':
        return 'right-0';
      case 'center':
      default:
        return 'left-1/2 -translate-x-1/2';
    }
  };

  const getArrowAlignClasses = () => {
    switch (align) {
      case 'left':
        return 'left-4';
      case 'right':
        return 'right-4';
      case 'center':
      default:
        return 'left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${getPositionClasses()} ${getAlignClasses()} px-3 py-1.5 bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none`}
          >
            {content}
            <div className={`absolute border-4 border-transparent ${getArrowClasses()} ${getArrowAlignClasses()}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
