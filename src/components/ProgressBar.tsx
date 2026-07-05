import React from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';

export const LinearProgressBar = ({
  progress,
  heightClass = 'h-2',
  className = '',
}: {
  progress: number;
  heightClass?: string;
  className?: string;
}) => {
  const boundedProgress = Math.min(100, Math.max(0, progress || 0));
  
  return (
    <div className={`w-full ${heightClass} rounded-full overflow-hidden border border-stone-200 bg-stone-100 ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${boundedProgress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500"
      />
    </div>
  );
};

export const CircularProgressBar = ({
  progress,
  className = '',
  children,
}: {
  progress: number;
  className?: string;
  children?: React.ReactNode;
}) => {
  const boundedProgress = Math.min(100, Math.max(0, progress || 0));

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 36 36">
        <path
          className="text-stone-100"
          strokeWidth="3"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <motion.path
          className="text-amber-400"
          strokeWidth="3"
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          initial={{ strokeDasharray: `0, 100` }}
          animate={{ strokeDasharray: `${boundedProgress}, 100` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
