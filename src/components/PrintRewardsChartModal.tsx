import React, { useState } from 'react';
import { X, Printer, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { Child, Reward } from '../types';
import { playSound } from '../utils/sound';

interface PrintRewardsChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  rewards: Reward[];
}

export function PrintRewardsChartModal({ isOpen, onClose, childrenList, rewards }: PrintRewardsChartModalProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [printRange, setPrintRange] = useState<'7d' | '14d'>('7d');

  const formatDateKey = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handlePrint = () => {
    playSound.click();
    const activeChild = childrenList.find(c => c.id === selectedChildId);
    if (!activeChild) return;

    // Filter active rewards for this child
    const childRewards = rewards.filter(r => r.child_id === activeChild.id && r.is_available && !r.is_template);

    const numDays = printRange === '7d' ? 7 : 14;
    const today = new Date();
    // Start on previous Monday
    const startDay = new Date(today);
    const dayOfWeek = startDay.getDay() === 0 ? 7 : startDay.getDay();
    startDay.setDate(startDay.getDate() - dayOfWeek + 1);
    startDay.setHours(12, 0, 0, 0);

    const printDays: Date[] = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      d.setHours(12, 0, 0, 0);
      printDays.push(d);
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = formatDateKey(new Date());

    const hollowStar = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

    const colHeaders = (printRange === '7d' ? dayNames : [...dayNames, ...dayNames])
      .slice(0, printDays.length)
      .map((day, i) => {
        const date = printDays[i];
        const dateStr = formatDateKey(date);
        const isToday = dateStr === todayStr;
        return `<th style="text-align:center;padding:12px 4px;font-size:12px;color:${isToday ? '#7c3aed' : '#4b5563'};font-weight:900;min-width:56px;">
          ${day}<br/><span style="font-size:11px;font-weight:700">${date.getDate()}</span>
        </th>`;
      }).join('');

    const totalRowsCount = childRewards.length;
    const shouldSplit = totalRowsCount > 10;
    const page1Rewards = shouldSplit ? childRewards.slice(0, 10) : childRewards;
    const page2Rewards = shouldSplit ? childRewards.slice(10) : [];

    const renderRewardsToHtml = (rewardsList: typeof childRewards) => {
      if (rewardsList.length === 0) {
        return `<tr><td colspan="${printDays.length + 1}" style="text-align:center;padding:32px;color:#a8a29e;font-size:13px;">No active rewards assigned to this child.</td></tr>`;
      }
      return rewardsList.map((reward, index) => {
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
    };

    const page1Html = renderRewardsToHtml(page1Rewards);
    const page2Html = renderRewardsToHtml(page2Rewards);

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
  ${shouldSplit ? `
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:12px 14px;font-size:12px;color:#4b5563;font-weight:900;text-transform:uppercase;">Reward</th>
          ${colHeaders}
        </tr>
      </thead>
      <tbody>
        ${page1Html}
      </tbody>
    </table>
  </div>

  <div class="page-break" style="page-break-after: always; page-break-inside: avoid; border-top: 2px dashed #a8a29e; position: relative; margin: 30px 0; text-align: left;">
    <span style="position: absolute; top: -12px; left: 24px; background: #fff; padding: 0 8px; font-size: 14px; font-weight: bold; color: #78716c; font-family: 'Nunito', sans-serif;">✂️ Cut along this line to join pages</span>
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
        ${page2Html}
      </tbody>
    </table>
  </div>
  ` : `
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="text-align:left;padding:12px 14px;font-size:12px;color:#4b5563;font-weight:900;text-transform:uppercase;">Reward</th>
          ${colHeaders}
        </tr>
      </thead>
      <tbody>
        ${page1Html}
      </tbody>
    </table>
  </div>
  `}

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playSound.click(); onClose(); }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm"
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
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <Typography variant="h2" className="text-xl font-bold">
                      Print Reward Chart
                    </Typography>
                    <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Select child and duration
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

                {/* Option 2: Print Duration */}
                <div>
                  <Typography variant="label" className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">
                    2. Duration
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    {([['7d', '7 Days', '1 Week'], ['14d', '14 Days', '2 Weeks']] as const).map(([val, label, sub]) => (
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
                        <p className={`text-xs mt-0.5 ${printRange === val ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>{sub} Layout</p>
                      </button>
                    ))}
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
                  onClick={handlePrint}
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
