import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Printer, Check, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { ChildAvatar } from './ChildAvatar';
import { Child, Reward } from '../types';
import { playSound } from '../utils/sound';

interface PrintRewardsChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  rewards: Reward[];
}

type Step = 1 | 2 | 3;

export function PrintRewardsChartModal({ isOpen, onClose, childrenList, rewards }: PrintRewardsChartModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [weekOffset, setWeekOffset] = useState<0 | -1>(0);

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

  const formatDateKey = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handlePrint = () => {
    playSound.click();
    if (!activeChild) return;

    // Filter active rewards for this child
    const childRewards = rewards.filter(r => r.child_id === activeChild.id && r.is_available && !r.is_template);

    const monday = getMondayOfWeek(weekOffset);
    const printDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      d.setHours(12, 0, 0, 0);
      printDays.push(d);
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = formatDateKey(new Date());

    const hollowStar = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

    const colHeaders = dayNames
      .map((day, i) => {
        const date = printDays[i];
        const dateStr = formatDateKey(date);
        const isToday = dateStr === todayStr;
        return `<th style="text-align:center;padding:12px 4px;font-size:12px;color:${isToday ? '#7c3aed' : '#4b5563'};font-weight:900;min-width:56px;">
          ${day}<br/><span style="font-size:11px;font-weight:700">${date.getDate()}</span>
        </th>`;
      }).join('');

    const rewardRows = childRewards.map((reward, index) => {
      const cells = printDays.map(() => {
        return `<td style="text-align:center;padding:8px 3px;border-left:1px dashed #e7e5e4;">${hollowStar}</td>`;
      }).join('');
      const bg = index % 2 === 0 ? '#ffffff' : '#faf5ff';
      return `<tr style="background:${bg};border-bottom:1px solid #f5f5f4;">
        <td style="padding:10px 14px;font-size:14px;font-weight:800;color:#1c1917;min-width:140px;max-width:180px;white-space:normal;word-break:break-word;">
          <span style="display:inline-flex;align-items:center;justify-content:center;background:#f0fdf4;color:#10b981;font-size:10px;font-weight:800;width:24px;height:24px;border:2px solid #34d399;border-radius:50%;margin-bottom:6px;">${reward.cost_points}</span><br/>
          ${reward.title}
        </td>
        ${cells}
      </tr>`;
    }).join('');

    const noRewardsRow = childRewards.length === 0
      ? `<tr><td colspan="${printDays.length + 1}" style="text-align:center;padding:32px;color:#a8a29e;font-size:13px;">No active rewards assigned to this child.</td></tr>`
      : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${activeChild.name}'s Rewards Chart</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: 297mm 210mm; margin: 1.2cm 1cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; color: #1c1917; }
    .header { 
      display: flex; align-items: center; justify-content: space-between; 
      padding: 16px 24px; 
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 16px;
      margin-bottom: 20px; 
      color: white;
    }
    .header-title { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; }
    .header-sub { font-size: 13px; font-weight: 700; opacity: 0.9; margin-top: 4px; }
    
    .table-container {
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid #e7e5e4;
    }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f3f4f6; border-bottom: 2px solid #e7e5e4; }
    th:first-child { text-align: left; padding: 12px 14px; font-size: 13px; color: #4b5563; font-weight: 900; text-transform: uppercase; }
    tbody tr:last-child { border-bottom: none; }
    
    .footer { margin-top: 24px; font-size: 13px; color: #6b7280; font-weight: 700; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-title">${activeChild.name}'s Rewards Chart</div>
      <div class="header-sub">${printDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${printDays[printDays.length - 1].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
    </div>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:12px 14px;font-size:12px;color:#4b5563;font-weight:900;text-transform:uppercase;">Reward</th>
          ${colHeaders}
        </tr>
      </thead>
      <tbody>
        ${rewardRows}${noRewardsRow}
      </tbody>
    </table>
  </div>
  <div class="footer">
    🎨 Colour in a star when you claim a reward! &nbsp; Ask a grown-up to scan this chart to deduct coins.
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
    onClose();
  };

  const handleClose = () => {
    playSound.click();
    setStep(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm"
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
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <Typography variant="h2" className="text-base font-black">
                      Print Reward Chart
                    </Typography>
                    <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {step === 1 ? 'Choose child' : step === 2 ? 'Select week' : 'Print chart'}
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
                {([1, 2, 3] as const).map(s => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'}`}
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
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-md'
                              : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300'
                          }`}
                        >
                          <ChildAvatar iconName={child.avatar_url || 'Smile'} className="w-12 h-12 rounded-2xl" />
                          <span className="text-sm font-extrabold text-stone-800 dark:text-stone-100">{child.name}</span>
                          {child.id === selectedChildId && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Select Week */}
                {step === 2 && (
                  <div className="space-y-4 pt-1">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Which week should the chart print?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([0, -1] as const).map(offset => {
                        const mon = getMondayOfWeek(offset);
                        const isSelected = weekOffset === offset;
                        return (
                          <button
                            key={offset}
                            onClick={() => { playSound.click(); setWeekOffset(offset); }}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-md'
                                : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className={`w-4 h-4 ${isSelected ? 'text-emerald-500' : 'text-stone-400'}`} />
                              <span className="font-black text-sm text-stone-900 dark:text-stone-50">
                                {offset === 0 ? 'This Week' : 'Last Week'}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{formatWeekRange(mon)}</span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-500 mt-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3: Print */}
                {step === 3 && (
                  <div className="space-y-4 pt-1">
                    
                    {/* Example/Mockup Card */}
                    <div className="bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Chart Preview</span>
                        <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2.5 py-0.5 rounded-full font-black">7 DAYS</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-stone-800 dark:text-stone-200">
                          {activeChild?.name}'s Reward Chart
                        </p>
                        <p className="text-xs font-bold text-stone-400 dark:text-stone-500">
                          Range: {formatWeekRange(getMondayOfWeek(weekOffset))}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                      Prints a full 7-day grid (Mon–Sun) of all available rewards and their coin costs for {activeChild?.name}.
                    </p>
                  </div>
                )}

              </div>

              {/* Landscape Print Tip */}
              {step === 3 && (
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
                    onClick={handlePrint}
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
