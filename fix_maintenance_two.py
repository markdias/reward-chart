import re

with open('src/components/ChildDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add Maintenance Unlock Celebration Overlay
celebration_target = """      {/* Gifting Pot Unlock Celebration Overlay */}
      <AnimatePresence>
        {activeChild && activeChild.gifting_unlocked && (!activeChild.gifting_unlock_seen || showGiftingReplayVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="gifting-pot-unlock-cinematic"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative w-full max-w-lg bg-white border-4 border-stone-900 rounded-[2.5rem] p-8 shadow-[0_10px_0_0_rgba(28,25,23,1)] space-y-6"
            >
              {/* Sunburst background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border border-rose-300 text-rose-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <h2 className="text-3xl font-black font-display text-stone-900">
                🎉 GIFTING POT UNLOCKED!
              </h2>

              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                You're so generous, <strong className="text-stone-900">{activeChild.name}</strong>! You've unlocked the <strong className="text-rose-600">Gifting Pot</strong>! You can now use your gold coins to help others by donating to charity or gifting to a sibling.
              </p>

              {/* Video Player */}
              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shadow-inner group">
                <video 
                  ref={videoRef}
                  src="/gifting-pot-video.mp4" 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/gifting-pot-poster.jpg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="/gifting-pot-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isVideoPlaying && (
                  <div 
                    onClick={() => {
                      videoRef.current?.play();
                    }}
                    className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:opacity-0 transition-opacity bg-stone-900/20"
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
                      <Play className="w-8 h-8 text-rose-500 fill-rose-500 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { playSound.success(); onGiftingUnlockSeen(activeChild.id); setShowGiftingReplayVideo(false); }}
                className="w-full gamepad-button py-4 bg-rose-400 hover:bg-rose-300 border-2 border-stone-900 text-stone-950 font-black rounded-2xl uppercase tracking-widest text-sm shadow-[0_4px_0_0_#1c1917] hover:translate-y-1 hover:shadow-[0_0px_0_0_#1c1917] cursor-pointer transition-all"
                id="gifting-pot-unlock-dismiss-btn"
              >
                GOT IT! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>"""

celebration_replacement = celebration_target + """

      {/* Maintenance Pot Unlock Celebration Overlay */}
      <AnimatePresence>
        {activeChild && activeChild.maintenance_unlocked && (!activeChild.maintenance_unlock_seen || showMaintenanceReplayVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            id="maintenance-pot-unlock-cinematic"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative w-full max-w-lg bg-white border-4 border-stone-900 rounded-[2.5rem] p-8 shadow-[0_10px_0_0_rgba(28,25,23,1)] space-y-6"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 rounded-full text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4 text-slate-500 animate-pulse" />
                NEW FEATURE UNLOCKED
              </div>

              <h2 className="text-3xl font-black font-display text-stone-900">
                🎉 MAINTENANCE POT UNLOCKED!
              </h2>

              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                You've unlocked the <strong className="text-slate-600">Maintenance Pot</strong>! You must keep at least 20 coins in here. Every month, rent will be paid from this pot to keep your Main Pot from breaking.
              </p>

              <div className="relative w-full aspect-video rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                <ShieldAlert className="w-24 h-24 text-slate-400 mb-4 animate-pulse" />
                <p className="font-mono text-slate-500 font-bold text-sm">VIDEO PLACEHOLDER</p>
              </div>

              <button
                onClick={() => { playSound.success(); onMaintenanceUnlockSeen(activeChild.id); setShowMaintenanceReplayVideo(false); }}
                className="w-full gamepad-button py-4 bg-slate-400 hover:bg-slate-300 border-2 border-stone-900 text-stone-950 font-black rounded-2xl uppercase tracking-widest text-sm shadow-[0_4px_0_0_#1c1917] hover:translate-y-1 hover:shadow-[0_0px_0_0_#1c1917] cursor-pointer transition-all"
                id="maintenance-pot-unlock-dismiss-btn"
              >
                GOT IT! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>"""

content = content.replace(celebration_target, celebration_replacement)

# 2. Extract and move the Maintenance Pot Locked preview down.
locked_preview_regex = re.compile(r"(\s*\{!activeChild\.maintenance_unlocked && \(.*?\{\/\* === FOOD POT SECTION === \*\/\})", re.DOTALL)
match = locked_preview_regex.search(content)

if match:
    full_block = match.group(1)
    
    # We want everything except the {/* === FOOD POT SECTION === */} part so we split it out
    parts = full_block.rsplit("                          {/* === FOOD POT SECTION === */}", 1)
    extracted_locked_preview = parts[0]
    
    # Remove it from original position
    content = content.replace(extracted_locked_preview, "")
    
    # Append it AFTER the end of the Maintenance Pot Unlocked card
    maintenance_unlocked_regex = re.compile(r"(\{\/\* === MAINTENANCE POT SECTION === \*\/\}.*?<\/AnimatePresence>\n\s*<\/div>\n\s*\)\})", re.DOTALL)
    maintenance_unlocked_match = maintenance_unlocked_regex.search(content)
    
    if maintenance_unlocked_match:
        maintenance_unlocked_block = maintenance_unlocked_match.group(1)
        content = content.replace(maintenance_unlocked_block, maintenance_unlocked_block + "\n" + extracted_locked_preview)

with open('src/components/ChildDashboard.tsx', 'w') as f:
    f.write(content)

