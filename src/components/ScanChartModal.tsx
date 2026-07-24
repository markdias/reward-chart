import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, X, Camera, Upload, AlertCircle, Loader2, Sparkles, Calendar, CalendarDays,
  ChevronLeft, ChevronRight, CheckCircle2, ToggleLeft, ToggleRight, Coins, Star
} from 'lucide-react';
import { Child, Task, TaskCompletion } from '../types';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';
import { ChildAvatar } from './ChildAvatar';
import { CoinBadge } from './CoinBadge';
import { playSound } from '../utils/sound';
import { getSupabaseClient } from '../utils/supabase';

interface ScanChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: Child[];
  tasks: Task[];
  onParentCompleteTask: (taskId: string, childId: string, dateIso: string) => void;
  onParentCompleteTasks?: (items: {taskId: string, childId: string, dateIso?: string}[]) => void;
  completions?: TaskCompletion[];
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface Detection {
  taskId: string;
  taskTitle: string;
  dayIndex: number;   // 0 = Monday
  detected: boolean;
  confidence: number;
  confirmed: boolean; // parent's toggle
  task?: Task;        // resolved task (for live coin value)
  alreadyCompleted?: boolean;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMondayOfWeek(offset: 0 | -1): Date {
  const now = new Date();
  const day = now.getDay();
  const distToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function getWeekLabel(monday: Date): string {
  const yr = monday.getFullYear();
  const startOfYear = new Date(yr, 0, 1);
  const weekNum = Math.ceil(((monday.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${yr}-W${String(weekNum).padStart(2, '0')}`;
}

export const ScanChartModal: React.FC<ScanChartModalProps> = ({
  isOpen,
  onClose,
  children,
  tasks,
  onParentCompleteTask,
  onParentCompleteTasks,
  completions = [],
}) => {
  const [step, setStep] = useState<Step>(1);
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id ?? '');
  const [weekOffset, setWeekOffset] = useState<0 | -1>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChild = children.find(c => c.id === selectedChildId) ?? children[0];
  const activeChildTasks = tasks.filter(t =>
    (t.child_id === activeChild?.id || t.child_id === 'all') &&
    t.child_id !== 'directory' &&
    t.is_template !== true &&
    t.is_active !== false
  );

  const monday = getMondayOfWeek(weekOffset);
  const weekStartDate = formatDateKey(monday);
  const weekRange = formatWeekRange(monday);

  const recalcSummary = useCallback((dets: Detection[]) => {
    const confirmed = dets.filter(d => d.confirmed);
    setTotalConfirmed(confirmed.length);
    setTotalCoins(confirmed.reduce((sum, d) => sum + (d.task?.points ?? 0), 0));
  }, []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleScan = async () => {
    if (!imageFile || !activeChild) return;
    setIsProcessing(true);
    setProcessingError(null);
    setStep(4);

    try {
      // Compress image to max 1600px wide/tall, 80% JPEG quality
      // This keeps the payload well under Gemini's 4 MB inline data limit
      const compressedBase64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(imageFile);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const MAX_DIM = 1600;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas not available')); return; }
          ctx.drawImage(img, 0, 0, width, height);
          // Use JPEG for best compression; PNG would be larger
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl.split(',')[1]); // strip data URI prefix
        };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
        img.src = objectUrl;
      });

      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/scan-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          imageMimeType: 'image/jpeg', // always JPEG after canvas compression
          childId: activeChild.id,
          weekStartDate,
        }),
      });


      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'weekly_limit_reached') {
          throw new Error('weekly_limit_reached');
        }
        const errorMsg = data.error 
          ? (data.detail ? `${data.error} \n\nDetail: ${data.detail}` : data.error)
          : (data.message ?? 'Scan failed');
        throw new Error(errorMsg);
      }

      // Map detections to tasks for live coin values
      const mapped: Detection[] = (data.detections ?? []).map((d: any) => {
        const task = activeChildTasks.find(t => t.id === d.taskId);
        
        const date = new Date(monday);
        date.setDate(monday.getDate() + d.dayIndex);
        date.setHours(12, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];

        const alreadyCompleted = completions.some(c => 
          c.task_id === d.taskId && 
          c.child_id === activeChild.id &&
          c.completed_at?.startsWith(dateStr) &&
          c.status !== 'rejected'
        );

        return { 
          ...d, 
          confirmed: d.detected && d.confidence >= 0.6 && !alreadyCompleted, 
          task, 
          alreadyCompleted 
        };
      });

      setDetections(mapped);
      recalcSummary(mapped);
      setStep(5);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setProcessingError(msg);
      setStep(3); // go back to photo step
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleDetection = (index: number) => {
    if (detections[index].alreadyCompleted) return;
    playSound.click();
    setDetections(prev => {
      const next = [...prev];
      next[index] = { ...next[index], confirmed: !next[index].confirmed };
      recalcSummary(next);
      return next;
    });
  };

  const handleConfirmAll = () => {
    playSound.success();
    const confirmedDetections = detections.filter(d => d.confirmed && !d.alreadyCompleted);
    
    if (onParentCompleteTasks) {
      const items = confirmedDetections.map(d => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + d.dayIndex);
        date.setHours(12, 0, 0, 0);
        return { taskId: d.taskId, childId: activeChild.id, dateIso: date.toISOString() };
      });
      onParentCompleteTasks(items);
    } else {
      confirmedDetections.forEach(d => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + d.dayIndex);
        date.setHours(12, 0, 0, 0);
        onParentCompleteTask(d.taskId, activeChild.id, date.toISOString());
      });
    }

    setTotalConfirmed(confirmedDetections.length);
    setStep(6);
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setStep(1);
      setImageFile(null);
      setImagePreviewUrl(null);
      setDetections([]);
      setProcessingError(null);
      setWeekOffset(0);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/70 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full sm:max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="h2" className="text-base font-black">Scan Completed Chart</Typography>
                <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400">
                  {step === 1 ? 'Choose child' : step === 2 ? 'Select week' : step === 3 ? 'Upload photo' : step === 4 ? 'Reading chart…' : step === 5 ? 'Review & confirm' : 'Done!'}
                </Typography>
              </div>
            </div>
            <button onClick={handleClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          {step < 6 && (
            <div className="flex gap-1.5 px-5 pt-3 shrink-0">
              {([1, 2, 3, 4, 5] as const).map(s => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-violet-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                />
              ))}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {/* Step 1: Select Child */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Which child's chart are you scanning?</p>
                <div className="grid grid-cols-2 gap-3">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => { playSound.click(); setSelectedChildId(child.id); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        child.id === selectedChildId
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 shadow-md'
                          : 'border-stone-200 dark:border-stone-700 hover:border-violet-300 dark:hover:border-violet-700'
                      }`}
                    >
                      <ChildAvatar iconName={child.avatar_url || 'Smile'} className="w-12 h-12 rounded-2xl" />
                      <span className="text-sm font-extrabold text-stone-800 dark:text-stone-100">{child.name}</span>
                      {child.id === selectedChildId && <Check className="w-4 h-4 text-violet-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Week */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Which week does this chart cover?</p>
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
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 shadow-md'
                            : 'border-stone-200 dark:border-stone-700 hover:border-violet-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className={`w-4 h-4 ${isSelected ? 'text-violet-500' : 'text-stone-400'}`} />
                          <span className="font-black text-sm text-stone-900 dark:text-stone-50">
                            {offset === 0 ? 'This Week' : 'Last Week'}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{formatWeekRange(mon)}</span>
                        {isSelected && <Check className="w-4 h-4 text-violet-500 mt-2" />}
                      </button>
                    );
                  })}
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 text-xs text-amber-800 dark:text-amber-200 font-medium">
                  <span className="font-bold">Note:</span> Coins will use the <strong>current app values</strong> for each chore — not what was printed on the chart.
                </div>
              </div>
            )}

            {/* Step 3: Upload Photo */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Take or upload a photo of the completed chart.</p>

                {processingError && processingError !== 'weekly_limit_reached' && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-3.5 flex items-start gap-2 text-red-700 dark:text-red-300 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{processingError}</span>
                  </div>
                )}

                {processingError === 'weekly_limit_reached' && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 flex items-start gap-2 text-amber-700 dark:text-amber-300 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>You've already scanned a chart for <strong>{activeChild?.name}</strong> this week. You can scan again next week.</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreviewUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-violet-300 dark:border-violet-700 shadow-md">
                      <img src={imagePreviewUrl} alt="Chart preview" className="w-full object-cover max-h-64" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreviewUrl(null); }}
                        className="absolute top-2 right-2 bg-stone-900/70 text-white rounded-xl p-1.5 hover:bg-stone-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 text-center font-medium">Looks good? Press Scan to analyse it.</p>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-2xl p-8 flex flex-col items-center gap-3 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
                  >
                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/50 rounded-2xl flex items-center justify-center">
                      <Camera className="w-8 h-8 text-violet-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-stone-800 dark:text-stone-100">Tap to take a photo</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Place chart flat with good lighting</p>
                    </div>
                  </button>
                )}

                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-3.5 text-xs text-stone-500 dark:text-stone-400 font-medium space-y-1">
                  <p className="font-bold text-stone-700 dark:text-stone-300">Tips for a better scan:</p>
                  <p>• Lay the chart flat on a table</p>
                  <p>• Use good lighting — avoid shadows</p>
                  <p>• Keep the whole chart visible in the frame</p>
                </div>
              </div>
            )}

            {/* Step 4: Processing */}
            {step === 4 && (
              <div className="flex flex-col items-center justify-center py-12 gap-8">
                <div className="text-center">
                  <p className="font-black text-lg text-stone-900 dark:text-stone-50 mb-2">Reading your chart…</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">AI is analysing the image</p>
                </div>
                <div className="w-64 h-3 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    className="absolute top-0 bottom-0 bg-violet-500 rounded-full"
                    initial={{ left: "-100%", width: "50%" }}
                    animate={{ left: "200%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-200">Toggle chores to confirm or remove:</p>
                  <CoinBadge points={totalCoins} className="px-3 py-1 shadow-sm" />
                </div>

                {/* Group detections by task */}
                {activeChildTasks.map(task => {
                  const taskDetections = detections.filter(d => d.taskId === task.id && d.detected);
                  if (taskDetections.length === 0) return null;
                  return (
                    <div key={task.id} className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <CoinBadge points={task.points} className="w-8 h-8 text-[10px]" />
                        <span className="text-sm font-extrabold text-stone-800 dark:text-stone-100">{task.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {taskDetections.map((d, globalIdx) => {
                          const idx = detections.indexOf(d);
                          return (
                            <button
                              key={`${d.taskId}-${d.dayIndex}`}
                              onClick={() => toggleDetection(idx)}
                              disabled={d.alreadyCompleted}
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                                d.alreadyCompleted
                                  ? 'bg-stone-200 border-stone-200 text-stone-500 opacity-60 cursor-not-allowed'
                                  : d.confirmed
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                  : 'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-500 line-through'
                              }`}
                            >
                              {DAY_NAMES[d.dayIndex]}
                              {d.alreadyCompleted && <CheckCircle2 className="w-3 h-3 ml-0.5 opacity-70" />}
                              {!d.alreadyCompleted && d.confidence < 0.7 && (
                                <span title="AI was uncertain about this one" className={`text-[9px] ${d.confirmed ? 'text-emerald-200' : 'text-stone-400'}`}>?</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {detections.filter(d => d.detected).length === 0 && (
                  <div className="text-center py-8 text-stone-400">
                    <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No completed chores detected.</p>
                    <p className="text-xs mt-1">Try a clearer photo with better lighting.</p>
                  </div>
                )}

                <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-3.5 text-xs text-violet-700 dark:text-violet-300 font-medium">
                  <strong>{totalConfirmed}</strong> chore{totalConfirmed !== 1 ? 's' : ''} selected · <strong>+{totalCoins}</strong> coins to be awarded
                </div>
              </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
              <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-3xl flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <p className="font-black text-2xl text-stone-900 dark:text-stone-50">Done! 🎉</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
                    <strong className="text-stone-800 dark:text-stone-100">{totalConfirmed}</strong> chore{totalConfirmed !== 1 ? 's' : ''} marked complete
                    {totalCoins > 0 && <> · <strong className="text-amber-600 dark:text-amber-400">+{totalCoins} coins</strong> earned</>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800 shrink-0 flex gap-3">
            {step > 1 && step < 4 && step !== 6 && (
              <Button variant="secondary" onClick={() => setStep(s => (s - 1) as Step)} className="flex-1 justify-center">
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
                variant="purple"
                onClick={handleScan}
                className="flex-1 justify-center"
                disabled={!imageFile || isProcessing || processingError === 'weekly_limit_reached'}
              >
                Scan Chart
              </Button>
            )}

            {step === 5 && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => { setStep(3); setImageFile(null); setImagePreviewUrl(null); }}
                  className="flex-1 justify-center"
                >
                  Retake
                </Button>
                <Button
                  variant="purple"
                  onClick={handleConfirmAll}
                  className="flex-1 justify-center"
                  disabled={totalConfirmed === 0}
                >
                  <Check className="w-4 h-4" /> Confirm {totalConfirmed > 0 ? `${totalConfirmed}` : ''} Chore{totalConfirmed !== 1 ? 's' : ''}
                </Button>
              </>
            )}

            {step === 6 && (
              <Button variant="purple" onClick={handleClose} className="flex-1 justify-center">
                Close
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
