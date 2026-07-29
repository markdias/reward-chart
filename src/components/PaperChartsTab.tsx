import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { Child, Task, TaskCompletion, Reward, RewardRedemption } from '../types';
import { playSound } from '../utils/sound';
import { Camera, Printer, CheckCircle2, Gift, Coins } from 'lucide-react';

// Modals
import { PrintTaskChartModal } from './PrintTaskChartModal';
import { ScanChartModal } from './ScanChartModal';
import { PrintRewardsChartModal } from './PrintRewardsChartModal';
import { PrintAssetsModal } from './PrintAssetsModal';

interface PaperChartsTabProps {
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  isPro: boolean;
  onOpenPaywall: (featureId: string) => void;
  onParentCompleteTask: (taskId: string, childId: string, dateIso: string) => void;
  onParentCompleteTasks?: (items: {taskId: string, childId: string, dateIso?: string}[]) => void;
  onParentRedeemRewards: (items: {rewardId: string, childId: string, dateIso: string}[]) => void;
  onFeedPet?: (childId: string) => Promise<void>;
}

export default function PaperChartsTab({
  children,
  tasks,
  completions,
  rewards,
  redemptions,
  isPro,
  onOpenPaywall,
  onParentCompleteTask,
  onParentCompleteTasks,
  onParentRedeemRewards,
  onFeedPet
}: PaperChartsTabProps) {
  // Modal states
  const [showPrintTaskModal, setShowPrintTaskModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPrintRewardModal, setShowPrintRewardModal] = useState(false);
  const [showPrintAssetsModal, setShowPrintAssetsModal] = useState(false);

  const handleScanChart = () => {
    playSound.click();
    if (isPro) {
      setShowScanModal(true);
    } else {
      onOpenPaywall('scan-chart');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12 sm:pb-8 relative">
      <div className="flex items-center gap-3 mb-2 px-2 sm:px-0">
        <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
          <Printer className="w-6 h-6" />
        </div>
        <div>
          <Typography variant="h2" className="font-black uppercase tracking-wide text-stone-900 dark:text-stone-50">
            Paper Charts & Assets
          </Typography>
          <Typography variant="body" className="text-sm text-stone-500 dark:text-stone-400">
            Print charts, coins, and wallets for the fridge, and scan them when finished.
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0 mt-4">
        
        {/* PRINT STATION */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-650 flex items-center justify-center">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-100">
                Print Station
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">
                Generate and print physical assets for your home
              </Typography>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="secondary" 
              id="tour-paper-print"
              className="w-full flex justify-start items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800 border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
              onClick={() => { playSound.click(); setShowPrintTaskModal(true); }}
            >
              <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-stone-800 dark:text-stone-200">Print Chore Chart</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-normal">Generate a weekly fridge chart to check off daily tasks</div>
              </div>
            </Button>

            <Button 
              variant="secondary" 
              className="w-full flex justify-start items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800 border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
              onClick={() => { playSound.click(); setShowPrintRewardModal(true); }}
            >
              <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
                <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-stone-800 dark:text-stone-200">Print Reward Cards</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-normal">Print active assigned rewards as physical trading cards</div>
              </div>
            </Button>

            <Button 
              variant="secondary" 
              className="w-full flex justify-start items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800 border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
              onClick={() => { playSound.click(); setShowPrintAssetsModal(true); }}
            >
              <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-stone-800 dark:text-stone-200">Print Game Assets</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-normal font-sans">Coins, companion sheets & pockets</div>
              </div>
            </Button>
          </div>
        </div>

        {/* SCANNER STATION */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-100">
                Scanner Station
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">
                Sync physical items back to your digital account
              </Typography>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="secondary" 
              id="tour-paper-scan"
              className="w-full flex justify-start items-center gap-3 p-4 bg-sky-50/50 hover:bg-sky-100/50 dark:bg-sky-900/10 dark:hover:bg-sky-900/20 border-transparent hover:border-sky-100 dark:hover:border-sky-800 transition-all"
              onClick={handleScanChart}
            >
              <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
                <Camera className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-sky-900 dark:text-sky-100 flex items-center gap-2">
                  Open Camera Scanner
                  {!isPro && <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-black bg-amber-100 text-amber-700 rounded-full">PRO</span>}
                </div>
                <div className="text-xs text-sky-650/85 dark:text-sky-400/85 font-normal font-sans">Scan completed chore charts or redeem reward QR codes</div>
              </div>
            </Button>
          </div>
        </div>

      </div>

      {/* Modals */}
      <PrintTaskChartModal
        isOpen={showPrintTaskModal}
        onClose={() => setShowPrintTaskModal(false)}
        tasks={tasks}
        completions={completions}
        childrenList={children}
      />
      
      {showScanModal && (
        <ScanChartModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          children={children}
          tasks={tasks}
          completions={completions}
          rewards={rewards}
          onParentCompleteTask={onParentCompleteTask}
          onParentCompleteTasks={onParentCompleteTasks}
          onParentRedeemRewards={onParentRedeemRewards}
          onFeedPet={onFeedPet}
        />
      )}

      {showPrintRewardModal && (
        <PrintRewardsChartModal
          isOpen={showPrintRewardModal}
          onClose={() => setShowPrintRewardModal(false)}
          childrenList={children}
          rewards={rewards}
        />
      )}

      <PrintAssetsModal
        isOpen={showPrintAssetsModal}
        onClose={() => setShowPrintAssetsModal(false)}
        childrenList={children}
      />
    </div>
  );
}

