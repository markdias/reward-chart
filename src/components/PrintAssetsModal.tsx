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

  const handleExecutePrint = () => {
    playSound.click();
    if (!selectedAsset) return;

    let htmlContent = '';
    const printWindow = window.open('', '_blank');

    if (selectedAsset === 'coins') {
      const coinDefs = [
        ...Array(12).fill(1),
        ...Array(8).fill(5),
        ...Array(6).fill(10),
        ...Array(6).fill(20),
        ...Array(4).fill(50)
      ];

      const getCoinEmblemSvg = (val: number) => {
        switch (val) {
          case 1:
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2" class="coin-emblem"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
          case 5:
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#78350f" class="coin-emblem"><circle cx="9" cy="14" r="2.5"/><circle cx="15" cy="14" r="2.5"/><circle cx="7" cy="9" r="2.5"/><circle cx="17" cy="9" r="2.5"/><path d="M12 11c-2.5 0-4 1.5-4 4 0 2 1.5 3 4 3s4-1 4-3c0-2.5-1.5-4-4-4z"/></svg>`;
          case 10:
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2" class="coin-emblem"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>`;
          case 20:
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2" class="coin-emblem"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7z"/></svg>`;
          case 50:
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2" class="coin-emblem"><path d="M22 19V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2zM2 13h20M12 7v6"/></svg>`;
          default:
            return '';
        }
      };

      const coinsHtml = coinDefs.map(value => `
        <div class="coin-card">
          <div class="coin-wrapper">
            <div class="coin coin-${value}">
              <div class="emblem-wrapper">
                ${getCoinEmblemSvg(value)}
              </div>
              <div class="coin-inner">
                <span class="coin-value">${value}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quest Sync — Gold Coins Stash</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: portrait; margin: 1.2cm 1cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito', sans-serif;
      background: white;
      color: #1c1917;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
      border-bottom: 3px double #e7e5e4;
      padding-bottom: 12px;
    }
    .title {
      font-size: 24px;
      font-weight: 900;
      color: #7c2d12;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #78716c;
      margin-top: 4px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      justify-items: center;
      align-items: center;
    }
    .coin-card {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    .coin-wrapper {
      border: 1.5px dashed #a8a29e;
      border-radius: 50%;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }

    .coin {
      position: relative;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fef08a 0%, #fbbf24 30%, #f59e0b 70%, #d97706 100%);
      box-shadow: inset 0 3px 6px rgba(255,255,255,0.6), 0 3px 6px rgba(180, 83, 9, 0.3), 0 0 0 2px #d97706;
      border: 2px solid #b45309;
    }
    /* Sizes based on denominations */
    .coin-1 { width: 48px; height: 48px; }
    .coin-5 { width: 54px; height: 54px; }
    .coin-10 { width: 60px; height: 60px; }
    .coin-20 { width: 66px; height: 66px; }
    .coin-50 { width: 72px; height: 72px; }

    .coin-inner {
      width: 82%;
      height: 82%;
      border-radius: 50%;
      border: 2px dashed rgba(254, 240, 138, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .coin-value {
      font-size: 16px;
      font-weight: 900;
      color: #78350f;
      text-shadow: 0 1px 0 rgba(255,255,255,0.4);
      z-index: 10;
    }
    /* Value font sizing scaling */
    .coin-1 .coin-value { font-size: 14px; }
    .coin-5 .coin-value { font-size: 17px; }
    .coin-10 .coin-value { font-size: 20px; }
    .coin-20 .coin-value { font-size: 22px; }
    .coin-50 .coin-value { font-size: 24px; }

    .emblem-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50%;
      height: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.18;
      pointer-events: none;
      z-index: 1;
    }
    .coin-emblem {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Quest Sync — Gold Coins Stash</div>
    <div class="subtitle">✂️ Cut along the circular dashed lines. Tip: Print on thick cardstock or paper!</div>
  </div>
  <div class="grid">
    ${coinsHtml}
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
    } else if (selectedAsset === 'companion' && activeChild) {
      const activeStage = getCharacterStage(activeChild.character_id, activeChild.level);
      const petPack = activeChild.character_id === 'sparky' ? 'Emerald Dragon' : 'Companion';
      const modelUrl = window.location.origin + activeStage.model_url;

      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fridge Companion — ${activeChild.name}</title>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
  <style>
    @page { size: portrait; margin: 1.5cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito', sans-serif;
      background: white;
      color: #292524;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .poster {
      width: 100%;
      max-width: 550px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px;
      border: 1px dashed #d6d3d1;
      border-radius: 24px;
    }
    .header {
      margin-bottom: 24px;
    }
    .owner-label {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #78716c;
      margin-bottom: 8px;
    }
    .companion-name {
      font-size: 32px;
      font-weight: 900;
      color: #1c1917;
      margin-bottom: 6px;
    }
    .stage-level {
      font-size: 16px;
      font-weight: 700;
      color: #d97706;
    }
    
    .viewer-container {
      width: 360px;
      height: 360px;
      margin: 15px 0;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    model-viewer {
      width: 100%;
      height: 100%;
      --poster-color: transparent;
    }
    
    .footer {
      margin-top: 24px;
      font-size: 12px;
      font-weight: 800;
      color: #a8a29e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-top: 1px dashed #f5f5f4;
      width: 100%;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="header">
      <div class="owner-label">${activeChild.name}'s Fridge Companion</div>
      <div class="companion-name">${petPack}</div>
      <div class="stage-level">${activeStage.name} • Level ${activeChild.level}</div>
    </div>

    <div class="viewer-container">
      <model-viewer
        src="${modelUrl}"
        alt="3D Companion Character"
        auto-rotate
        camera-controls
        interaction-prompt="none"
        shadow-intensity="1.5"
        shadow-softness="1"
      ></model-viewer>
    </div>

    <div class="footer">
      Quest Sync Companion Poster
    </div>
  </div>
  <script>
    // Delay printing to allow the 3D model to load in the browser frame
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 2000);
    }
  </script>
</body>
</html>`;
    } else if (selectedAsset === 'wallet') {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Foldable Pots Wallet — ${activeChild.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: landscape; margin: 1cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Nunito', sans-serif;
      background: white;
      color: #292524;
      padding: 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .container {
      display: flex;
      gap: 30px;
      height: 100%;
      align-items: stretch;
    }
    .instructions {
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 10px;
      text-align: right;
      color: #78716c;
    }
    
    .backing-board {
      width: 320px;
      border: 8px double #1c1917;
      border-radius: 20px;
      padding: 20px;
      background: #fafaf9;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .board-title {
      font-size: 18px;
      font-weight: 900;
      color: #7c2d12;
      text-align: center;
      margin-bottom: 5px;
    }
    .board-child {
      font-size: 11px;
      font-weight: 800;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: -12px;
      margin-bottom: 8px;
    }
    .board-slot {
      width: 100%;
      height: 72px;
      border: 2px dashed #d6d3d1;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f5f5f4;
      position: relative;
    }
    .board-slot-title {
      font-size: 12px;
      font-weight: 900;
      opacity: 0.35;
    }

    .nets-area {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .net-card {
      border: 1px dashed #d6d3d1;
      border-radius: 12px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fdfbf7;
      position: relative;
    }
    .net-label {
      position: absolute;
      top: 5px;
      left: 8px;
      font-size: 9px;
      font-weight: 800;
      color: #a8a29e;
      text-transform: uppercase;
    }
    
    .pocket-net {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .pocket-row {
      display: flex;
      align-items: center;
    }
    
    .pocket-center {
      width: 110px;
      height: 60px;
      border: 2px solid #292524;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
      color: white;
      text-align: center;
      border-radius: 4px;
      position: relative;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
    }
    
    .tab {
      background: #e7e5e4;
      border: 1px dashed #78716c;
      font-size: 7px;
      font-weight: 800;
      color: #78716c;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
    }
    .tab-left {
      width: 20px;
      height: 54px;
      border-right: none;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    .tab-right {
      width: 20px;
      height: 54px;
      border-left: none;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    .tab-bottom {
      width: 110px;
      height: 15px;
      border-top: none;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    .theme-gold { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); }
    .theme-savings { background: linear-gradient(135deg, #34d399 0%, #059669 100%); }
    .theme-food { background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%); color: white; }
    .theme-gifting { background: linear-gradient(135deg, #f472b6 0%, #db2777 100%); }
    
    .pocket-qr {
      width: 44px;
      height: 44px;
      background: white;
      padding: 2px;
      border-radius: 4px;
      margin-top: 4px;
      border: 1px solid #1e3a8a;
    }

    .cut-line-desc {
      font-size: 8px;
      color: #dc2626;
      margin-top: 2px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="instructions">
    <div>🔴 <strong>Dotted lines:</strong> Cut here</div>
    <div>⚫ <strong>Solid lines:</strong> Fold here</div>
    <div>🧴 <strong>Grey tabs:</strong> Fold backward & tape to the Board slots</div>
  </div>
  
  <div class="container">
    <div class="backing-board">
      <div class="board-title">Quest Pots Wallet</div>
      <div class="board-child">${activeChild.name}'s Fridge Board</div>
      
      <div class="board-slot">
        <span class="board-slot-title" style="color: #d97706">🟡 Spending Pot Slot</span>
      </div>
      <div class="board-slot">
        <span class="board-slot-title" style="color: #059669">🟢 Savings Pot Slot</span>
      </div>
      <div class="board-slot">
        <span class="board-slot-title" style="color: #2563eb">🔵 Feeding Pot Slot</span>
      </div>
      <div class="board-slot">
        <span class="board-slot-title" style="color: #db2777">🔴 Gifting Pot Slot</span>
      </div>
    </div>

    <div class="nets-area">
      <div class="net-card">
        <span class="net-label">1. Spending Pot Net</span>
        <div class="pocket-net">
          <div class="pocket-row">
            <div class="tab tab-left">Glue</div>
            <div class="pocket-center theme-gold">
              <span>🟡 Spending</span>
              <span style="font-size: 8px; font-weight: normal; opacity: 0.9;">Gold Pot</span>
            </div>
            <div class="tab tab-right">Glue</div>
          </div>
          <div class="tab tab-bottom">Glue / Tape Tab</div>
          <span class="cut-line-desc">✂️ Cut outer red dotted boundary</span>
        </div>
      </div>

      <div class="net-card">
        <span class="net-label">2. Savings Pot Net</span>
        <div class="pocket-net">
          <div class="pocket-row">
            <div class="tab tab-left">Glue</div>
            <div class="pocket-center theme-savings">
              <span>🟢 Saving</span>
              <span style="font-size: 8px; font-weight: normal; opacity: 0.9;">Savings Pot</span>
            </div>
            <div class="tab tab-right">Glue</div>
          </div>
          <div class="tab tab-bottom">Glue / Tape Tab</div>
          <span class="cut-line-desc">✂️ Cut outer red dotted boundary</span>
        </div>
      </div>

      <div class="net-card">
        <span class="net-label">3. Feeding Pot Net</span>
        <div class="pocket-net">
          <div class="pocket-row">
            <div class="tab tab-left">Glue</div>
            <div class="pocket-center theme-food">
              <span>🔵 Feeding Pot</span>
              <img class="pocket-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('questsync://feed?childId=' + activeChild.id)}" alt="Feed QR" />
            </div>
            <div class="tab tab-right">Glue</div>
          </div>
          <div class="tab tab-bottom">Glue / Tape Tab</div>
          <span class="cut-line-desc">✂️ Cut outer red dotted boundary</span>
        </div>
      </div>

      <div class="net-card">
        <span class="net-label">4. Gifting Pot Net</span>
        <div class="pocket-net">
          <div class="pocket-row">
            <div class="tab tab-left">Glue</div>
            <div class="pocket-center theme-gifting">
              <span>🔴 Giving</span>
              <span style="font-size: 8px; font-weight: normal; opacity: 0.9;">Gifting Pot</span>
            </div>
            <div class="tab tab-right">Glue</div>
          </div>
          <div class="tab tab-bottom">Glue / Tape Tab</div>
          <span class="cut-line-desc">✂️ Cut outer red dotted boundary</span>
        </div>
      </div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
    } else if (selectedAsset === 'blank_rewards') {
      htmlContent = `<html><head><title>Print Blank Rewards</title></head><body><h1>Blank Reward Cards (Placeholder)</h1><p>Phase 1d / Phase 2c will render the write-in card grid.</p><script>window.print();</script></body></html>`;
    }

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      handleClose();
    } else {
      alert("Please allow popups to print assets.");
    }
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
              <Button
                variant="primary"
                onClick={handleExecutePrint}
                className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Printer className="w-4 h-4" /> Print Asset
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
