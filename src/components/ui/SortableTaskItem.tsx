import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Task } from '../../types';

interface SortableTaskItemProps {
  id: string;
  task: Task;
  onRemove: (id: string) => void;
}

export function SortableTaskItem({ id, task, onRemove }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex justify-between items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-2 sm:p-3 rounded-xl mb-2 ${isDragging ? 'shadow-lg scale-[1.02]' : 'shadow-sm'}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-grab active:cursor-grabbing touch-none p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-stone-700 dark:text-stone-200 truncate">{task.title}</span>
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(task.id);
        }} 
        className="p-2 text-stone-300 hover:text-rose-500 transition-colors ml-2 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
