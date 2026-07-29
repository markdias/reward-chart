import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, X, Camera, Upload, AlertCircle, Loader2, Sparkles, Calendar,
  ChevronLeft, ChevronRight, CheckCircle2, Coins, Star
} from 'lucide-react';
import jsQR from 'jsqr';
import { Child, Task, TaskCompletion, Reward } from '../types';
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
  rewards: Reward[];
  onParentCompleteTask: (taskId: string, childId: string, dateIso: string) => void;
  onParentCompleteTasks?: (items: {taskId: string, childId: string, dateIso?: string}[]) => void;
  onParentRedeemRewards: (items: {rewardId: string, childId: string, dateIso: string}[]) => void;
  onFeedPet?: (childId: string) => Promise<void>;
  completions?: TaskCompletion[];
  initialMode?: 'chart' | 'reward';
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface Detection {
  taskId: string;
  taskTitle: string;
  dayIndex: number;   // 0 = Monday
  detected: boolean;
  confidence: number;
  confirmed: boolean; // parent's toggle
  task?: Task;
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

export const ScanChartModal: React.FC<ScanChartModalProps> = ({
  isOpen,
  onClose,
  children,
  tasks,
  rewards,
  onParentCompleteTask,
  onParentCompleteTasks,
  onParentRedeemRewards,
  onFeedPet,
  completions = [],
  initialMode,
}) => {
  // Modal Steps & Chore Scan States
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

  // QR Scan Mode States
  const [scanMode, setScanMode] = useState<'chart' | 'reward'>(initialMode || 'chart');

  useEffect(() => {
    if (isOpen) {
      setScanMode(initialMode || 'chart');
    }
  }, [isOpen, initialMode]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [scannedPayload, setScannedPayload] = useState<string | null>(null);
  const [decodedRewardId, setDecodedRewardId] = useState<string | null>(null);
  const [decodedChildId, setDecodedChildId] = useState<string | null>(null);
  const [isFeedQr, setIsFeedQr] = useState(false);
  const [writeInTitle, setWriteInTitle] = useState('');
  const [writeInCost, setWriteInCost] = useState<number>(0);
  const [activeRedeemChildId, setActiveRedeemChildId] = useState<string>('');

  const activeChild = children.find(c => c.id === (scanMode === 'chart' ? selectedChildId : activeRedeemChildId)) ?? children[0];
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

  // Camera stream activation
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      if (scanMode !== 'reward' || step !== 1 || !isOpen) {
        setCameraActive(false);
        return;
      }
      try {
        setCameraPermissionError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('Camera access denied or not available:', err);
        setCameraPermissionError('Could not access the camera. Make sure permissions are enabled, or upload an image instead.');
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanMode, step, isOpen]);

  // Video scanning animation frame loop
  useEffect(() => {
    if (!cameraActive || scanMode !== 'reward' || step !== 1 || !isOpen) return;

    let active = true;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let frameId: number;

    function scanFrame() {
      if (!active || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (!canvas) {
          canvas = document.createElement('canvas');
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        if (!ctx) {
          ctx = canvas.getContext('2d');
        }
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });
          if (code && code.data) {
            handleQrDecoded(code.data);
            return;
          }
        }
      }
      frameId = requestAnimationFrame(scanFrame);
    }

    frameId = requestAnimationFrame(scanFrame);

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [cameraActive, scanMode, step, isOpen]);

  const handleQrDecoded = (payload: string) => {
    playSound.success();
    setScannedPayload(payload);
    setCameraActive(false);
    setProcessingError(null);
    
    try {
      const url = new URL(payload.replace('questsync://', 'https://questsync.app/'));
      const rewardId = url.searchParams.get('rewardId');
      const childId = url.searchParams.get('childId');
      const isFeed = url.pathname === '/feed' || payload.includes('/feed?');
      
      setIsFeedQr(isFeed);
      setDecodedRewardId(rewardId);
      setDecodedChildId(childId);
      
      if (childId) {
        setActiveRedeemChildId(childId);
      } else {
        setActiveRedeemChildId('');
      }

      if (isFeed) {
        if (childId) {
          setStep(4);
        } else {
          setStep(2);
        }
      } else if (rewardId) {
        if (!childId) {
          setStep(2);
        } else if (rewardId === 'blank') {
          setStep(3);
        } else {
          setStep(4);
        }
      } else {
        throw new Error('Not a valid Quest Sync QR code');
      }
    } catch (err) {
      console.warn('QR Code parsing error:', err);
      setProcessingError('Could not recognize this QR code. Please make sure it is a valid Quest Sync code.');
      setTimeout(() => {
        setProcessingError(null);
      }, 3000);
    }
  };

  const handleQrImageUpload = async (file: File) => {
    setProcessingError(null);
    setIsProcessing(true);
    
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => { URL.revokeObjectURL(objectUrl); resolve(); };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
        img.src = objectUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas rendering context not available');
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code && code.data) {
        handleQrDecoded(code.data);
      } else {
        throw new Error('No QR code detected in this photo. Make sure the QR code is centered and fully visible.');
      }
    } catch (err: any) {
      console.error(err);
      setProcessingError(err?.message ?? 'Failed to decode image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (scanMode === 'reward') {
        handleQrImageUpload(file);
      } else {
        handleImageSelect(file);
      }
    }
  };

  const handleScan = async () => {
    if (!imageFile || !activeChild) return;
    setIsProcessing(true);
    setProcessingError(null);
    setStep(4);

    try {
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl.split(',')[1]);
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
          imageMimeType: 'image/jpeg',
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
      setStep(3);
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

  const handleConfirmRedeem = async () => {
    if (!activeChild) return;
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Database connection lost');

      if (isFeedQr) {
        if (activeChild.pet_fed_today) {
          alert(`${activeChild.name}'s Fridge Companion is already fed today!`);
          setStep(5);
          return;
        }

        let updatedChild = { ...activeChild };
        if ((activeChild.pet_food || 0) > 0) {
          updatedChild.pet_food = (activeChild.pet_food || 0) - 1;
        } else if (activeChild.points >= 1) {
          updatedChild.points = activeChild.points - 1;
          updatedChild.food_pot_weekly_contribution = (activeChild.food_pot_weekly_contribution || 0) + 1;
        } else {
          throw new Error('Insufficient points to feed companion');
        }

        updatedChild.pet_fed_today = true;
        updatedChild.pet_unhappy = false;
        updatedChild.last_fed_date = new Date().toISOString().split('T')[0];

        const { error } = await supabase.from('children').update({
          points: updatedChild.points,
          pet_food: updatedChild.pet_food,
          pet_fed_today: updatedChild.pet_fed_today,
          pet_unhappy: updatedChild.pet_unhappy,
          last_fed_date: updatedChild.last_fed_date,
          food_pot_weekly_contribution: updatedChild.food_pot_weekly_contribution
        }).eq('id', activeChild.id);

        if (error) throw error;
      } else if (decodedRewardId === 'blank') {
        if (activeChild.points < writeInCost) {
          throw new Error('Insufficient points to redeem this reward');
        }

        const newRedemption = {
          id: crypto.randomUUID(),
          reward_id: 'blank',
          child_id: activeChild.id,
          parent_id: activeChild.parent_id || 'parent_demo',
          redeemed_at: new Date().toISOString(),
          status: 'delivered',
          payment_source: `write_in:${writeInTitle}`
        };

        const targetChild = {
          ...activeChild,
          points: activeChild.points - writeInCost,
          pet_food: (activeChild.pet_food || 0) + (writeInCost > 0 ? 1 : 0)
        };

        const { error: childErr } = await supabase.from('children').update({
          points: targetChild.points,
          pet_food: targetChild.pet_food
        }).eq('id', activeChild.id);
        if (childErr) throw childErr;

        const { error: redeemErr } = await supabase.from('reward_redemptions').insert(newRedemption);
        if (redeemErr) throw redeemErr;
      } else if (decodedRewardId) {
        const reward = rewards.find(r => r.id === decodedRewardId);
        if (!reward) throw new Error('Reward template not found');

        if (activeChild.points < reward.cost_points) {
          throw new Error('Insufficient points to redeem this reward');
        }

        const newRedemption = {
          id: crypto.randomUUID(),
          reward_id: reward.id,
          child_id: activeChild.id,
          parent_id: activeChild.parent_id || 'parent_demo',
          redeemed_at: new Date().toISOString(),
          status: 'delivered',
          payment_source: 'points'
        };

        const targetChild = {
          ...activeChild,
          points: activeChild.points - reward.cost_points,
          pet_food: (activeChild.pet_food || 0) + (reward.cost_points > 0 ? 1 : 0)
        };

        if (reward.limit_type === 'one_time') {
          const { error: rewardErr } = await supabase.from('rewards').update({ is_available: false }).eq('id', reward.id);
          if (rewardErr) throw rewardErr;
        }

        const { error: childErr } = await supabase.from('children').update({
          points: targetChild.points,
          pet_food: targetChild.pet_food
        }).eq('id', activeChild.id);
        if (childErr) throw childErr;

        const { error: redeemErr } = await supabase.from('reward_redemptions').insert(newRedemption);
        if (redeemErr) throw redeemErr;
      }

      playSound.success();
      setStep(5);
    } catch (err: any) {
      setProcessingError(err?.message ?? 'Failed to complete transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setImageFile(null);
      setImagePreviewUrl(null);
      setDetections([]);
      setProcessingError(null);
      setWeekOffset(0);
      setScanMode(initialMode || 'chart');
      setCameraActive(false);
      setCameraPermissionError(null);
      setScannedPayload(null);
      setDecodedRewardId(null);
      setDecodedChildId(null);
      setIsFeedQr(false);
      setWriteInTitle('');
      setWriteInCost(0);
      setActiveRedeemChildId('');
    }, 300);
  };

  if (!isOpen) return null;

  const targetReward = decodedRewardId ? rewards.find(r => r.id === decodedRewardId) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full sm:max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="h2" className="text-base font-black">
                  {scanMode === 'chart' ? 'Scan Completed Chart' : 'Redeem Reward Card'}
                </Typography>
                <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400">
                  {scanMode === 'chart' ? (
                    step === 1 ? 'Choose child' : step === 2 ? 'Select week' : step === 3 ? 'Upload photo' : step === 4 ? 'Reading chart…' : step === 5 ? 'Review & confirm' : 'Done!'
                  ) : (
                    step === 1 ? 'Scan QR code' : step === 2 ? 'Select child' : step === 3 ? 'Enter details' : step === 4 ? 'Confirm redemption' : 'Done!'
                  )}
                </Typography>
              </div>
            </div>
            <button onClick={handleClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher (Step 1 only) */}
          {step === 1 && (
            <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl gap-1 mx-5 mt-3 shrink-0">
              <button
                onClick={() => {
                  playSound.click();
                  setScanMode('chart');
                  setStep(1);
                }}
                className={`flex-grow py-2 text-[11px] font-bold rounded-xl transition-all ${
                  scanMode === 'chart'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                Scan Chore Chart
              </button>
              <button
                onClick={() => {
                  playSound.click();
                  setScanMode('reward');
                  setStep(1);
                }}
                className={`flex-grow py-2 text-[11px] font-bold rounded-xl transition-all ${
                  scanMode === 'reward'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                Redeem Reward QR
              </button>
            </div>
          )}

          {/* Step indicator */}
          {step < 5 && (
            <div className="flex gap-1.5 px-5 pt-3 shrink-0">
              {([1, 2, 3, 4] as const).map(s => {
                let isActive = s <= step;
                if (scanMode === 'chart' && s === 4 && step === 5) isActive = true;
                return (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${isActive ? 'bg-violet-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                  />
                );
              })}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {/* ===============================================================
                MODE A: CHORE CHART FLOW
                =============================================================== */}
            {scanMode === 'chart' && (
              <>
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
                          {child.id === selectedChildId && <Check className="w-4 h-4 text-violet-550" />}
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
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-violet-400 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-stone-50/50 transition-all min-h-48"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-violet-55 dark:bg-violet-950/30 text-violet-500 flex items-center justify-center shadow-inner">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="font-extrabold text-stone-700 dark:text-stone-200 text-sm">Take Photo / Upload</span>
                          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Tap here to launch camera or choose file</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Loading / Reading Chart */}
                {step === 4 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                    <div>
                      <Typography variant="h3" className="font-black">Analyzing Chore Chart</Typography>
                      <Typography variant="body" className="text-xs text-stone-400 mt-1">Gemini AI is validating physical gold stars...</Typography>
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Confirm */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Detections for {activeChild?.name}:</p>
                      <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-full border border-violet-100/55 text-xs font-black">
                        <Coins className="w-3.5 h-3.5" /> +{totalCoins} Coins
                      </div>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {detections.map((d, index) => (
                        <div
                          key={index}
                          onClick={() => toggleDetection(index)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            d.alreadyCompleted
                              ? 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-800 opacity-60'
                              : d.confirmed
                                ? 'bg-violet-50 border-violet-200 dark:bg-violet-950/20 dark:border-violet-900/60 shadow-sm'
                                : 'bg-white border-stone-100 dark:bg-stone-900 dark:border-stone-800 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                              d.alreadyCompleted
                                ? 'bg-stone-100 text-stone-400'
                                : d.confirmed
                                  ? 'bg-violet-100 text-violet-600'
                                  : 'bg-stone-100 text-stone-500'
                            }`}>
                              {DAY_NAMES[d.dayIndex][0]}
                            </div>
                            <div>
                              <span className="font-extrabold text-stone-800 dark:text-stone-100 text-sm line-clamp-1">{d.taskTitle}</span>
                              <span className="text-[10px] text-stone-400 font-medium">
                                {d.alreadyCompleted ? 'Already scanned' : `Confidence: ${Math.round(d.confidence * 100)}%`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <CoinBadge points={d.task?.points ?? 10} size="sm" />
                            {!d.alreadyCompleted && (
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                d.confirmed
                                  ? 'bg-violet-500 border-violet-600 text-white'
                                  : 'border-stone-300 dark:border-stone-700 bg-white'
                              }`}>
                                {d.confirmed && <Check className="w-3.5 h-3.5" />}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: Scan Done Success */}
                {step === 6 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center shadow-lg relative">
                      <CheckCircle2 className="w-12 h-12" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-emerald-500"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </div>
                    <div>
                      <Typography variant="h2" className="font-black text-emerald-600 dark:text-emerald-500 text-lg">Scan Confirmed!</Typography>
                      <Typography variant="body" className="text-sm text-stone-600 dark:text-stone-300 mt-2 font-semibold">
                        Added <strong>{totalCoins} gold coins</strong> to {activeChild?.name}'s balance.
                      </Typography>
                      <Typography variant="helper" className="text-xs text-stone-400 mt-1 block">
                        They can now allocate physical coins into their pots wallet!
                      </Typography>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===============================================================
                MODE B: REWARD REDEMPTION FLOW (QR SCANNER)
                =============================================================== */}
            {scanMode === 'reward' && (
              <>
                {/* Step 1: Scan QR Code */}
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Point the camera at the QR code on the physical reward card or Food Pot.</p>

                    {processingError && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-3.5 flex items-start gap-2 text-red-700 dark:text-red-300 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{processingError}</span>
                      </div>
                    )}

                    {cameraPermissionError && !cameraActive && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 flex items-start gap-2 text-amber-700 dark:text-amber-300 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{cameraPermissionError}</span>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {cameraActive ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-violet-400 dark:border-violet-600 shadow-md">
                        <video
                          ref={videoRef}
                          className="w-full bg-black object-cover max-h-64 scale-x-[-1]"
                          autoPlay
                          playsInline
                        />
                        {/* Overlay scan target frame */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-36 h-36 border-4 border-dashed border-violet-400 rounded-2xl animate-pulse flex items-center justify-center">
                            <div className="w-32 h-32 border-2 border-solid border-white/20 rounded-xl" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <span className="text-[10px] bg-stone-900/80 text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                            📷 Live Scanning Active
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-violet-400 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-stone-50/50 transition-all min-h-48"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                            <span className="font-extrabold text-stone-700 dark:text-stone-200 text-sm">Decoding photo...</span>
                          </>
                        ) : (
                          <>
                            <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-violet-500 flex items-center justify-center shadow-inner">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                              <span className="font-extrabold text-stone-700 dark:text-stone-200 text-sm">Upload QR Card Image</span>
                              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Tap here to choose a photo of the card QR code</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Select Child */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                      {isFeedQr ? 'Which child is feeding the pet?' : 'Whose reward is this?'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => {
                            playSound.click();
                            setActiveRedeemChildId(child.id);
                            if (isFeedQr) {
                              setStep(4);
                            } else if (decodedRewardId === 'blank') {
                              setStep(3);
                            } else {
                              setStep(4);
                            }
                          }}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 hover:border-violet-300 hover:bg-violet-50/10 transition-all"
                        >
                          <ChildAvatar iconName={child.avatar_url || 'Smile'} className="w-12 h-12 rounded-2xl" />
                          <span className="text-sm font-extrabold text-stone-800 dark:text-stone-100">{child.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Write-In Blank Card Form */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 rounded-2xl p-4 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-extrabold text-sm text-purple-900 dark:text-purple-200">Write-in Reward Card Scanned</span>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Please enter the title and coin cost written on the physical card by the parent.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-stone-500 uppercase pl-1 block mb-1">Reward Name</label>
                        <input
                          type="text"
                          value={writeInTitle}
                          onChange={(e) => setWriteInTitle(e.target.value)}
                          placeholder="e.g. 30 Mins Extra Video Game Time"
                          className="w-full px-4 py-3 rounded-xl border border-stone-250 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-500 uppercase pl-1 block mb-1">Coin Cost</label>
                        <input
                          type="number"
                          value={writeInCost || ''}
                          onChange={(e) => setWriteInCost(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="e.g. 10"
                          className="w-full px-4 py-3 rounded-xl border border-stone-250 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirm Redemption */}
                {step === 4 && activeChild && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Confirm details before completing transaction:</p>

                    {processingError && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-3.5 flex items-start gap-2 text-red-700 dark:text-red-300 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{processingError}</span>
                      </div>
                    )}

                    {/* Card Preview block */}
                    <div className="border border-stone-200 dark:border-stone-800 rounded-3xl p-5 bg-white dark:bg-stone-900 shadow-sm flex flex-col items-center text-center gap-3">
                      <ChildAvatar iconName={activeChild.avatar_url || 'Smile'} className="w-14 h-14 rounded-2xl" />
                      <div>
                        <Typography variant="h3" className="font-extrabold text-stone-900 dark:text-stone-50">
                          {isFeedQr ? 'Feed companion' : decodedRewardId === 'blank' ? writeInTitle : targetReward?.title}
                        </Typography>
                        <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {isFeedQr ? `Feed ${activeChild.name}'s Fridge Companion` : `Redemption for ${activeChild.name}`}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60 px-4 py-2 rounded-2xl mt-1">
                        <Coins className="w-4 h-4 text-violet-500" />
                        <span className="font-black text-sm text-violet-600 dark:text-violet-400">
                          {isFeedQr ? '1 Coin' : `${decodedRewardId === 'blank' ? writeInCost : (targetReward?.cost_points ?? 0)} Coins`}
                        </span>
                      </div>
                    </div>

                    {/* Balance Sheet Check */}
                    <div className="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                      <div className="flex justify-between">
                        <span>{activeChild.name}'s Point Balance:</span>
                        <span>🪙 {activeChild.points} Coins</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                        <span>Redemption Cost:</span>
                        <span className="text-rose-500 font-bold">
                          - 🪙 {isFeedQr ? 1 : decodedRewardId === 'blank' ? writeInCost : (targetReward?.cost_points ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 font-black text-stone-900 dark:text-stone-100 text-sm">
                        <span>Remaining Balance:</span>
                        <span className={activeChild.points < (isFeedQr ? 1 : decodedRewardId === 'blank' ? writeInCost : (targetReward?.cost_points ?? 0)) ? 'text-rose-600' : 'text-emerald-600'}>
                          🪙 {activeChild.points - (isFeedQr ? 1 : decodedRewardId === 'blank' ? writeInCost : (targetReward?.cost_points ?? 0))} Coins
                        </span>
                      </div>
                    </div>

                    {activeChild.points < (isFeedQr ? 1 : decodedRewardId === 'blank' ? writeInCost : (targetReward?.cost_points ?? 0)) && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-3.5 flex items-start gap-2 text-red-700 dark:text-red-300 text-xs font-bold leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Insufficient Coins! {activeChild.name} does not have enough digital coins in their wallet. Make sure they have deposited the coins before scanning!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Done (Redemption Success) */}
                {step === 5 && activeChild && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center shadow-lg relative animate-bounce">
                      <CheckCircle2 className="w-12 h-12" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-emerald-500"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </div>
                    <div>
                      <Typography variant="h2" className="font-black text-emerald-600 dark:text-emerald-500 text-lg">
                        {isFeedQr ? 'Companion Fed!' : 'Reward Redeemed!'}
                      </Typography>
                      <Typography variant="body" className="text-sm text-stone-600 dark:text-stone-300 mt-2 font-semibold leading-relaxed">
                        {isFeedQr ? (
                          `Deducted 1 coin and successfully fed ${activeChild.name}'s Fridge Companion!`
                        ) : (
                          <>
                            Successfully redeemed <strong>{decodedRewardId === 'blank' ? writeInTitle : targetReward?.title}</strong> for {activeChild.name}!
                          </>
                        )}
                      </Typography>
                      <Typography variant="helper" className="text-xs text-stone-400 mt-1 block">
                        Deducted {isFeedQr ? 1 : decodedRewardId === 'blank' ? writeInCost : (targetReward?.cost_points ?? 0)} points from their balance.
                      </Typography>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer actions */}
          <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800 shrink-0 flex gap-3">
            {/* BACK BUTTON */}
            {step > 1 && step !== 5 && (scanMode === 'chart' ? step !== 6 : true) && (
              <Button
                variant="secondary"
                onClick={() => {
                  playSound.click();
                  setStep(s => {
                    if (scanMode === 'reward') {
                      if (s === 4) {
                        return decodedRewardId === 'blank' ? 3 : (decodedChildId ? 1 : 2) as Step;
                      }
                      if (s === 3) {
                        return (decodedChildId ? 1 : 2) as Step;
                      }
                      return (s - 1) as Step;
                    }
                    return (s - 1) as Step;
                  });
                }}
                className="flex-1 justify-center"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}

            {/* MODE A: CHORE CHART FLOW ACTIONS */}
            {scanMode === 'chart' && (
              <>
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
              </>
            )}

            {/* MODE B: REWARD SCANNER FLOW ACTIONS */}
            {scanMode === 'reward' && (
              <>
                {step === 1 && !cameraActive && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCameraPermissionError(null);
                      setCameraActive(true);
                    }}
                    className="flex-grow justify-center"
                  >
                    <Camera className="w-4 h-4" /> Turn Camera On
                  </Button>
                )}

                {step === 3 && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      playSound.click();
                      if (!writeInTitle.trim() || writeInCost <= 0) {
                        alert('Please fill in both the Reward Name and a Coin Cost greater than 0.');
                        return;
                      }
                      setStep(4);
                    }}
                    className="flex-1 justify-center"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {step === 4 && activeChild && (
                  <Button
                    variant="purple"
                    onClick={handleConfirmRedeem}
                    className="flex-grow justify-center"
                    disabled={isProcessing || activeChild.points < (isFeedQr ? 1 : decodedRewardId === 'blank' ? writeInCost : (targetReward?.cost_points ?? 0))}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Confirm & Deduct Balance
                      </>
                    )}
                  </Button>
                )}

                {step === 5 && (
                  <Button variant="purple" onClick={handleClose} className="flex-grow justify-center">
                    Close
                  </Button>
                )}
              </>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
