import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Printer, Coins, ChevronLeft, ChevronRight, Check,
  Sparkles, Wallet, HelpCircle, FileText
} from 'lucide-react';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';
import { ChildAvatar } from './ChildAvatar';
import { playSound } from '../utils/sound';
import { Child } from '../types';
import { getCharacterStage } from '../data/characters';


interface PrintAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
}

type Step = 1 | 2 | 3; // 1: Asset Type Selection, 2: Child Selection (for companion), 3: Print Preview & Print
type AssetType = 'coins' | 'companion' | 'wallet' | 'blank_rewards';

export function PrintAssetsModal({
  isOpen,
  onClose,
  childrenList
}: PrintAssetsModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');

  const activeChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];

  const handleAssetSelect = (type: AssetType) => {
    playSound.click();
    setSelectedAsset(type);
    if (type === 'companion') {
      setStep(2); // Companion sheet requires choosing which child
    } else {
      setStep(3); // Other assets go straight to print preview
    }
  };

  const getPrintUrl = () => {
    if (!selectedAsset) return '#';
    let url = `/print.html?asset=${selectedAsset}`;

    if (selectedAsset === 'companion' && activeChild) {
      const activeStage = getCharacterStage(activeChild.character_id, activeChild.level);
      url += `&childName=${encodeURIComponent(activeChild.name)}`
           + `&level=${activeChild.level}`
           + `&characterId=${activeChild.character_id}`
           + `&stageName=${encodeURIComponent(activeStage.name)}`
           + `&modelUrl=${encodeURIComponent(activeStage.model_url)}`;
    } else if (selectedAsset === 'wallet' && activeChild) {
      url += `&childName=${encodeURIComponent(activeChild.name)}`
           + `&childId=${activeChild.id}`;
    }
    return url;
  };

  const handleClose = () => {
    playSound.click();
    setStep(1);
    setSelectedAsset(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="h2" className="text-base font-black">Print Game Assets</Typography>
                <Typography variant="helper" className="text-xs text-stone-500 dark:text-stone-400">
                  {step === 1 ? 'Choose what to print' : step === 2 ? 'Select child' : 'Confirm and Print'}
                </Typography>
              </div>
            </div>
            <button onClick={handleClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-1.5 px-5 pt-3 shrink-0">
            {([1, 2, 3] as const).map(s => {
              // Hide step 2 (child selection) if we are printing coins/wallet/blank cards
              if (s === 2 && selectedAsset && selectedAsset !== 'companion') return null;
              
              let isActive = s <= step;
              if (step === 3 && selectedAsset !== 'companion' && s === 2) isActive = true;

              return (
                <div
                  key={s}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${isActive ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                />
              );
            })}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Step 1: Asset Type Selection */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300 mb-2">What physical game assets would you like to print?</p>
                
                {/* 1. Quest Coins */}
                <button
                  onClick={() => handleAssetSelect('coins')}
                  className="w-full p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-left flex items-start gap-4 hover:bg-emerald-50/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <Typography variant="h3" className="font-extrabold text-stone-800 dark:text-stone-100">Quest Coins Sheet</Typography>
                    <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-normal">
                      Print double-sided sheet of gold coins (denominations: 1, 5, 10, 20, 50).
                    </Typography>
                  </div>
                </button>

                {/* 2. Fridge Companion evolution sheet */}
                <button
                  onClick={() => handleAssetSelect('companion')}
                  className="w-full p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-left flex items-start gap-4 hover:bg-emerald-50/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <Typography variant="h3" className="font-extrabold text-stone-800 dark:text-stone-100">Fridge Companion Sheet</Typography>
                    <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-normal">
                      A beautiful centerpiece tracking the pet's current evolution and level.
                    </Typography>
                  </div>
                </button>

                {/* 3. Pots Wallet */}
                <button
                  onClick={() => handleAssetSelect('wallet')}
                  className="w-full p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-left flex items-start gap-4 hover:bg-emerald-50/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/20 text-teal-500 flex items-center justify-center shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <Typography variant="h3" className="font-extrabold text-stone-800 dark:text-stone-100">Foldable Pots Wallet</Typography>
                    <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-normal">
                      A fold-and-tape cardboard organizer box to hold physical pot savings.
                    </Typography>
                  </div>
                </button>

                {/* 4. Blank Reward Cards */}
                <button
                  onClick={() => handleAssetSelect('blank_rewards')}
                  className="w-full p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-left flex items-start gap-4 hover:bg-emerald-50/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-500 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <Typography variant="h3" className="font-extrabold text-stone-800 dark:text-stone-100">Blank Reward Cards</Typography>
                    <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-normal">
                      Write-in cards with QR codes for custom, off-the-cuff family rewards.
                    </Typography>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: Child Selection (Companion Sheet Only) */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Which child is this companion sheet for?</p>
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

            {/* Step 3: Print Preview / Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Ready to print?</p>
                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 flex flex-col items-center text-center gap-3">
                  {selectedAsset === 'coins' && (
                    <>
                      <Coins className="w-12 h-12 text-amber-500" />
                      <div>
                        <Typography variant="h3" className="font-extrabold">Quest Coins Page</Typography>
                        <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Prints values 1, 5, 10, 20, and 50 gold coins.
                        </Typography>
                      </div>
                    </>
                  )}
                  {selectedAsset === 'companion' && activeChild && (
                    <>
                      <ChildAvatar iconName={activeChild.avatar_url || 'Smile'} className="w-12 h-12 rounded-2xl" />
                      <div>
                        <Typography variant="h3" className="font-extrabold">{activeChild.name}'s Companion Sheet</Typography>
                        <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Prints the evolution milestone sheet for their current level.
                        </Typography>
                      </div>
                    </>
                  )}
                  {selectedAsset === 'wallet' && (
                    <>
                      <Wallet className="w-12 h-12 text-teal-500" />
                      <div>
                        <Typography variant="h3" className="font-extrabold">Pots Pocket Wallet</Typography>
                        <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Prints a craft sheet with folding templates and a Food Pot QR code.
                        </Typography>
                      </div>
                    </>
                  )}
                  {selectedAsset === 'blank_rewards' && (
                    <>
                      <FileText className="w-12 h-12 text-purple-500" />
                      <div>
                        <Typography variant="h3" className="font-extrabold">Blank Write-In Reward Cards</Typography>
                        <Typography variant="body" className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Prints 8 pocket-sized trading cards with write-in areas and redeem QRs.
                        </Typography>
                      </div>
                    </>
                  )}
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                  <strong>Tip:</strong> Print on high-quality paper or cardstock for the best physical board-game feel!
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-5 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800 shrink-0 flex gap-3">
            {step > 1 && (
              <Button variant="secondary" onClick={() => { playSound.click(); setStep(s => (s === 3 && selectedAsset !== 'companion' ? 1 : s - 1) as Step); }} className="flex-1 justify-center">
                <ChevronLeft className="w-4 h-4" /> Back
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
              <a
                href={getPrintUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  playSound.click();
                  handleClose();
                }}
                className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all text-center"
              >
                <Printer className="w-4 h-4" /> Print Asset
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
