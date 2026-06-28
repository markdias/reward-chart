import re
import sys

with open('src/components/ChildDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update Props
props_target = """  onPaySavingsMaintenance: (childId: string) => void;
  onRepairSavingsPot: (childId: string) => void;
  onSavingsDeposit: (childId: string, amount: number) => void;
  onSavingsWithdraw: (childId: string) => void;"""
props_replacement = """  onMaintenanceDeposit: (childId: string, amount: number) => void;
  onMaintenanceWithdraw: (childId: string) => void;
  onRepairMainPot: (childId: string) => void;
  onSavingsDeposit: (childId: string, amount: number) => void;
  onSavingsWithdraw: (childId: string) => void;"""
content = content.replace(props_target, props_replacement)

# 2. Update Component Props
c_props_target = """  onPaySavingsMaintenance,
  onRepairSavingsPot,
  onSavingsDeposit,
  onSavingsWithdraw,"""
c_props_replacement = """  onMaintenanceDeposit,
  onMaintenanceWithdraw,
  onRepairMainPot,
  onSavingsDeposit,
  onSavingsWithdraw,"""
content = content.replace(c_props_target, c_props_replacement)

# 3. Add useState for AvatarView and MaintenancePot
state_target = """  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<'companion' | 'tasks' | 'rewards' | 'pots'>('companion');"""
state_replacement = """  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeChildTab, setActiveChildTab] = useState<'companion' | 'tasks' | 'rewards' | 'pots'>('companion');
  const [avatarView, setAvatarView] = useState<'character' | 'main_pot'>('character');
  const [showMaintenanceDepositModal, setShowMaintenanceDepositModal] = useState(false);
  const [maintenanceDepositAmount, setMaintenanceDepositAmount] = useState<number>(5);"""
content = content.replace(state_target, state_replacement)

# 4. Avatar toggling and Reminder Banner
avatar_target = """                      {/* Giant Levitating Pedestal */}
                      <div className="my-4 sm:my-8 relative flex items-center justify-center">
                        {/* Interactive floating particles */}
                        <div className="absolute h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
                        
                        <motion.div
                          animate={isFeeding ? { scale: [1, 1.25, 1.1, 1.3, 1], rotate: [0, 8, -8, 8, 0] } : {}}
                          transition={isFeeding ? { duration: 2.2, ease: "easeInOut" } : { duration: 1.2 }}
                          className={`h-20 w-20 sm:h-36 sm:w-36 rounded-full ${activeChildStage.image_url ? 'bg-white' : `bg-gradient-to-br ${activeChildStage.color_theme}`} flex items-center justify-center shadow-2xl border-4 border-stone-300 relative z-10 ${activeChildStage.animation_class} transition-colors duration-500 overflow-hidden`}
                        >
                          {activeChildStage.image_url ? (
                            <img src={activeChildStage.image_url} alt={activeChildStage.name} className="w-full h-full object-cover animate-float" />
                          ) : (
                            <span className="text-4xl sm:text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                              {activeChildStage.emoji}
                            </span>
                          )}
                        </motion.div>
                      </div>"""

avatar_replacement = """                      {/* Giant Levitating Pedestal */}
                      <div className="my-4 sm:my-8 relative flex items-center justify-center">
                        {/* Interactive floating particles */}
                        <div className="absolute h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
                        
                        <motion.div
                          animate={isFeeding ? { scale: [1, 1.25, 1.1, 1.3, 1], rotate: [0, 8, -8, 8, 0] } : {}}
                          transition={isFeeding ? { duration: 2.2, ease: "easeInOut" } : { duration: 1.2 }}
                          onClick={() => setAvatarView(prev => prev === 'character' ? 'main_pot' : 'character')}
                          className={`h-20 w-20 sm:h-36 sm:w-36 rounded-full cursor-pointer ${avatarView === 'character' && activeChildStage.image_url ? 'bg-white' : `bg-gradient-to-br ${activeChildStage.color_theme}`} flex items-center justify-center shadow-2xl border-4 border-stone-300 relative z-10 ${activeChildStage.animation_class} transition-colors duration-500 overflow-hidden`}
                        >
                          {avatarView === 'main_pot' ? (
                            <img src={activeChild.main_pot_damaged ? "/savings_pot_cracked.png" : (activeChild.points > 0 ? "/savings_pot_full.png" : "/savings_pot_empty.png")} alt="Main Money Pot" className="w-full h-full object-cover animate-float" />
                          ) : (
                            activeChildStage.image_url ? (
                              <img src={activeChildStage.image_url} alt={activeChildStage.name} className="w-full h-full object-cover animate-float" />
                            ) : (
                              <span className="text-4xl sm:text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
                                {activeChildStage.emoji}
                              </span>
                            )
                          )}
                        </motion.div>
                      </div>
                      
                      <div className="text-[10px] text-center text-stone-500 font-mono mt-1 mb-3">
                        Click above to toggle view!
                      </div>
                      
                      {activeChild.main_pot_damaged && (
                        <div className="w-full bg-red-100 border-2 border-red-400 text-red-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center mb-4">
                          <span className="font-bold text-sm mb-1">⚠️ MAIN POT BROKEN! ⚠️</span>
                          <span className="text-[10px] font-mono leading-tight mb-2">You are losing 1 point per day! Pay 50 points to repair it. If your Maintenance Pot is empty, fill it with 20 points so it doesn't break again!</span>
                          <button onClick={() => { onRepairMainPot(activeChild.id); playSound.purchase(); }} className="bg-red-500 text-white font-bold py-1 px-4 rounded-xl text-[10px] hover:bg-red-600 transition-colors">
                            Repair (50 Points)
                          </button>
                        </div>
                      )}"""
content = content.replace(avatar_target, avatar_replacement)

# 5. Fix Savings Pot (Remove the 3D stuff and maintenance lock)
savings_regex = re.compile(r"\{\/\* Savings Pot Unlocked Card \*\/\}.*?\{\/\* Savings Pot Locked Preview \(Level 1 only, before unlock\) \*\/\}.*?<\/div>.*?<\/div>.*?<\/div>\n.*?\}", re.DOTALL)
savings_pot_clean = """{/* Savings Pot Unlocked Card */}
                          {activeChild.savings_unlocked && activeChild.savings_unlock_seen && (
                            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${styles.cardBg} ${styles.borderStyle} relative overflow-hidden shadow-lg`}>
                              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500`} />
                        
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3 mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center">
                                    <PiggyBank className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>SAVINGS POT</span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Savings</h4>
                                      <button 
                                        onClick={() => setShowReplayVideo(true)}
                                        className="text-[9px] bg-emerald-105 text-emerald-700 hover:bg-emerald-200 px-2 py-0.5 rounded-full font-bold transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-emerald-700" /> Play Video
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                                  <span className="text-lg"><GoldCoinIcon /></span>
                                  <span className="text-lg font-mono font-black text-emerald-700">{activeChild.savings_pot || 0}</span>
                                </div>
                              </div>
                        
                              <p className={`text-[10px] ${styles.textMuted} mb-3 leading-relaxed`}>
                                Move gold coins here from your main pocket to save them safely. Coins in the savings pot can't be used to buy items in the Rewards shop until you withdraw them.
                              </p>

                              {activeChild.savings_goal_name && (
                                <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-emerald-850">
                                      Goal: {activeChild.savings_goal_name}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                                      {activeChild.savings_pot || 0} / {activeChild.savings_goal_amount}
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-emerald-200">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, Math.round(((activeChild.savings_pot || 0) / (activeChild.savings_goal_amount || 1)) * 100))}%` }}
                                      transition={{ duration: 0.8 }}
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2 relative">
                                <button
                                  onClick={() => { setShowDepositModal(true); setDepositAmount(Math.min(5, activeChild.points)); playSound.click(); }}
                                  disabled={activeChild.points <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    activeChild.points > 0
                                      ? 'bg-emerald-500 border border-emerald-700 text-white shadow-[0_3px_0_0_#047857]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  💰 Deposit
                                </button>
                                <button
                                  onClick={() => { setShowWithdrawConfirm(true); playSound.click(); }}
                                  disabled={(activeChild.savings_pot || 0) <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    (activeChild.savings_pot || 0) > 0
                                      ? 'bg-white border border-stone-300 text-stone-700 shadow-[0_3px_0_0_#d6d3d1]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  Withdraw All
                                </button>
                              </div>

                              {/* Deposit Modal */}
                              <AnimatePresence>
                                {showDepositModal && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 relative z-20"
                                  >
                                    <label className="text-xs font-bold text-emerald-800 block text-center mb-1">Deposit how many coins?</label>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                      <button
                                        onClick={() => { setDepositAmount(Math.max(1, depositAmount - 1)); playSound.click(); }}
                                        disabled={depositAmount <= 1}
                                        className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                
                                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-250 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm">{depositAmount}</span>
                                      </div>
                                
                                      <button
                                        onClick={() => { setDepositAmount(Math.min(activeChild.points, depositAmount + 1)); playSound.click(); }}
                                        disabled={depositAmount >= activeChild.points}
                                        className="w-8 h-8 rounded-full bg-emerald-205 text-emerald-755 flex items-center justify-center cursor-pointer hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          if (depositAmount > 0 && depositAmount <= activeChild.points) {
                                            onSavingsDeposit(activeChild.id, depositAmount);
                                            setShowDepositModal(false);
                                            playSound.purchase();
                                          }
                                        }}
                                        disabled={depositAmount <= 0 || depositAmount > activeChild.points}
                                        className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-emerald-400 active:translate-y-0.5 transition-all"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => { setShowDepositModal(false); playSound.click(); }}
                                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Withdraw Confirm Modal */}
                              <AnimatePresence>
                                {showWithdrawConfirm && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2 relative z-20"
                                  >
                                    <p className="text-xs font-bold text-rose-800 text-center">Are you sure you want to withdraw all {activeChild.savings_pot} coins back to your pocket?</p>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          onSavingsWithdraw(activeChild.id);
                                          setShowWithdrawConfirm(false);
                                          playSound.purchase();
                                        }}
                                        className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:bg-rose-400 active:translate-y-0.5 transition-all"
                                      >
                                        Yes, Withdraw
                                      </button>
                                      <button
                                        onClick={() => { setShowWithdrawConfirm(false); playSound.click(); }}
                                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Savings Pot Locked Preview (Level 1 only, before unlock) */}
                          {!activeChild.savings_unlocked && (activeChild.level < (parentProfile?.savings_pot_unlock_level ?? 1) || (activeChild.level === (parentProfile?.savings_pot_unlock_level ?? 1) && activeChild.xp_in_level < (parentProfile?.savings_pot_unlock_xp ?? 50))) && (
                            <div className={`p-4 rounded-2xl sm:rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center text-center gap-2 opacity-70`}>
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-black font-mono uppercase tracking-wider">🐷 Savings Pot — Unlock at Level {parentProfile?.savings_pot_unlock_level ?? 1}, {parentProfile?.savings_pot_unlock_xp ?? 50} XP!</span>
                              </div>
                              <div className="w-full max-w-[200px] h-2 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(() => {
                                      const xpPerLvl = parentProfile?.xp_to_level_up ?? 100;
                                      const xpEarned = (activeChild.level - 1) * xpPerLvl + (activeChild.xp_in_level || 0);
                                      const xpReq = ((parentProfile?.savings_pot_unlock_level ?? 1) - 1) * xpPerLvl + (parentProfile?.savings_pot_unlock_xp ?? 50);
                                      return Math.min(100, Math.round((xpEarned / Math.max(1, xpReq)) * 100));
                                    })()}%`
                                  }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-stone-500 font-bold">
                                {(() => {
                                  const xpPerLvl = parentProfile?.xp_to_level_up ?? 100;
                                  const xpEarned = (activeChild.level - 1) * xpPerLvl + (activeChild.xp_in_level || 0);
                                  const xpReq = ((parentProfile?.savings_pot_unlock_level ?? 1) - 1) * xpPerLvl + (parentProfile?.savings_pot_unlock_xp ?? 50);
                                  return `${xpEarned} / ${xpReq} XP`;
                                })()}
                              </span>
                            </div>
                          )}

                          {/* === MAINTENANCE POT SECTION === */}
                          {activeChild.maintenance_unlocked && (
                            <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${styles.cardBg} ${styles.borderStyle} relative overflow-hidden shadow-lg`}>
                              <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-slate-400 via-gray-400 to-slate-500`} />
                        
                              <div className="flex items-center justify-between mb-3 mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 border border-slate-200 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-slate-600" />
                                  </div>
                                  <div>
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${styles.textMuted} font-extrabold`}>MAINTENANCE POT</span>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                      <h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Maintenance</h4>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                                  <span className="text-lg"><GoldCoinIcon /></span>
                                  <span className="text-lg font-mono font-black text-slate-700">{activeChild.maintenance_pot || 0}</span>
                                </div>
                              </div>
                        
                              <p className={`text-[10px] ${styles.textMuted} mb-3 leading-relaxed`}>
                                Keep at least 20 coins in here! Every month, 20 coins will be automatically used to maintain your Main Gold Pot. If this pot is empty when rent is due, your Main Gold Pot will break!
                              </p>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setShowMaintenanceDepositModal(true); setMaintenanceDepositAmount(Math.min(5, activeChild.points)); playSound.click(); }}
                                  disabled={activeChild.points <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    activeChild.points > 0
                                      ? 'bg-slate-500 border border-slate-700 text-white shadow-[0_3px_0_0_#334155]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  💰 Deposit
                                </button>
                                <button
                                  onClick={() => { onMaintenanceWithdraw(activeChild.id); playSound.purchase(); }}
                                  disabled={(activeChild.maintenance_pot || 0) <= 0}
                                  className={`flex-1 py-2.5 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                    (activeChild.maintenance_pot || 0) > 0
                                      ? 'bg-white border border-stone-300 text-stone-700 shadow-[0_3px_0_0_#d6d3d1]'
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                                  }`}
                                >
                                  Withdraw All
                                </button>
                              </div>

                              <AnimatePresence>
                                {showMaintenanceDepositModal && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative z-20"
                                  >
                                    <label className="text-xs font-bold text-slate-800 block text-center mb-1">Deposit how many coins?</label>
                                    <div className="flex items-center justify-center gap-4 py-2">
                                      <button
                                        onClick={() => { setMaintenanceDepositAmount(Math.max(1, maintenanceDepositAmount - 1)); playSound.click(); }}
                                        disabled={maintenanceDepositAmount <= 1}
                                        className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                
                                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-yellow-250 shadow-[0_4px_10px_rgba(245,158,11,0.4)]">
                                        <span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm">{maintenanceDepositAmount}</span>
                                      </div>
                                
                                      <button
                                        onClick={() => { setMaintenanceDepositAmount(Math.min(activeChild.points, maintenanceDepositAmount + 1)); playSound.click(); }}
                                        disabled={maintenanceDepositAmount >= activeChild.points}
                                        className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          if (maintenanceDepositAmount > 0 && maintenanceDepositAmount <= activeChild.points) {
                                            onMaintenanceDeposit(activeChild.id, maintenanceDepositAmount);
                                            setShowMaintenanceDepositModal(false);
                                            playSound.purchase();
                                          }
                                        }}
                                        disabled={maintenanceDepositAmount <= 0 || maintenanceDepositAmount > activeChild.points}
                                        className="flex-1 py-2 rounded-lg bg-slate-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-slate-400 active:translate-y-0.5 transition-all"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => { setShowMaintenanceDepositModal(false); playSound.click(); }}
                                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {!activeChild.maintenance_unlocked && (activeChild.level < (parentProfile?.maintenance_pot_unlock_level ?? 4) || (activeChild.level === (parentProfile?.maintenance_pot_unlock_level ?? 4) && activeChild.xp_in_level < (parentProfile?.maintenance_pot_unlock_xp ?? 50))) && (
                            <div className={`p-4 rounded-2xl sm:rounded-3xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center text-center gap-2 opacity-70`}>
                              <div className="flex items-center gap-2 text-stone-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-black font-mono uppercase tracking-wider">🛡️ Maintenance Pot — Unlock at Level {parentProfile?.maintenance_pot_unlock_level ?? 4}, {parentProfile?.maintenance_pot_unlock_xp ?? 50} XP!</span>
                              </div>
                              <div className="w-full max-w-[200px] h-2 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(() => {
                                      const xpPerLvl = parentProfile?.xp_to_level_up ?? 100;
                                      const xpEarned = (activeChild.level - 1) * xpPerLvl + (activeChild.xp_in_level || 0);
                                      const xpReq = ((parentProfile?.maintenance_pot_unlock_level ?? 4) - 1) * xpPerLvl + (parentProfile?.maintenance_pot_unlock_xp ?? 50);
                                      return Math.min(100, Math.round((xpEarned / Math.max(1, xpReq)) * 100));
                                    })()}%`
                                  }}
                                  transition={{ duration: 0.8 }}
                                  className="h-full rounded-full bg-gradient-to-r from-slate-400 to-gray-400"
                                />
                              </div>
                            </div>
                          )}"""
content = re.sub(savings_regex, savings_pot_clean, content)

with open('src/components/ChildDashboard.tsx', 'w') as f:
    f.write(content)
