import { CheckCircle, BookOpen, Heart, Palette, Target, Smile, HeartHandshake, Sparkles, GraduationCap, Sun } from 'lucide-react';
import React from 'react';
import { TaskCategory } from '../types';

export const CATEGORY_ICON_MAP: Record<TaskCategory, { Icon: React.ElementType; bg: string; iconColor: string; label: string }> = {
  chores: { Icon: CheckCircle, bg: 'bg-indigo-100 border-indigo-200', iconColor: 'text-indigo-600', label: 'Chore' },
  homework: { Icon: BookOpen, bg: 'bg-amber-100 border-amber-200', iconColor: 'text-amber-600', label: 'Homework' },
  health: { Icon: Heart, bg: 'bg-rose-100 border-rose-200', iconColor: 'text-rose-500', label: 'Health' },
  creative: { Icon: Palette, bg: 'bg-purple-100 border-purple-200', iconColor: 'text-purple-600', label: 'Creative' },
  behavior: { Icon: Smile, bg: 'bg-orange-100 border-orange-200', iconColor: 'text-orange-600', label: 'Behavior' },
  kindness: { Icon: HeartHandshake, bg: 'bg-pink-100 border-pink-200', iconColor: 'text-pink-600', label: 'Kindness' },
  manners: { Icon: Sparkles, bg: 'bg-sky-100 border-sky-200', iconColor: 'text-sky-600', label: 'Manners' },
  feelings: { Icon: Heart, bg: 'bg-rose-50 border-rose-100', iconColor: 'text-rose-400', label: 'Feelings' },
  learning: { Icon: GraduationCap, bg: 'bg-purple-100 border-purple-200', iconColor: 'text-purple-600', label: 'Learning' },
  self_care: { Icon: Sun, bg: 'bg-emerald-100 border-emerald-200', iconColor: 'text-emerald-600', label: 'Self-Care' },
  other: { Icon: Target, bg: 'bg-stone-100 border-stone-200', iconColor: 'text-stone-500', label: 'Quest' }
};

export const TASK_CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'chores', label: 'Chore' },
  { id: 'homework', label: 'Homework' },
  { id: 'health', label: 'Health' },
  { id: 'creative', label: 'Creative' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'kindness', label: 'Kindness' },
  { id: 'manners', label: 'Manners' },
  { id: 'feelings', label: 'Feelings' },
  { id: 'learning', label: 'Learning' },
  { id: 'self_care', label: 'Self-Care' },
  { id: 'other', label: 'Other / Quest' }
];

/**
 * Infer category from title if missing or defaulting to 'chores'/'other'
 */
export function inferTaskCategory(title: string, currentCategory?: string): TaskCategory {
  if (currentCategory && currentCategory !== 'chores' && currentCategory !== 'other' && currentCategory in CATEGORY_ICON_MAP) {
    return currentCategory as TaskCategory;
  }

  const lower = title.toLowerCase();

  if (lower.includes('kind') || lower.includes('share') || lower.includes('help friend') || lower.includes('nice to')) {
    return 'kindness';
  }
  if (lower.includes('please') || lower.includes('thank you') || lower.includes('manner') || lower.includes('turn') || lower.includes('apologize')) {
    return 'manners';
  }
  if (lower.includes('feel') || lower.includes('breath') || lower.includes('calm') || lower.includes('emotion')) {
    return 'feelings';
  }
  if (lower.includes('read') || lower.includes('math') || lower.includes('spelling') || lower.includes('word') || lower.includes('learn') || lower.includes('fact')) {
    return 'learning';
  }
  if (lower.includes('teeth') || lower.includes('dress') || lower.includes('hair') || lower.includes('wash') || lower.includes('bath') || lower.includes('shower') || lower.includes('bed time') || lower.includes('wind-down')) {
    return 'self_care';
  }
  if (lower.includes('homework') || lower.includes('pack') || lower.includes('backpack') || lower.includes('school')) {
    return 'homework';
  }
  if (lower.includes('vegetable') || lower.includes('water') || lower.includes('exercise') || lower.includes('outside') || lower.includes('fruit') || lower.includes('healthy')) {
    return 'health';
  }
  if (lower.includes('draw') || lower.includes('sing') || lower.includes('dance') || lower.includes('paint') || lower.includes('instrument') || lower.includes('story') || lower.includes('lego') || lower.includes('blocks')) {
    return 'creative';
  }
  if (lower.includes('listen') || lower.includes('fight') || lower.includes('complaint') || lower.includes('fuss') || lower.includes('patience')) {
    return 'behavior';
  }
  if (lower.includes('bed') || lower.includes('toy') || lower.includes('table') || lower.includes('dish') || lower.includes('trash') || lower.includes('rubbish') || lower.includes('bin') || lower.includes('laundry') || lower.includes('fold') || lower.includes('vacuum') || lower.includes('sweep') || lower.includes('clean') || lower.includes('tidy') || lower.includes('pet') || lower.includes('feed') || lower.includes('car')) {
    return 'chores';
  }

  return (currentCategory as TaskCategory) || 'chores';
}
