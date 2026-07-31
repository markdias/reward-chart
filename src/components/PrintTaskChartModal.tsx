import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Printer, Camera, CheckSquare, Layers, Sun, CloudSun, Moon,
  ClipboardList, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';
import { ChildAvatar } from './ChildAvatar';
import { playSound } from '../utils/sound';
import { Task, TaskCompletion, Child, Routine } from '../types';

interface PrintTaskChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  completions: TaskCompletion[];
  childrenList: Child[];
}

type Step = 1 | 2 | 3 | 4;

export function PrintTaskChartModal({
  isOpen,
  onClose,
  tasks,
  completions,
  childrenList
}: PrintTaskChartModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [printMode, setPrintMode] = useState<'live' | 'blank'>('blank');
  const [printRoutinePeriod, setPrintRoutinePeriod] = useState<'all_routines' | 'morning' | 'afternoon' | 'evening' | 'all_tasks'>('all_routines');

  const weekOffset = 0; // Hardcoded to This Week (7 days)
  const activeChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];

  const getMondayOfWeek = (offset: number): Date => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
    const mon = new Date(today.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    return mon;
  };

  const formatWeekRange = (monday: Date): string => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${fmt(monday)} – ${fmt(sunday)}`;
  };

  const formatDateKey = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getRoutineForType = (child: Child, type: 'weekday' | 'weekend' | 'holiday'): Routine | undefined => {
    const currentRoutines = child.routines || [];
    let routine = currentRoutines.find(r => r.id === type);
    if (!routine) {
      routine = currentRoutines.find(r => r.name?.toLowerCase().includes(type));
    }
    if (!routine && type === 'weekday' && currentRoutines.length > 0) {
      const DEFAULT_ROUTINES = ['weekday', 'weekend', 'holiday'];
      const unassigned = currentRoutines.find(r => !DEFAULT_ROUTINES.some(d => r.id === d || r.name?.toLowerCase().includes(d)));
      if (unassigned) routine = unassigned;
    }
    return routine;
  };

  const isTaskInSpecificRoutine = (task: Task, routine?: Routine): boolean => {
    if (!routine) return false;
    const ids = [
      ...(routine.morningTaskIds || []),
      ...(routine.afternoonTaskIds || []),
      ...(routine.eveningTaskIds || [])
    ];
    return ids.includes(task.id) || (task.template_id ? ids.includes(task.template_id) : false);
  };

  const getTaskPeriodInSpecificRoutine = (task: Task, routine?: Routine): 'morning' | 'afternoon' | 'evening' | null => {
    if (!routine) return null;
    const tid = task.template_id;
    if (routine.morningTaskIds?.includes(task.id) || (tid && routine.morningTaskIds?.includes(tid))) return 'morning';
    if (routine.afternoonTaskIds?.includes(task.id) || (tid && routine.afternoonTaskIds?.includes(tid))) return 'afternoon';
    if (routine.eveningTaskIds?.includes(task.id) || (tid && routine.eveningTaskIds?.includes(tid))) return 'evening';
    return null;
  };

  const buildPrintTasks = (): Task[] => {
    if (!activeChild) return [];

    let filteredTasks = (tasks || []).filter(t =>
      (t.child_id === activeChild.id || t.child_id === 'all') &&
      t.child_id !== 'directory' &&
      t.is_template !== true &&
      t.is_active !== false
    );

    const weekdayRoutine = getRoutineForType(activeChild, activeChild.holiday_mode ? 'holiday' : 'weekday');
    const weekendRoutine = getRoutineForType(activeChild, 'weekend');

    if (printRoutinePeriod === 'all_tasks') {
      filteredTasks = filteredTasks.filter(task => {
        const inWeekday = isTaskInSpecificRoutine(task, weekdayRoutine);
        const inWeekend = isTaskInSpecificRoutine(task, weekendRoutine);
        return !inWeekday && !inWeekend;
      });
    } else if (printRoutinePeriod === 'all_routines') {
      filteredTasks = filteredTasks.filter(task => {
        const inWeekday = isTaskInSpecificRoutine(task, weekdayRoutine);
        const inWeekend = isTaskInSpecificRoutine(task, weekendRoutine);
        return inWeekday || inWeekend;
      });
    } else {
      filteredTasks = filteredTasks.filter(task => {
        const weekdayPeriod = getTaskPeriodInSpecificRoutine(task, weekdayRoutine);
        const weekendPeriod = getTaskPeriodInSpecificRoutine(task, weekendRoutine);
        return weekdayPeriod === printRoutinePeriod || weekendPeriod === printRoutinePeriod;
      });
    }

    return filteredTasks;
  };

  const buildPrintDays = (): Date[] => {
    const monday = getMondayOfWeek(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const getWeekLabel = (date: Date): string => {
    const yr = date.getFullYear();
    const startOfYear = new Date(yr, 0, 1);
    const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${yr}-W${String(weekNum).padStart(2, '0')}`;
  };

  const getTaskPeriod = (task: Task): 'morning' | 'afternoon' | 'evening' | 'general' => {
    if (!activeChild) return 'general';
    const weekdayRoutine = getRoutineForType(activeChild, activeChild.holiday_mode ? 'holiday' : 'weekday');
    const weekendRoutine = getRoutineForType(activeChild, 'weekend');

    const wp = getTaskPeriodInSpecificRoutine(task, weekdayRoutine);
    if (wp) return wp;

    const wep = getTaskPeriodInSpecificRoutine(task, weekendRoutine);
    if (wep) return wep;

    return 'general';
  };

  const handleExecutePrint = () => {
    playSound.click();
    
    if (!activeChild) return;

    const printTasks = buildPrintTasks();
    const printDays = buildPrintDays();
    const isBlank = printMode === 'blank';
    const childName = activeChild.name;
    const weekLabel = getWeekLabel(printDays[0]);
    const chartId = `${childName.toUpperCase().replace(/\s+/g, '-')}-${weekLabel}`;

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = formatDateKey(new Date());

    const compLookup = new Map<string, string>();
    if (!isBlank) {
      completions.forEach(c => {
        if (c.child_id === activeChild.id) {
          const dk = formatDateKey(new Date(c.completed_at));
          compLookup.set(`${c.task_id}_${dk}`, c.status);
        }
      });
    }

    const hollowStar = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const filledStar = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

    const colHeaders = dayNames
      .map((day, i) => {
        const date = printDays[i];
        const dateStr = formatDateKey(date);
        const isToday = dateStr === todayStr;
        return `<th style="text-align:center;padding:12px 4px;font-size:12px;color:${isToday ? '#7c3aed' : '#4b5563'};font-weight:900;min-width:56px;">
          ${day}${!isBlank ? `<br/><span style="font-size:11px;font-weight:700">${date.getDate()}</span>` : ''}
        </th>`;
      }).join('');

    const weekdayRoutine = getRoutineForType(activeChild, activeChild.holiday_mode ? 'holiday' : 'weekday');
    const weekendRoutine = getRoutineForType(activeChild, 'weekend');

    const renderTaskCells = (task: Task, index: number) => {
      const cells = printDays.map((date, dayIdx) => {
        const dk = formatDateKey(date);
        const status = compLookup.get(`${task.id}_${dk}`);
        const star = (!isBlank && status === 'approved') ? filledStar : hollowStar;

        // Schedule mapping: weekday vs weekend
        const isWeekendDay = dayIdx === 5 || dayIdx === 6;
        const isWeekdayDay = !isWeekendDay;

        const isTaskInWeekday = isTaskInSpecificRoutine(task, weekdayRoutine);
        const isTaskInWeekend = isTaskInSpecificRoutine(task, weekendRoutine);

        let isActiveDay = true;
        if (isTaskInWeekday && !isTaskInWeekend) {
          isActiveDay = isWeekdayDay;
        } else if (isTaskInWeekend && !isTaskInWeekday) {
          isActiveDay = isWeekendDay;
        }

        if (isActiveDay) {
          return `<td style="text-align:center;padding:8px 3px;border-left:1px dashed #e7e5e4;">${star}</td>`;
        } else {
          return `<td style="text-align:center;padding:8px 3px;border-left:1px dashed #e7e5e4;background:#fafaf9;color:#e7e5e4;font-size:16px;font-weight:bold;">—</td>`;
        }
      }).join('');

      const bg = index % 2 === 0 ? '#ffffff' : '#faf5ff';
      return `<tr style="background:${bg};border-bottom:1px solid #f5f5f4;">
        <td style="padding:10px 14px;font-size:14px;font-weight:800;color:#1c1917;min-width:140px;max-width:180px;white-space:normal;word-break:break-word;">
          <span style="display:inline-flex;align-items:center;justify-content:center;background:#fffbeb;color:#d97706;font-size:10px;font-weight:800;width:24px;height:24px;border:2px solid #fcd34d;border-radius:50%;margin-bottom:6px;">${task.points}</span><br/>
          ${task.title}
        </td>
        ${cells}
      </tr>`;
    };

    let tableBodyHtml = '';
    if (printRoutinePeriod === 'all_routines') {
      const periods: { key: 'morning' | 'afternoon' | 'evening'; label: string }[] = [
        { key: 'morning', label: 'Morning Routine' },
        { key: 'afternoon', label: 'Afternoon Routine' },
        { key: 'evening', label: 'Evening Routine' }
      ];

      let totalTasksCount = 0;
      periods.forEach(p => {
        const periodTasks = printTasks.filter(t => getTaskPeriod(t) === p.key);

        if (periodTasks.length > 0) {
          totalTasksCount += periodTasks.length;
          tableBodyHtml += `<tr style="background:#f3f4f6;border-bottom:2px solid #e7e5e4;">
            <td colspan="${printDays.length + 1}" style="padding:10px 14px;font-size:12px;font-weight:900;color:#374151;text-transform:uppercase;letter-spacing:0.05em;text-align:left;">
              ${p.label}
            </td>
          </tr>`;

          periodTasks.forEach((task, index) => {
            tableBodyHtml += renderTaskCells(task, index);
          });
        }
      });

      if (totalTasksCount === 0) {
        tableBodyHtml = `<tr><td colspan="${printDays.length + 1}" style="text-align:center;padding:32px;color:#a8a29e;font-size:13px;">No routine chores match the selected filters.</td></tr>`;
      }
    } else {
      const taskRows = printTasks.map((task, index) => renderTaskCells(task, index)).join('');
      const noTasksRow = printTasks.length === 0
        ? `<tr><td colspan="${printDays.length + 1}" style="text-align:center;padding:32px;color:#a8a29e;font-size:13px;">No chores match the selected filters.</td></tr>`
        : '';
      tableBodyHtml = taskRows + noTasksRow;
    }

    const routineLabel = printRoutinePeriod === 'all_tasks' 
      ? 'Chore Chart' 
      : activeChild.holiday_mode 
      ? 'Holiday Routine Chart' 
      : 'Weekly Routine Chart';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${childName}'s ${routineLabel} — ${chartId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: landscape; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; color: #1c1917; }
    .header { 
      display: flex; align-items: center; justify-content: space-between; 
      padding: 16px 24px; 
      background: linear-gradient(135deg, #a78bfa, #8b5cf6);
      border-radius: 16px;
      margin-bottom: 20px; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      color: white;
    }
    .header-title { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; }
    .header-sub { font-size: 13px; font-weight: 700; opacity: 0.9; margin-top: 4px; }
    .header-logo { font-size: 12px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 99px; }
    
    .table-container {
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid #e7e5e4;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f3f4f6; border-bottom: 2px solid #e7e5e4; }
    th:first-child { text-align: left; padding: 12px 14px; font-size: 13px; color: #4b5563; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr:last-child { border-bottom: none; }
    
    .footer { margin-top: 24px; display: flex; align-items: center; justify-content: space-between; }
    .footer-instruction { font-size: 13px; color: #6b7280; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .footer-id { font-size: 10px; color: #d1d5db; font-weight: 800; letter-spacing: 0.05em; font-family: monospace; }
    
    #print-wrapper { padding: 1.2cm 1cm; }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .table-container { border: 2px solid #e7e5e4; }
      #print-wrapper {
        width: 100vw;
        padding: 1.2cm 1cm;
        transform-origin: top left;
      }
    }
  </style>
</head>
<body>
  <div id="print-wrapper">
  <div class="header">
    <div>
      <div class="header-title">${childName}'s ${routineLabel}</div>
      <div class="header-sub">${isBlank ? 'Reusable — Fill in the week yourself' : printDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' – ' + printDays[printDays.length - 1].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
    <div class="header-logo">Quest Sync</div>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:12px 14px;font-size:12px;color:#4b5563;font-weight:900;text-transform:uppercase;">Chore</th>
          ${colHeaders}
        </tr>
      </thead>
      <tbody>
        ${tableBodyHtml}
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    <div class="footer-instruction">🎨 Colour in each star when you finish a chore! &nbsp; Ask a grown-up to scan this chart.</div>
    <div class="footer-id">Chart: ${chartId}</div>
  </div>
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      onClose();
    } else {
      alert("Please allow popups to print charts.");
    }
  };

  const handleClose = () => {
    playSound.click();
    setStep(1);
    onClose();
  };

  if (!childrenList || childrenList.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md pointer-events-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              {/* Header Icon & Title */}
              <div className="flex items-start justify-between mb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <Typography variant="h2" className="text-base font-black">
                      Print Chore Chart
                    </Typography>
                    <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {step === 1 ? 'Choose child' : step === 2 ? 'Choose style' : step === 3 ? 'Select routine' : 'Print preview'}
                    </Typography>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1.5 pt-1 pb-3 shrink-0">
                {([1, 2, 3, 4] as const).map(s => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-purple-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                  />
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
                
                {/* Step 1: Choose Child */}
                {step === 1 && (
                  <div className="space-y-4 pt-1">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Which child is this chart for?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {childrenList.map(child => (
                        <button
                          key={child.id}
                          onClick={() => { playSound.click(); setSelectedChildId(child.id); }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            child.id === selectedChildId
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-md'
                              : 'border-stone-200 dark:border-stone-700 hover:border-purple-300'
                          }`}
                        >
                          <ChildAvatar iconName={child.avatar_url || 'Smile'} className="w-12 h-12 rounded-2xl" />
                          <span className="text-sm font-extrabold text-stone-800 dark:text-stone-100">{child.name}</span>
                          {child.id === selectedChildId && <Check className="w-4 h-4 text-purple-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Choose Style */}
                {step === 2 && (
                  <div className="space-y-4 pt-1">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Choose your chart style:</p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => { playSound.click(); setPrintMode('live'); }}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3 ${
                          printMode === 'live'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 hover:border-purple-300 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <Camera className={`w-5 h-5 shrink-0 mt-0.5 ${printMode === 'live' ? 'text-purple-500' : 'text-stone-400'}`} />
                        <div>
                          <p className="font-extrabold text-sm text-stone-800 dark:text-stone-100 font-sans">Live Chart (with Dates)</p>
                          <p className="text-xs mt-1 font-medium text-stone-500 dark:text-stone-400 leading-normal">
                            Prints calendar dates and completed stars.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { playSound.click(); setPrintMode('blank'); }}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3 ${
                          printMode === 'blank'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 hover:border-purple-300 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <CheckSquare className={`w-5 h-5 shrink-0 mt-0.5 ${printMode === 'blank' ? 'text-purple-500' : 'text-stone-400'}`} />
                        <div>
                          <p className="font-extrabold text-sm text-stone-800 dark:text-stone-100 font-sans">Blank / Reusable Template</p>
                          <p className="text-xs mt-1 font-medium text-stone-500 dark:text-stone-400 leading-normal">
                            Generic headers, empty stars — perfect for colouring!
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Select Routine */}
                {step === 3 && (
                  <div className="space-y-4 pt-1">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Select routines or tasks to include:</p>
                    <div className="space-y-3">
                      {/* Row 1: All Routines */}
                      <div>
                        <button
                          type="button"
                          onClick={() => { playSound.click(); setPrintRoutinePeriod('all_routines'); }}
                          className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            printRoutinePeriod === 'all_routines'
                              ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                              : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                          <span>All Routines (Morning, Afternoon & Evening)</span>
                        </button>
                      </div>

                      {/* Row 2: Individual Routines */}
                      <div className="grid grid-cols-3 gap-2">
                        {(['morning', 'afternoon', 'evening'] as const).map(period => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => { playSound.click(); setPrintRoutinePeriod(period); }}
                            className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 text-center ${
                              printRoutinePeriod === period
                                ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                                : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            {period === 'morning' ? <Sun className="w-4 h-4" /> : period === 'afternoon' ? <CloudSun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span className="capitalize mt-1">{period}</span>
                          </button>
                        ))}
                      </div>

                      {/* Row 3: All Tasks (Non-Routine) */}
                      <div>
                        <button
                          type="button"
                          onClick={() => { playSound.click(); setPrintRoutinePeriod('all_tasks'); }}
                          className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            printRoutinePeriod === 'all_tasks'
                              ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                              : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span>All Tasks (Non-Routine)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Print Preview */}
                {step === 4 && (
                  <div className="space-y-4 pt-1">
                    <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                      Chart Preview
                    </Typography>

                    {/* Miniature Printed Chart Layout Mockup */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3 font-sans overflow-hidden">
                      {/* Purple Header Bar */}
                      <div className="bg-gradient-to-r from-violet-400 to-indigo-500 text-white rounded-xl p-3 flex justify-between items-center shadow-sm">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider">
                            {activeChild?.name}'s {printRoutinePeriod === 'all_tasks' ? 'Chore Chart' : activeChild?.holiday_mode ? 'Holiday Routine' : 'Weekly Routine'}
                          </div>
                          <div className="text-[8px] font-bold opacity-80 mt-0.5">
                            {formatWeekRange(getMondayOfWeek(weekOffset))}
                          </div>
                        </div>
                        <div className="text-[8px] font-black uppercase bg-white/20 px-2.5 py-0.5 rounded-full tracking-wider">
                          Quest Sync
                        </div>
                      </div>

                      {/* Mini Table Grid */}
                      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-[9px]">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
                              <th className="text-left p-1.5 font-black text-stone-500">Chore</th>
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <th key={i} className="text-center p-1.5 font-black text-stone-500 w-5">{day}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {buildPrintTasks().slice(0, 3).map((task, idx) => (
                              <tr key={task.id} className="border-b border-stone-100 dark:border-stone-800/40 last:border-none">
                                <td className="p-1.5 font-bold text-stone-700 dark:text-stone-300 truncate max-w-[120px]">
                                  {task.title}
                                </td>
                                {Array.from({ length: 7 }).map((_, i) => {
                                  const isWeekend = i === 5 || i === 6;
                                  const isWeekday = !isWeekend;
                                  
                                  const weekdayRoutine = getRoutineForType(activeChild, activeChild.holiday_mode ? 'holiday' : 'weekday');
                                  const weekendRoutine = getRoutineForType(activeChild, 'weekend');
                                  
                                  const isTaskInWeekday = isTaskInSpecificRoutine(task, weekdayRoutine);
                                  const isTaskInWeekend = isTaskInSpecificRoutine(task, weekendRoutine);
                                  
                                  let isActive = true;
                                  if (isTaskInWeekday && !isTaskInWeekend) {
                                    isActive = isWeekday;
                                  } else if (isTaskInWeekend && !isTaskInWeekday) {
                                    isActive = isWeekend;
                                  }
                                  
                                  return (
                                    <td key={i} className="text-center p-1.5">
                                      {isActive ? (
                                        <span className="text-amber-500 font-black text-[9px]">☆</span>
                                      ) : (
                                        <span className="text-stone-300 dark:text-stone-700 text-[8px]">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            {buildPrintTasks().length > 3 && (
                              <tr>
                                <td colSpan={8} className="p-1.5 text-center text-stone-400 dark:text-stone-500 text-[8px] font-bold bg-stone-50/50 dark:bg-stone-800/20">
                                  + {buildPrintTasks().length - 3} more chores included
                                </td>
                              </tr>
                            )}
                            {buildPrintTasks().length === 0 && (
                              <tr>
                                <td colSpan={8} className="p-3 text-center text-stone-400 dark:text-stone-500 font-medium">
                                  No chores match selected filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                      Prints a full 7-day landscape chart (Mon–Sun) of chores, routines, and star completion slots for {activeChild?.name}.
                    </p>
                  </div>
                )}

              </div>

              {/* Landscape Print Tip */}
              {step === 4 && (
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5 justify-center shrink-0">
                  <span>💡 Tip: Set orientation to <strong>Landscape</strong> in print settings for the best fit.</span>
                </div>
              )}

              {/* Footer actions */}
              <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800 shrink-0 flex gap-3">
                {step > 1 && (
                  <Button variant="secondary" onClick={() => { playSound.click(); setStep(s => (s - 1) as Step); }} className="flex-1 justify-center">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                )}

                {step === 1 && (
                  <Button
                    variant="primary"
                    onClick={() => { playSound.click(); setStep(2); }}
                    className="flex-1 justify-center"
                    disabled={!selectedChildId}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    variant="primary"
                    onClick={() => { playSound.click(); setStep(3); }}
                    className="flex-1 justify-center"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {step === 3 && (
                  <Button
                    variant="primary"
                    onClick={() => { playSound.click(); setStep(4); }}
                    className="flex-1 justify-center"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {step === 4 && (
                  <Button
                    variant="primary"
                    onClick={handleExecutePrint}
                    className="flex-1 justify-center"
                  >
                    <Printer className="w-4 h-4" /> Print Chart
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
