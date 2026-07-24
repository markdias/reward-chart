import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Camera, CheckSquare, Layers, Sun, CloudSun, Moon, ClipboardList } from 'lucide-react';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';
import { playSound } from '../utils/sound';
import { Task, TaskCompletion, Child, Routine } from '../types';

const getActiveRoutineForPrint = (child: Child, range: 'weekdays' | 'weekends'): Routine | undefined => {
  const currentRoutines = child.routines || [];
  let routineId = 'weekday';
  if (range === 'weekdays') {
    routineId = child.holiday_mode ? 'holiday' : 'weekday';
  } else {
    routineId = 'weekend';
  }

  const DEFAULT_ROUTINES = [
    { id: 'weekday', name: 'Weekday Routine' },
    { id: 'weekend', name: 'Weekend Routine' },
    { id: 'holiday', name: 'Holiday Routine' }
  ];

  let routine = currentRoutines.find(r => r.id === routineId);
  if (!routine) {
    routine = currentRoutines.find(r => r.name?.toLowerCase().includes(routineId));
    if (routine) {
      routine = { ...routine, id: routineId };
    }
  }
  if (!routine && routineId === 'weekday' && currentRoutines.length > 0) {
    const unassigned = currentRoutines.find(r => !DEFAULT_ROUTINES.some(d => d.id === r.id || r.name?.toLowerCase().includes(d.id)));
    if (unassigned) {
      routine = { ...unassigned, id: routineId };
    }
  }
  return routine;
};

const getTaskRoutineInfoForSpecificRoutine = (
  task: Task,
  routine?: Routine
): { isRoutine: boolean; period?: 'morning' | 'afternoon' | 'evening'; label: string } => {
  if (routine) {
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
  return { isRoutine: false, label: '' };
};

interface PrintTaskChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  completions: TaskCompletion[];
  childrenList: Child[];
}

export function PrintTaskChartModal({
  isOpen,
  onClose,
  tasks,
  completions,
  childrenList
}: PrintTaskChartModalProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [printRange, setPrintRange] = useState<'weekdays' | 'weekends'>('weekdays');
  const [printMode, setPrintMode] = useState<'live' | 'blank'>('blank');
  const [printRoutinePeriod, setPrintRoutinePeriod] = useState<'all_routines' | 'morning' | 'afternoon' | 'evening' | 'all_tasks'>('all_routines');

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const buildPrintTasks = (): Task[] => {
    const activeChild = childrenList.find(c => c.id === selectedChildId);
    if (!activeChild) return [];

    let filteredTasks = (tasks || []).filter(t =>
      (t.child_id === activeChild.id || t.child_id === 'all') &&
      t.child_id !== 'directory' &&
      t.is_template !== true &&
      t.is_active !== false
    );

    const routine = getActiveRoutineForPrint(activeChild, printRange);

    if (printRoutinePeriod === 'all_tasks') {
      filteredTasks = filteredTasks.filter(task => {
        const info = getTaskRoutineInfoForSpecificRoutine(task, routine);
        return !info.isRoutine;
      });
    } else if (printRoutinePeriod === 'all_routines') {
      filteredTasks = filteredTasks.filter(task => {
        const info = getTaskRoutineInfoForSpecificRoutine(task, routine);
        return info.isRoutine;
      });
    } else {
      filteredTasks = filteredTasks.filter(task => {
        const info = getTaskRoutineInfoForSpecificRoutine(task, routine);
        return info.period === printRoutinePeriod;
      });
    }

    return filteredTasks;
  };

  const buildPrintDays = (): Date[] => {
    const now = new Date();
    const distanceToMonday = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    if (printRange === 'weekdays') {
      return Array.from({ length: 5 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
      });
    } else {
      return Array.from({ length: 2 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + 5 + i);
        return d;
      });
    }
  };

  const getWeekLabel = (date: Date): string => {
    const yr = date.getFullYear();
    const startOfYear = new Date(yr, 0, 1);
    const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${yr}-W${String(weekNum).padStart(2, '0')}`;
  };

  const handleExecutePrint = () => {
    playSound.click();
    
    const activeChild = childrenList.find(c => c.id === selectedChildId);
    if (!activeChild) return;

    const printTasks = buildPrintTasks();
    const printDays = buildPrintDays();
    const isBlank = printMode === 'blank';
    const childName = activeChild.name;
    const weekLabel = getWeekLabel(printDays[0]);
    const chartId = `${childName.toUpperCase().replace(/\s+/g, '-')}-${weekLabel}`;

    const isWeekdays = printRange === 'weekdays';
    const dayNames = isWeekdays 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] 
      : ['Sat', 'Sun'];
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

    const hollowCircle = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    const filledCircle = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>`;

    const colHeaders = dayNames
      .map((day, i) => {
        const date = printDays[i];
        const dateStr = formatDateKey(date);
        const isToday = dateStr === todayStr;
        return `<th style="text-align:center;padding:12px 4px;font-size:12px;color:${isToday ? '#7c3aed' : '#4b5563'};font-weight:900;min-width:56px;">
          ${day}${!isBlank ? `<br/><span style="font-size:11px;font-weight:700">${date.getDate()}</span>` : ''}
        </th>`;
      }).join('');

    let tableBodyHtml = '';
    if (printRoutinePeriod === 'all_routines') {
      const routine = getActiveRoutineForPrint(activeChild, printRange);
      const periods: { key: 'morning' | 'afternoon' | 'evening'; label: string }[] = [
        { key: 'morning', label: 'Morning Routine' },
        { key: 'afternoon', label: 'Afternoon Routine' },
        { key: 'evening', label: 'Evening Routine' }
      ];

      let totalTasksCount = 0;
      periods.forEach(p => {
        const periodTasks = printTasks.filter(t => {
          const info = getTaskRoutineInfoForSpecificRoutine(t, routine);
          return info.period === p.key;
        });

        if (periodTasks.length > 0) {
          totalTasksCount += periodTasks.length;
          // Add section header row
          tableBodyHtml += `<tr style="background:#f3f4f6;border-bottom:2px solid #e7e5e4;">
            <td colspan="${printDays.length + 1}" style="padding:10px 14px;font-size:12px;font-weight:900;color:#374151;text-transform:uppercase;letter-spacing:0.05em;text-align:left;">
              ${p.label}
            </td>
          </tr>`;

          // Add task rows for this period
          periodTasks.forEach((task, index) => {
            const cells = printDays.map(date => {
              const dk = formatDateKey(date);
              const status = compLookup.get(`${task.id}_${dk}`);
              const icon = (!isBlank && status === 'approved') ? filledCircle : hollowCircle;
              return `<td style="text-align:center;padding:8px 3px;border-left:1px dashed #e7e5e4;">${icon}</td>`;
            }).join('');
            const bg = index % 2 === 0 ? '#ffffff' : '#faf5ff';
            tableBodyHtml += `<tr style="background:${bg};border-bottom:1px solid #f5f5f4;">
              <td style="padding:10px 14px;font-size:14px;font-weight:800;color:#1c1917;min-width:140px;max-width:180px;white-space:normal;word-break:break-word;">
                <span style="display:inline-flex;align-items:center;justify-content:center;background:#fffbeb;color:#d97706;font-size:10px;font-weight:800;width:24px;height:24px;border:2px solid #fcd34d;border-radius:50%;margin-bottom:6px;">${task.points}</span><br/>
                ${task.title}
              </td>
              ${cells}
            </tr>`;
          });
        }
      });

      if (totalTasksCount === 0) {
        tableBodyHtml = `<tr><td colspan="${printDays.length + 1}" style="text-align:center;padding:32px;color:#a8a29e;font-size:13px;">No routine chores match the selected filters.</td></tr>`;
      }
    } else {
      const taskRows = printTasks.map((task, index) => {
        const cells = printDays.map(date => {
          const dk = formatDateKey(date);
          const status = compLookup.get(`${task.id}_${dk}`);
          const icon = (!isBlank && status === 'approved') ? filledCircle : hollowCircle;
          return `<td style="text-align:center;padding:8px 3px;border-left:1px dashed #e7e5e4;">${icon}</td>`;
        }).join('');
        const bg = index % 2 === 0 ? '#ffffff' : '#faf5ff';
        return `<tr style="background:${bg};border-bottom:1px solid #f5f5f4;">
          <td style="padding:10px 14px;font-size:14px;font-weight:800;color:#1c1917;min-width:140px;max-width:180px;white-space:normal;word-break:break-word;">
            <span style="display:inline-flex;align-items:center;justify-content:center;background:#fffbeb;color:#d97706;font-size:10px;font-weight:800;width:24px;height:24px;border:2px solid #fcd34d;border-radius:50%;margin-bottom:6px;">${task.points}</span><br/>
            ${task.title}
          </td>
          ${cells}
        </tr>`;
      }).join('');

      const noTasksRow = printTasks.length === 0
        ? `<tr><td colspan="${printDays.length + 1}" style="text-align:center;padding:32px;color:#a8a29e;font-size:13px;">No chores match the selected filters.</td></tr>`
        : '';
      tableBodyHtml = taskRows + noTasksRow;
    }

    let routineLabel = 'Tasks';
    if (printRoutinePeriod === 'all_routines') {
      routineLabel = isWeekdays 
        ? (activeChild.holiday_mode ? 'Holiday Routine' : 'Weekday Routine') 
        : 'Weekend Routine';
    } else if (printRoutinePeriod === 'all_tasks') {
      routineLabel = isWeekdays
        ? (activeChild.holiday_mode ? 'Holiday General Tasks' : 'Weekday General Tasks')
        : 'Weekend General Tasks';
    } else {
      const periodLabel = printRoutinePeriod.charAt(0).toUpperCase() + printRoutinePeriod.slice(1);
      routineLabel = isWeekdays
        ? (activeChild.holiday_mode ? `Holiday ${periodLabel} Routine` : `Weekday ${periodLabel} Routine`)
        : `Weekend ${periodLabel} Routine`;
    }

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
    
    /* Screen: normal layout with padding */
    #print-wrapper { padding: 1.2cm 1cm; }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .table-container { border: 2px solid #e7e5e4; }
      /* Safari landscape workaround: rotate content when printed in portrait */
      #print-wrapper {
        width: 100vw;
        padding: 1.2cm 1cm;
        transform-origin: top left;
      }
      @supports (-webkit-touch-callout: none) {
        /* Target WebKit/Safari specifically */
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
    <div class="footer-instruction">✅ Colour in each circle when you finish a chore! &nbsp; Ask a grown-up to scan this chart.</div>
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

  if (!childrenList || childrenList.length === 0) return null;
  const activeChild = childrenList.find(c => c.id === selectedChildId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playSound.click(); onClose(); }}
            className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md pointer-events-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 overflow-hidden flex flex-col max-h-[80vh] text-left"
            >
            {/* Header Icon & Title */}
            <div className="flex items-start justify-between mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/50 text-purple-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <Typography variant="h2" className="text-xl font-bold">
                    Print Chart Options
                  </Typography>
                  <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Configure duration and template style
                  </Typography>
                </div>
              </div>
              <button
                onClick={() => { playSound.click(); onClose(); }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto pr-1 pb-4 flex-1">
              {/* Option 1: Child Selection */}
              <div>
                <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                  1. Child
                </Typography>
                <div className="grid grid-cols-2 gap-2">
                  {childrenList.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { playSound.click(); setSelectedChildId(c.id); }}
                      className={`p-3 rounded-2xl border transition-all text-left ${
                        selectedChildId === c.id 
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' 
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <p className="font-extrabold text-sm">{c.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Days to Print */}
              <div>
                <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                  2. Days to Print
                </Typography>
                <div className="grid grid-cols-2 gap-2">
                  {([['weekdays', 'Weekdays', 'Mon – Fri'], ['weekends', 'Weekends', 'Sat – Sun']] as const).map(([val, label, sub]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { playSound.click(); setPrintRange(val); }}
                      className={`p-3 rounded-2xl border transition-all text-left ${
                        printRange === val
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <p className="font-extrabold text-sm">{label}</p>
                      <p className={`text-xs mt-0.5 ${printRange === val ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>{sub}</p>
                    </button>
                  ))}
                </div>
                {printRange === 'weekdays' && activeChild?.holiday_mode && (
                  <div className="mt-2 p-2.5 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold rounded-xl flex items-center gap-2 border border-cyan-100 dark:border-cyan-900/30">
                    <span>🌴 Holiday Mode is active. This will print the Holiday routine instead of Weekdays.</span>
                  </div>
                )}
              </div>

              {/* Option 3: Chart Style */}
              <div>
                <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                  3. Chart Style
                </Typography>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => { playSound.click(); setPrintMode('live'); }}
                    className={`w-full p-3 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                      printMode === 'live'
                        ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Camera className={`w-5 h-5 shrink-0 mt-0.5 ${printMode === 'live' ? 'text-purple-300 dark:text-purple-600' : 'text-purple-500'}`} />
                    <div>
                      <p className="font-extrabold text-sm">Live Chart (with Dates)</p>
                      <p className={`text-xs mt-0.5 font-medium ${printMode === 'live' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                        Prints calendar dates and any already-completed tasks.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { playSound.click(); setPrintMode('blank'); }}
                    className={`w-full p-3 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                      printMode === 'blank'
                        ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <CheckSquare className={`w-5 h-5 shrink-0 mt-0.5 ${printMode === 'blank' ? 'text-purple-300 dark:text-purple-600' : 'text-purple-500'}`} />
                    <div>
                      <p className="font-extrabold text-sm">Blank / Reusable Template</p>
                      <p className={`text-xs mt-0.5 font-medium ${printMode === 'blank' ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                        Generic MON–SUN headers, empty circles — perfect for colouring in!
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Option 4: Routine & Task Selection */}
              <div className="space-y-3">
                <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                  4. Routine & Tasks
                </Typography>
                
                {/* Row 1: All Routines */}
                <div>
                  <button
                    type="button"
                    onClick={() => { playSound.click(); setPrintRoutinePeriod('all_routines'); }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
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
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 text-center ${
                        printRoutinePeriod === period
                          ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                          : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {period === 'morning' ? <Sun className="w-4 h-4" /> : period === 'afternoon' ? <CloudSun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span className="capitalize">{period}</span>
                    </button>
                  ))}
                </div>

                {/* Row 3: All Tasks (Non-Routine) */}
                <div>
                  <button
                    type="button"
                    onClick={() => { playSound.click(); setPrintRoutinePeriod('all_tasks'); }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
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
              {/* Landscape Print Tip */}
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5 justify-center">
                <span>💡 Tip: Set orientation to <strong>Landscape</strong> in print settings for the best fit.</span>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-stone-100 dark:border-stone-800 shrink-0">
              <Button
                variant="secondary"
                onClick={() => { playSound.click(); onClose(); }}
                className="flex-1 justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExecutePrint}
                className="flex-1 justify-center"
              >
                <Printer className="w-4 h-4" />
                <span>Print Chart</span>
              </Button>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
