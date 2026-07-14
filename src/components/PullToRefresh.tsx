import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  
  const pullStartY = useRef(0);
  const pullMoveY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const MAX_PULL = 100;
  const THRESHOLD = 70;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    // Only allow pull to refresh if at the very top of the scroll container
    if (contentRef.current && contentRef.current.scrollTop > 5) return;
    
    pullStartY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    pullMoveY.current = e.touches[0].clientY;
    const yDiff = pullMoveY.current - pullStartY.current;
    
    if (yDiff > 0 && (!contentRef.current || contentRef.current.scrollTop <= 5)) {
      // Prevent default scroll behavior while pulling down on iOS
      if (e.cancelable) {
        e.preventDefault();
      }
      const progress = Math.min(yDiff * 0.4, MAX_PULL);
      setPullProgress(progress);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return;
    
    setIsPulling(false);
    
    if (pullProgress >= THRESHOLD) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
      }
    } else {
      // Snap back
      setPullProgress(0);
    }
  };

  // Prevent default body scroll when pulling to prevent iOS overscroll
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isPulling) {
        e.preventDefault();
      }
    };
    
    // Add non-passive listener to document
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventDefault);
    };
  }, [isPulling]);

  return (
    <div 
      className="relative w-full h-full flex flex-col"
    >
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
        style={{ height: `${MAX_PULL}px` }}
      >
        <motion.div
          animate={{
            opacity: (pullProgress > 10 || isRefreshing) ? 1 : 0,
            scale: (pullProgress > 10 || isRefreshing) ? 1 : 0.8,
            rotate: isRefreshing ? 360 : (pullProgress / THRESHOLD) * 180,
            y: isRefreshing ? THRESHOLD / 2 : (pullProgress > 0 ? pullProgress / 2 : 0)
          }}
          transition={{
            rotate: isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.1 },
            y: { type: 'spring', bounce: 0, duration: 0.2 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 }
          }}
          className="bg-white shadow-md p-2.5 rounded-full text-indigo-500 absolute top-[-50px]"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        ref={contentRef}
        className="flex-1 w-full h-full overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        animate={{ 
          y: isRefreshing ? THRESHOLD / 2 : pullProgress / 2 
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
