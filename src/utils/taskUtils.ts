import { Task, Child } from '../types';

export const getTaskRoutineInfo = (task: Task, child?: Child): { isRoutine: boolean; period?: 'morning' | 'afternoon' | 'evening' | 'general'; label: string } => {
  if (child && child.routines && child.routines.length > 0) {
    for (const routine of child.routines) {
      if (routine.morningTaskIds?.includes(task.id) || (task.template_id && routine.morningTaskIds?.includes(task.template_id))) {
        return { isRoutine: true, period: 'morning', label: 'Morning Routine' };
      }
      if (routine.afternoonTaskIds?.includes(task.id) || (task.template_id && routine.afternoonTaskIds?.includes(task.template_id))) {
        return { isRoutine: true, period: 'afternoon', label: 'Afternoon Routine' };
      }
      if (routine.eveningTaskIds?.includes(task.id) || (task.template_id && routine.eveningTaskIds?.includes(task.template_id))) {
        return { isRoutine: true, period: 'evening', label: 'Evening Routine' };
      }
    }
  }

  // Fallback period detection by title keywords
  const titleLower = task.title.toLowerCase();
  if (titleLower.includes('morning')) return { isRoutine: true, period: 'morning', label: 'Morning Routine' };
  if (titleLower.includes('afternoon')) return { isRoutine: true, period: 'afternoon', label: 'Afternoon Routine' };
  if (titleLower.includes('evening') || titleLower.includes('bedtime')) return { isRoutine: true, period: 'evening', label: 'Evening Routine' };

  return { isRoutine: false, label: '' };
};
