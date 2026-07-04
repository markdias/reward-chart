import { CheckCircle, BookOpen, Heart, Palette, Target, Smile } from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, { Icon: React.ElementType; bg: string; iconColor: string; label: string }> = {
  chores: { Icon: CheckCircle, bg: 'bg-indigo-100 border-indigo-200', iconColor: 'text-indigo-600', label: 'Chore' },
  homework: { Icon: BookOpen, bg: 'bg-emerald-100 border-emerald-200', iconColor: 'text-emerald-600', label: 'Homework' },
  health: { Icon: Heart, bg: 'bg-rose-100 border-rose-200', iconColor: 'text-rose-500', label: 'Health' },
  creative: { Icon: Palette, bg: 'bg-purple-100 border-purple-200', iconColor: 'text-purple-600', label: 'Creative' },
  behavior: { Icon: Smile, bg: 'bg-amber-100 border-amber-200', iconColor: 'text-amber-500', label: 'Behavior' },
  other: { Icon: Target, bg: 'bg-stone-100 border-stone-200', iconColor: 'text-stone-500', label: 'Quest' }
};
