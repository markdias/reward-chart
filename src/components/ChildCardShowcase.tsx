import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Trash2, TrendingUp, ChevronDown, RotateCcw, MinusCircle, PlusCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { FaPiggyBank } from 'react-icons/fa6';
import { CHARACTER_PACKS, getCharacterStage } from '../data/characters';
import { THEME_PRESETS } from '../utils/theme';
import { CoinBadge } from './CoinBadge';
import { ChildAvatar } from './ChildAvatar';
import { LinearProgressBar } from './ProgressBar';
import { Button } from './ui/Button';

const mockChild = {
  id: 'child_1',
  parent_id: 'test',
  name: 'Annabelle',
  avatar_url: 'Rocket',
  character_id: 'starry',
  points: 93,
  level: 9,
  savings_unlocked: true,
  savings_pot: 45,
  lifetime_points: 4250,
  created_at: new Date().toISOString(),
  streak_days: 5,
  last_active_date: new Date().toISOString()
};

const mockParentProfile = {
  points_to_level_up: 750
};

export default function ChildCardShowcase() {
  const [expandedAdjustments, setExpandedAdjustments] = useState<Record<string, boolean>>({});
  const styles = THEME_PRESETS['sunny_toybox'];
  
  const child = mockChild as any;
  const stage = getCharacterStage(child.character_id, child.level);
  const pack = CHARACTER_PACKS.find(cp => cp.id === child.character_id);

  const levelProgress = ((child.lifetime_points || 0) % (mockParentProfile.points_to_level_up ?? 500));
  const levelMax = mockParentProfile.points_to_level_up ?? 500;
  const progressPercent = (levelProgress / levelMax) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Child Card Layout Showcase</h1>
          <p className="text-slate-500">Comparing different layout approaches for the Parent Dashboard child card.</p>
        </div>

        {/* CURRENT LAYOUT (BASELINE) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">1. Current Layout (Baseline)</h2>
          <div className="max-w-md">
            <div className="bg-white border dashboard-card border-gray-100 p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
              <div className="flex gap-4 items-center pr-8">
                <ChildAvatar
                  iconName={child.avatar_url}
                  className="w-16 h-16 !rounded-2xl p-1 border shrink-0 bg-stone-100 border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-extrabold text-lg ${styles.titleColor} font-display truncate`}>{child.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                    <div className={`flex items-center gap-2 text-xs font-mono font-bold ${styles.textColor} whitespace-nowrap`}>
                      <CoinBadge points={child.points} size="sm" />
                    </div>
                    {child.savings_unlocked && (
                      <div className={`flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 whitespace-nowrap`}>
                        <span className="text-sm"><FaPiggyBank /></span>
                        <span>{child.savings_pot || 0} Saved</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 text-xs font-mono font-bold ${styles.textColor} whitespace-nowrap`}>
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span>Lvl {child.level || 1} <span className="text-[10px] ml-1 opacity-70">({levelProgress}/{levelMax} Gold)</span></span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center justify-between bg-stone-50 border-stone-200`}>
                <div>
                  <p className={`text-[8px] ${styles.textMuted} font-mono font-bold uppercase tracking-wider`}>Species Pack</p>
                  <p className={`text-xs font-extrabold ${styles.textColor} mt-0.5`}>{pack?.name.split(' the ')[0] || 'Unknown'}</p>
                  <p className={`text-[10px] font-mono text-amber-700 mt-0.5`}>Stage {stage.stage_number}: {stage.name}</p>
                </div>
                {stage.image_url ? (
                  <img src={stage.image_url} alt={stage.name} className="w-14 h-14 object-cover rounded-lg" />
                ) : (
                  <span className="text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{stage.emoji}</span>
                )}
              </div>

              <div className={`mt-2 rounded-2xl border overflow-hidden transition-all bg-stone-50 border-stone-200`}>
                <button
                  onClick={() => setExpandedAdjustments(prev => ({ ...prev, [child.id]: !prev[child.id] }))}
                  className={`w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-stone-100 transition-colors `}
                >
                  <h4 className={`text-xs font-bold font-display ${styles.titleColor}`}>Quick Adjustments</h4>
                  <ChevronDown className={`w-4 h-4 ${styles.textMuted} transition-transform ${expandedAdjustments[child.id] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedAdjustments[child.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-200 bg-stone-100"
                    >
                      <div className="p-3 text-xs text-center text-stone-500">
                        [Adjustment Controls Here]
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <div className={`flex justify-between text-xs ${styles.textMuted} font-mono`}>
                  <span className="uppercase">LEVEL {child.level} PROGRESS</span>
                  <span className={`font-extrabold ${styles.titleColor}`}>{levelProgress} / {levelMax} Gold</span>
                </div>
                <LinearProgressBar progress={progressPercent} heightClass="h-3" className="mt-2" />
              </div>
            </div>
          </div>
        </div>

        {/* OPTION 2: Compact & Playful */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">2. Compact & Playful (Better Hierarchy)</h2>
          <div className="max-w-md">
            <div className="bg-white border-2 border-stone-200 p-5 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col gap-4">
              
              {/* Header: Avatar + Info */}
              <div className="flex gap-4 items-start pr-8 relative z-10">
                <div className="relative shrink-0">
                  <ChildAvatar
                    iconName={child.avatar_url}
                    className="w-20 h-20 border-4 border-white shadow-md bg-amber-50"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                    Lvl {child.level}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className={`font-black text-2xl text-stone-900 font-display truncate leading-none mb-2`}>{child.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-inner">
                      <CoinBadge points={child.points} size="sm" iconOnly={true} />
                      {child.points} Gold
                    </div>
                    {child.savings_unlocked && (
                      <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-inner">
                        <FaPiggyBank className="text-sm" />
                        {child.savings_pot} Saved
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute top-0 right-0">
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 text-stone-400 hover:text-stone-700">
                    <Edit2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar (Integrated) */}
              <div className="space-y-1.5 px-1 relative z-10">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Lvl {child.level} Progress</span>
                  <span className="text-xs font-bold text-stone-600">{levelProgress} / {levelMax}</span>
                </div>
                <div className="h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 w-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)' }} />
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Companion & Adjustments */}
              <div className="grid grid-cols-2 gap-3 relative z-10 mt-1">
                {/* Species Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-3 border border-indigo-100 flex items-center justify-between group cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Companion</p>
                    <p className="text-xs font-black text-indigo-900 truncate">{pack?.name.split(' the ')[0]}</p>
                    <p className="text-[10px] font-bold text-indigo-500/80 truncate">Stage {stage.stage_number}</p>
                  </div>
                  {stage.image_url ? (
                    <img src={stage.image_url} alt={stage.name} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="text-3xl">{stage.emoji}</span>
                  )}
                </div>

                {/* Adjustments Button */}
                <button
                  onClick={() => setExpandedAdjustments(prev => ({ ...prev, [child.id + '_opt2']: !prev[child.id + '_opt2'] }))}
                  className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-800"
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-stone-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">Quick<br/>Adjustments</span>
                </button>
              </div>

              {/* Expanded Adjustments */}
              <AnimatePresence>
                {expandedAdjustments[child.id + '_opt2'] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-stone-100">
                       <div className="p-4 rounded-xl bg-stone-50 text-xs text-center text-stone-500 border border-stone-200 border-dashed">
                        [Adjustment Controls Here]
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* OPTION 3: Horizontal Unified Layout */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">3. Horizontal Unified (Wide Card)</h2>
          <div className="max-w-2xl">
            <div className="bg-white border dashboard-card border-stone-200 p-4 rounded-3xl flex flex-col md:flex-row gap-4 relative">
              
              {/* Left Column: Core Identity */}
              <div className="flex gap-4 items-center md:w-1/2">
                 <ChildAvatar
                  iconName={child.avatar_url}
                  className="w-16 h-16 !rounded-[1.25rem] bg-stone-100 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-black text-xl text-stone-900 font-display truncate leading-tight`}>{child.name}</h3>
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1 mb-1.5">Lvl {child.level}</div>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-100/50 flex items-center gap-1">
                      <CoinBadge points={child.points} size="sm" iconOnly={true} /> {child.points}
                    </div>
                    {child.savings_unlocked && (
                      <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-100/50 flex items-center gap-1">
                        <FaPiggyBank /> {child.savings_pot}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block w-px bg-stone-100 my-2"></div>

              {/* Right Column: Companion & Progress */}
              <div className="flex-1 flex flex-col justify-center gap-3">
                 <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50">
                      {stage.image_url ? (
                        <img src={stage.image_url} alt={stage.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                      ) : (
                        <span className="text-2xl">{stage.emoji}</span>
                      )}
                      <div className="min-w-0">
                         <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Companion</p>
                         <p className="text-sm font-bold text-indigo-900 truncate leading-none">{pack?.name.split(' the ')[0]}</p>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 bg-stone-50 border border-stone-200">
                      <Edit2 className="w-4 h-4 text-stone-600" />
                    </Button>
                 </div>

                 <div className="space-y-1.5 px-1">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-bold text-stone-500">{levelProgress}/{levelMax}</span>
                  </div>
                  <LinearProgressBar progress={progressPercent} heightClass="h-2" />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* OPTION 4: Clean & Data-focused */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">4. Minimalist Data Card</h2>
          <div className="max-w-md">
            <div className="bg-white border border-stone-200 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              <div className="p-5 flex items-center justify-between border-b border-stone-100">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <ChildAvatar iconName={child.avatar_url} className="w-12 h-12" />
                      <div className="absolute -bottom-1 -right-1 bg-stone-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        Lvl {child.level}
                      </div>
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-stone-900 leading-tight">{child.name}</h3>
                     <p className="text-xs text-stone-500">Stage {stage.stage_number} {pack?.name.split(' the ')[0]}</p>
                   </div>
                </div>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-700">
                      <Settings2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-stone-100 bg-stone-50/50">
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Available Gold</span>
                  <div className="flex items-center gap-2">
                    <CoinBadge points={child.points} size="sm" iconOnly={true} />
                    <span className="text-lg font-black text-amber-600">{child.points}</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Saved</span>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <FaPiggyBank className="text-lg" />
                    <span className="text-lg font-black">{child.savings_pot || 0}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-white border-t border-stone-100">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Level Progress</span>
                    <span className="text-xs font-bold text-stone-600">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <LinearProgressBar progress={progressPercent} heightClass="h-1.5" />
              </div>
              
              <button className="w-full py-3 bg-stone-50 border-t border-stone-100 text-xs font-bold text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors flex items-center justify-center gap-2">
                 Quick Adjustments <ChevronDown className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>

        {/* OPTION 5: Stacked Banner Profile */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">5. Stacked Banner Profile</h2>
          <div className="max-w-sm">
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm relative p-5 pt-6">
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    <ChildAvatar 
                      iconName={child.avatar_url} 
                      className="w-20 h-20 !rounded-[1.25rem] bg-stone-50 relative z-10" 
                    />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-amber-300 bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-sm">
                           {child.points}
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 mt-1.5 uppercase tracking-widest">Gold</span>
                      </div>
                      {child.savings_unlocked && (
                         <div className="flex flex-col items-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-emerald-300 bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-sm">
                               {child.savings_pot}
                            </div>
                            <span className="text-[10px] font-bold text-stone-400 mt-1.5 uppercase tracking-widest">Saved</span>
                         </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-2xl text-stone-900 font-display leading-tight">{child.name}</h3>
                </div>

                <div className="mt-5 p-3 rounded-2xl bg-stone-50/50 border border-stone-100 flex items-center gap-3">
                   {stage.image_url ? (
                      <img src={stage.image_url} className="w-10 h-10 drop-shadow-sm" />
                   ) : (
                      <span className="text-2xl">{stage.emoji}</span>
                   )}
                   <div className="flex-1">
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-0.5">Companion</p>
                     <p className="text-sm font-bold text-stone-700 leading-none">{pack?.name.split(' ')[0]} <span className="opacity-50 font-normal">Stage {stage.stage_number}</span></p>
                   </div>
                </div>
                
                <div className="mt-5">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-sm font-black text-stone-700 uppercase tracking-widest">Lvl {child.level}</span>
                    <span className="text-sm font-black text-stone-700">{levelProgress}/{levelMax}</span>
                  </div>
                  <LinearProgressBar progress={progressPercent} heightClass="h-4" />
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-stone-100/50 border border-stone-200/50 text-stone-500 text-xs font-bold flex items-center justify-center gap-2 hover:bg-stone-100 hover:text-stone-700 transition-colors">
                    <Settings2 className="w-4 h-4" /> Quick Adjustments
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-stone-100/50 border border-stone-200/50 text-stone-500 text-xs font-bold flex items-center justify-center hover:bg-stone-100 hover:text-stone-700 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OPTION 6: Sidebar Dashboard */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">6. Sidebar Split</h2>
          <div className="max-w-xl">
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm flex">
              {/* Left Sidebar */}
              <div className="w-1/3 bg-stone-50 border-r border-stone-100 p-4 flex flex-col items-center text-center">
                <div className="relative mb-2 w-20 h-20 rounded-full border-2 border-stone-200 bg-white flex items-center justify-center shadow-sm overflow-hidden">
                   {stage.image_url ? (
                      <img src={stage.image_url} className="w-14 h-14 object-contain drop-shadow-sm" />
                   ) : (
                      <span className="text-5xl drop-shadow-sm">{stage.emoji}</span>
                   )}
                </div>
                <h3 className="font-black text-lg text-stone-800 leading-tight text-center">{pack?.name.split(' the ')[0]}</h3>
                <span className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">Stage {stage.stage_number}</span>

                <div className="mt-auto pt-6 w-full space-y-3">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-[3px] border-amber-300 bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg shadow-sm">
                       {child.points}
                    </div>
                    <span className="text-[9px] font-bold text-stone-400 mt-1.5 uppercase tracking-widest">Gold</span>
                  </div>
                  {child.savings_unlocked && (
                     <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full border-[3px] border-emerald-300 bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg shadow-sm">
                           {child.savings_pot}
                        </div>
                        <span className="text-[9px] font-bold text-stone-400 mt-1.5 uppercase tracking-widest">Saved</span>
                     </div>
                  )}
                </div>
              </div>

              {/* Right Content */}
              <div className="w-2/3 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Child</p>
                     <div className="flex items-center gap-3">
                       <ChildAvatar iconName={child.avatar_url} className="w-16 h-16 !rounded-[1.25rem] bg-stone-50" />
                       <div>
                         <span className="font-black text-2xl text-stone-900 font-display leading-tight block">{child.name}</span>
                         <span className="bg-cyan-100 text-cyan-800 text-[10px] font-black px-2 py-0.5 rounded-md mt-1 inline-block">
                           Level {child.level}
                         </span>
                       </div>
                     </div>
                   </div>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-700">
                     <Edit2 className="w-4 h-4" />
                   </Button>
                </div>

                <div className="mt-auto mb-4">
                  <div className="flex justify-between text-[10px] font-bold mb-1.5">
                    <span className="text-stone-400 uppercase tracking-widest">Level {child.level} Progress</span>
                    <span className="text-stone-600">{levelProgress}/{levelMax}</span>
                  </div>
                  <LinearProgressBar progress={progressPercent} heightClass="h-4" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold transition-colors">
                     View Quests
                  </button>
                  <button className="py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-500 text-xs font-bold transition-colors">
                     Adjustments
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Temporary icon mock for the showcase
const Settings2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
