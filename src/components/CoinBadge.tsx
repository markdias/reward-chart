import React from 'react';
import { Typography } from './ui/Typography';
import { Coins } from 'lucide-react';

export const CoinBadge = ({
  points,
  size, // Deprecated but kept for backwards compatibility in props
  disabled = false,
  iconOnly = false,
  customIcon,
}: {
  points?: number;
  size?: 'sm' | 'md' | 'lg'; // Deprecated
  disabled?: boolean;
  iconOnly?: boolean;
  customIcon?: React.ReactNode;
}) => {
  const label = points !== undefined ? `${points}` : '';

  // Standardized size for all coins
  const currentSize = 'w-10 h-10 sm:w-11 sm:h-11 text-xs sm:text-sm';

  // Determine colors based on disabled state
  const colorClasses = disabled 
    ? 'bg-stone-50 dark:bg-stone-950 text-stone-400 border-stone-200 dark:border-stone-700'
    : 'bg-orange-50 text-orange-500 border-orange-300';

  let content: React.ReactNode = label;
  if (customIcon) content = customIcon;
  else if (iconOnly || points === undefined) content = <Coins className="w-1/2 h-1/2" />;

  return (
    <div className={`flex items-center justify-center rounded-full font-bold border-[1.5px] sm:border-2 shrink-0 ${currentSize} ${colorClasses}`}>
      {content}
    </div>
  );
};
