import React from 'react';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3'
  | 'h4'
  | 'body' 
  | 'label' 
  | 'helper' 
  | 'caption'
  | 'badge'
  | 'number';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  as,
  className = '',
  children,
  ...props
}: TypographyProps) {
  let Component: React.ElementType = as || 'p';
  let baseClasses = '';

  switch (variant) {
    case 'h1':
      baseClasses = 'text-3xl md:text-5xl font-black font-display text-stone-900';
      if (!as) Component = 'h1';
      break;
    case 'h2':
      baseClasses = 'text-xl md:text-2xl font-bold font-display text-stone-900';
      if (!as) Component = 'h2';
      break;
    case 'h3':
      baseClasses = 'text-lg md:text-xl font-bold font-display text-stone-800';
      if (!as) Component = 'h3';
      break;
    case 'h4':
      baseClasses = 'text-base font-bold font-display text-stone-800';
      if (!as) Component = 'h4';
      break;
    case 'body':
      baseClasses = 'text-sm md:text-base font-sans text-stone-600';
      if (!as) Component = 'p';
      break;
    case 'label':
      baseClasses = 'text-2xs font-mono uppercase tracking-widest text-stone-400 font-bold';
      if (!as) Component = 'span';
      break;
    case 'helper':
      baseClasses = 'text-xs font-mono text-stone-500';
      if (!as) Component = 'p';
      break;
    case 'caption':
      baseClasses = 'text-xs font-sans text-stone-500 italic';
      if (!as) Component = 'span';
      break;
    case 'badge':
      baseClasses = 'text-[10px] md:text-xs font-mono uppercase font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full';
      if (!as) Component = 'span';
      break;
    case 'number':
      baseClasses = 'text-lg font-mono font-black tabular-nums text-stone-900';
      if (!as) Component = 'span';
      break;
  }

  const combinedClasses = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
}
