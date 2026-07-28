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
import { ScanRewardsChartModal } from './ScanRewardsChartModal';
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
  onParentRedeemRewards
}: PaperChartsTabProps) {
  // Modal states
  const [showPrintTaskModal, setShowPrintTaskModal] = useState(false);
  const [showScanTaskModal, setShowScanTaskModal] = useState(false);
  const [showPrintRewardModal, setShowPrintRewardModal] = useState(false);
  const [showScanRewardModal, setShowScanRewardModal] = useState(false);
  const [showPrintAssetsModal, setShowPrintAssetsModal] = useState(false);

  const handleScanChart = () => {
    playSound.click();
    if (isPro) {
      setShowScanTaskModal(true);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0 mt-4">
        
        {/* TASK CHART SECTION */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-100">
                Chore Charts
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">
                Track daily tasks and routines
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
                <Printer className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-stone-800 dark:text-stone-200">Print Chore Chart</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-normal">Generate a printable PDF</div>
              </div>
            </Button>

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
                  Scan Completed Chart
                  {!isPro && <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-black bg-amber-100 text-amber-700 rounded-full">PRO</span>}
                </div>
                <div className="text-xs text-sky-600/70 dark:text-sky-400/70 font-normal">Use AI to digitize handwritten progress</div>
              </div>
            </Button>
          </div>
        </div>

        {/* REWARD CHART SECTION */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-100">
                Reward Charts
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">
                Track points towards assigned prizes
              </Typography>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full flex justify-start items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800 border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
              onClick={() => { playSound.click(); setShowPrintRewardModal(true); }}
            >
              <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
                <Printer className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-stone-800 dark:text-stone-200">Print Reward Chart</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-normal">Print a grid of active rewards</div>
              </div>
            </Button>

            <Button 
              variant="secondary" 
              className="w-full flex justify-start items-center gap-3 p-4 bg-purple-50/50 hover:bg-purple-100/50 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 border-transparent hover:border-purple-100 dark:hover:border-purple-800 transition-all"
              onClick={() => { playSound.click(); setShowScanRewardModal(true); }}
            >
              <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
                <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-purple-900 dark:text-purple-100">
                  Scan Claimed Rewards
                </div>
                <div className="text-xs text-purple-600/70 dark:text-purple-400/70 font-normal">Deduct coins for redeemed rewards</div>
              </div>
            </Button>
          </div>
        </div>

        {/* GAME ASSETS SECTION */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold text-stone-900 dark:text-stone-100">
                Game Assets
              </Typography>
              <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400">
                Print physical coins and wallets
              </Typography>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full flex justify-start items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800 border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
              onClick={() => { playSound.click(); setShowPrintAssetsModal(true); }}
            >
              <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
                <Printer className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm text-stone-800 dark:text-stone-200">Print Game Assets</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 font-normal">Coins, companion sheets & pockets</div>
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
      
      {showScanTaskModal && (
        <ScanChartModal
          isOpen={showScanTaskModal}
          onClose={() => setShowScanTaskModal(false)}
          children={children}
          tasks={tasks}
          completions={completions}
          onParentCompleteTask={onParentCompleteTask}
          onParentCompleteTasks={onParentCompleteTasks}
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

      {showScanRewardModal && (
        <ScanRewardsChartModal
          isOpen={showScanRewardModal}
          onClose={() => setShowScanRewardModal(false)}
          children={children}
          rewards={rewards}
          redemptions={redemptions}
          onParentRedeemRewards={onParentRedeemRewards}
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

