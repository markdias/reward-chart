import React from 'react';
import * as LucideIcons from 'lucide-react';

interface ChildAvatarProps {
  iconName: string;
  className?: string;
  fallbackIcon?: string;
}

export const ChildAvatar: React.FC<ChildAvatarProps> = ({ 
  iconName, 
  className = '', 
  fallbackIcon = 'Smile' 
}) => {
  // Use the provided iconName or fallback if it doesn't exist
  const Icon = (LucideIcons as any)[iconName] || (LucideIcons as any)[fallbackIcon] || LucideIcons.Smile;
  
  return (
    <div className={`flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-full border-2 border-stone-200 dark:border-stone-700 overflow-hidden ${className}`}>
      <Icon className="w-3/5 h-3/5" strokeWidth={2.5} />
    </div>
  );
};
