import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isDashboardCard?: boolean;
  className?: string;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  isDashboardCard = false,
  ...props
}: CardProps) {
  let paddingClass = '';
  switch (padding) {
    case 'none': paddingClass = 'p-0'; break;
    case 'sm': paddingClass = 'p-4'; break;
    case 'md': paddingClass = 'p-6'; break;
    case 'lg': paddingClass = 'p-8'; break;
  }

  // Base card styling
  // 'card-panel' is defined in index.css
  // 'dashboard-card' is used as a hook for the playful_pop theme overrides
  const baseClasses = `card-panel ${isDashboardCard ? 'dashboard-card' : ''}`;
  
  const combinedClasses = [baseClasses, paddingClass, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}
