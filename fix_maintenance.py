import re
import sys

with open('src/components/ChildDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update Props
props_target = "  onGiftingUnlockSeen: (childId: string) => void;"
props_replacement = """  onGiftingUnlockSeen: (childId: string) => void;
  onMaintenanceUnlockSeen: (childId: string) => void;"""
content = content.replace(props_target, props_replacement)

c_props_target = "  onGiftingUnlockSeen,"
c_props_replacement = """  onGiftingUnlockSeen,
  onMaintenanceUnlockSeen,"""
content = content.replace(c_props_target, c_props_replacement)

# 2. Add showMaintenanceReplayVideo state
state_target = """  const [giftingDepositAmount, setGiftingDepositAmount] = useState<number>(5);
  const [showGiftingReplayVideo, setShowGiftingReplayVideo] = useState(false);"""
state_replacement = """  const [giftingDepositAmount, setGiftingDepositAmount] = useState<number>(5);
  const [showGiftingReplayVideo, setShowGiftingReplayVideo] = useState(false);
  const [showMaintenanceReplayVideo, setShowMaintenanceReplayVideo] = useState(false);"""
content = content.replace(state_target, state_replacement)

# 3. Add to showUnlock logic (for video player)
show_unlock_target = """    const showUnlock = activeChild && activeChild.savings_unlocked && (!activeChild.savings_unlock_seen || showReplayVideo);
    const showFoodUnlock = activeChild && activeChild.food_pot_unlocked && (!activeChild.food_pot_unlock_seen || showFoodReplayVideo);
    const showGiftingUnlock = activeChild && activeChild.gifting_unlocked && (!activeChild.gifting_unlock_seen || showGiftingReplayVideo);"""

show_unlock_replacement = """    const showUnlock = activeChild && activeChild.savings_unlocked && (!activeChild.savings_unlock_seen || showReplayVideo);
    const showFoodUnlock = activeChild && activeChild.food_pot_unlocked && (!activeChild.food_pot_unlock_seen || showFoodReplayVideo);
    const showGiftingUnlock = activeChild && activeChild.gifting_unlocked && (!activeChild.gifting_unlock_seen || showGiftingReplayVideo);
    const showMaintenanceUnlock = activeChild && activeChild.maintenance_unlocked && (!activeChild.maintenance_unlock_seen || showMaintenanceReplayVideo);"""
content = content.replace(show_unlock_target, show_unlock_replacement)

# update if (!showUnlock ...)
if_unlock_target = "    if (!showUnlock && !showFoodUnlock && !showGiftingUnlock) {"
if_unlock_replacement = "    if (!showUnlock && !showFoodUnlock && !showGiftingUnlock && !showMaintenanceUnlock) {"
content = content.replace(if_unlock_target, if_unlock_replacement)

# 4. Add video overlay for maintenance
video_target = """              {showGiftingUnlock && (
                <div className="absolute inset-0 bg-stone-900/90 z-50 flex flex-col items-center justify-center p-4">"""

video_replacement = """              {showMaintenanceUnlock && (
                <div className="absolute inset-0 bg-stone-900/90 z-50 flex flex-col items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl relative">
                    <video 
                      ref={videoRef}
                      className="w-full aspect-video object-cover"
                      src="https://zztgqkqeotjojnddftxe.supabase.co/storage/v1/object/public/videos//4.mp4"
                      controls
                      autoPlay
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onEnded={() => setIsVideoPlaying(false)}
                    />
                    {!isVideoPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                          <Play className="w-8 h-8 fill-current ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-center max-w-md">
                    <h3 className="text-2xl font-black font-display text-white mb-2 tracking-wide uppercase">Maintenance Pot Unlocked!</h3>
                    <p className="text-stone-300 mb-6 text-sm">You reached Level {parentProfile?.maintenance_pot_unlock_level ?? 4}! You must now put 20 coins away every month to maintain your Main Pot!</p>
                    <button 
                      onClick={() => { playSound.success(); onMaintenanceUnlockSeen(activeChild.id); setShowMaintenanceReplayVideo(false); }}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 transition-all font-mono tracking-wider uppercase"
                    >
                      Awesome!
                    </button>
                  </div>
                </div>
              )}
              
              {showGiftingUnlock && (
                <div className="absolute inset-0 bg-stone-900/90 z-50 flex flex-col items-center justify-center p-4">"""
content = content.replace(video_target, video_replacement)

# 5. Extract Maintenance Pot section, delete it, and reinsert it after Gifting Pot section
maintenance_regex = re.compile(r"(\s*\{\/\* === MAINTENANCE POT SECTION === \*\/\}.*?\{\/\* === FOOD POT SECTION === \*\/\})", re.DOTALL)
match = maintenance_regex.search(content)

if match:
    maintenance_block = match.group(1)
    
    # We want everything except the {/* === FOOD POT SECTION === */} part so we split it out
    parts = maintenance_block.rsplit("                          {/* === FOOD POT SECTION === */}", 1)
    extracted_maintenance = parts[0]
    
    # Remove it from original position
    content = content.replace(extracted_maintenance, "")
    
    # Also we need to wrap the `activeChild.maintenance_unlocked` card inside `activeChild.maintenance_unlocked && activeChild.maintenance_unlock_seen`
    # Let's do that fix in the extracted block before reinserting
    extracted_maintenance = extracted_maintenance.replace(
      "{activeChild.maintenance_unlocked && (", 
      "{activeChild.maintenance_unlocked && activeChild.maintenance_unlock_seen && ("
    )
    
    # Add Play Video button to Header
    play_btn = """                                      <h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Maintenance</h4>
                                      <button 
                                        onClick={() => setShowMaintenanceReplayVideo(true)}
                                        className="text-[9px] bg-slate-200 text-slate-700 hover:bg-slate-300 px-2 py-0.5 rounded-full font-bold transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-slate-700" /> Play Video
                                      </button>"""
    extracted_maintenance = extracted_maintenance.replace(
      "<h4 className={`font-black text-sm ${styles.titleColor} leading-none`}>Maintenance</h4>",
      play_btn
    )

    # Re-insert after Gifting Pot locked preview
    gifting_regex = re.compile(r"(\{\/\* Gifting Pot Locked Preview \*\/\}.*?<\/div>\n\s*\)\})", re.DOTALL)
    gifting_match = gifting_regex.search(content)
    
    if gifting_match:
        gifting_block = gifting_match.group(1)
        content = content.replace(gifting_block, gifting_block + "\n" + extracted_maintenance)

with open('src/components/ChildDashboard.tsx', 'w') as f:
    f.write(content)
    
# 6. Update App.tsx
with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_handler = """  const handleGiftingUnlockSeen = async (childId: string) => {
    const supabase = getSupabaseClient();
    
    setChildren(prev => prev.map(child => {
      if (child.id === childId) {
        if (supabase) {
          supabase.from('children').update({ gifting_unlock_seen: true }).eq('id', childId).then();
        }
        return { ...child, gifting_unlock_seen: true };
      }
      return child;
    }));
  };"""

app_maintenance_handler = """  const handleGiftingUnlockSeen = async (childId: string) => {
    const supabase = getSupabaseClient();
    
    setChildren(prev => prev.map(child => {
      if (child.id === childId) {
        if (supabase) {
          supabase.from('children').update({ gifting_unlock_seen: true }).eq('id', childId).then();
        }
        return { ...child, gifting_unlock_seen: true };
      }
      return child;
    }));
  };

  const handleMaintenanceUnlockSeen = async (childId: string) => {
    const supabase = getSupabaseClient();
    
    setChildren(prev => prev.map(child => {
      if (child.id === childId) {
        if (supabase) {
          supabase.from('children').update({ maintenance_unlock_seen: true }).eq('id', childId).then();
        }
        return { ...child, maintenance_unlock_seen: true };
      }
      return child;
    }));
  };"""
app_content = app_content.replace(app_handler, app_maintenance_handler)

app_prop = """              onGiftingUnlockSeen={handleGiftingUnlockSeen}"""
app_prop_replacement = """              onGiftingUnlockSeen={handleGiftingUnlockSeen}
              onMaintenanceUnlockSeen={handleMaintenanceUnlockSeen}"""
app_content = app_content.replace(app_prop, app_prop_replacement)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

