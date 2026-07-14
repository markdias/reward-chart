import React from 'react';
import { Settings, MinusCircle, Edit2, ScrollText, Trash2, Shield, Smartphone, Trophy, Star, MoreHorizontal, CheckCircle2, ChevronRight, Gamepad2, Gift } from 'lucide-react';
import { Typography } from './ui/Typography';
import { ChildAvatar } from './ChildAvatar';
import { LinearProgressBar } from './ProgressBar';
import { CoinBadge } from './CoinBadge';
import { Button } from './ui/Button';

export function ActionShowcase() {
  const child = {
    name: "Annabelle",
    points: 450,
    avatar_url: "Sparkles",
    character_id: "unicorn"
  };

  const getPetStripeBackground = (characterId?: string) => {
    switch (characterId) {
      case 'unicorn': return 'repeating-linear-gradient(45deg, #a855f7, #a855f7 15px, #f472b6 15px, #f472b6 30px, #e879f9 30px, #e879f9 45px)';
      case 'dino': return 'repeating-linear-gradient(45deg, #10b981, #10b981 15px, #84cc16 15px, #84cc16 30px, #14b8a6 30px, #14b8a6 45px)';
      default: return 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 15px, #a855f7 15px, #a855f7 30px, #38bdf8 30px, #38bdf8 45px)';
    }
  };

  const rainbowGradient = getPetStripeBackground(child.character_id);

  return (
    <div className="space-y-16 mb-24 px-4 pb-20">
      
      {/* BUTTON DESIGN DIRECTIONS */}
      <div className="text-center max-w-4xl mx-auto pt-8">
        <Typography variant="h2" className="text-3xl font-black text-stone-800 dark:text-stone-100 tracking-tight mb-3">Button Design Directions</Typography>
        <p className="text-stone-500 dark:text-stone-400 font-medium text-lg mb-8">Please review these 4 different styles and let me know which one you prefer for the app.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Option A: Gradient Pills */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="text-sm font-black text-stone-400 tracking-widest uppercase mb-6">Option A: Gradient Pills</h3>
            <div className="flex flex-col gap-4">
              <button className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold tracking-wide shadow-[0_8px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5" /> Play Game
              </button>
              <button className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700 text-stone-700 dark:text-stone-200 font-bold tracking-wide hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-4 leading-relaxed">Modern, sleek, pill-shaped buttons with soft gradients and glowing drop shadows. Feels very premium like a modern iOS app.</p>
          </div>

          {/* Option B: Soft Glassmorphism (No Colored Background) */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
            {/* Adding some subtle floating shapes behind to show off the glass blur effect, otherwise it's invisible on a solid background */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-40 animate-blob"></div>
            <div className="absolute top-10 right-10 w-16 h-16 bg-rose-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-40 animate-blob animation-delay-2000"></div>
            
            <h3 className="text-sm font-black text-stone-400 tracking-widest uppercase mb-6 relative z-10">Option B: Frosted Glass (Standard Bg)</h3>
            <div className="flex flex-col gap-4 relative z-10">
              <button className="w-full py-3.5 px-6 rounded-2xl bg-stone-100/40 dark:bg-stone-800/40 backdrop-blur-md border border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-200 font-bold tracking-wide shadow-sm hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-all flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5" /> Play Game
              </button>
              <button className="w-full py-3.5 px-6 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 font-bold tracking-wide hover:bg-white/60 dark:hover:bg-black/60 transition-all flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-4 leading-relaxed relative z-10">Without a heavy colored background, frosted glass relies on the subtle shapes and shadows behind it. I added very faint color blobs to demonstrate the blur.</p>
          </div>

          {/* Option C: Neumorphic (Soft UI) */}
          <div className="bg-[#e0e5ec] dark:bg-[#1a1b1e] rounded-3xl p-6">
            <h3 className="text-sm font-black text-[#8a92a5] dark:text-[#6a7285] tracking-widest uppercase mb-6">Option C: Neumorphic</h3>
            <div className="flex flex-col gap-4">
              <button className="w-full py-3.5 px-6 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1b1e] text-[#4a5568] dark:text-[#a0aec0] font-bold tracking-wide shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[5px_5px_10px_#111214,-5px_-5px_10px_#232428] active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.5)] dark:active:shadow-[inset_4px_4px_8px_#111214,inset_-4px_-4px_8px_#232428] transition-all flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5" /> Play Game
              </button>
              <button className="w-full py-3.5 px-6 rounded-2xl bg-[#e0e5ec] dark:bg-[#1a1b1e] text-[#4a5568] dark:text-[#a0aec0] font-bold tracking-wide shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[5px_5px_10px_#111214,-5px_-5px_10px_#232428] active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.5)] dark:active:shadow-[inset_4px_4px_8px_#111214,inset_-4px_-4px_8px_#232428] transition-all flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </button>
            </div>
            <p className="text-xs text-[#8a92a5] dark:text-[#6a7285] mt-4 leading-relaxed">Looks extruded from the background using light and dark shadows. Extremely tactile but highly stylized.</p>
          </div>

          {/* Option D: Minimal & Soft */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="text-sm font-black text-stone-400 tracking-widest uppercase mb-6">Option D: Minimal Soft</h3>
            <div className="flex flex-col gap-4">
              <button className="w-full py-3.5 px-6 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold tracking-wide hover:bg-indigo-100 dark:hover:bg-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5" /> Play Game
              </button>
              <button className="w-full py-3.5 px-6 rounded-xl bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-300 font-bold tracking-wide hover:bg-stone-100 dark:hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-4 leading-relaxed">No borders, no heavy shadows. Just very soft tinted backgrounds with matching text colors. Feels highly approachable and clean.</p>
          </div>

          {/* Option E: Gel Arcade (Skeuomorphic) */}
          <div className="bg-stone-800 dark:bg-stone-900 rounded-3xl p-6 border border-stone-700 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-black text-emerald-400 tracking-widest uppercase mb-6">Option E: Gel Arcade</h3>
            <div className="flex flex-col gap-4">
              <button className="relative w-full py-3 px-6 rounded-2xl bg-emerald-500 text-white font-black tracking-wide shadow-[0_5px_0_0_#065f46,inset_0_-3px_5px_rgba(0,0,0,0.2),inset_0_4px_5px_rgba(255,255,255,0.4)] active:shadow-[0_0px_0_0_#065f46,inset_0_3px_5px_rgba(0,0,0,0.4)] active:translate-y-1 transition-all flex items-center justify-center gap-2 overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1/2 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:rounded-t-2xl">
                <Gamepad2 className="w-5 h-5 drop-shadow-sm" /> Play Game
              </button>
              <button className="relative w-full py-3 px-6 rounded-2xl bg-rose-500 text-white font-black tracking-wide shadow-[0_5px_0_0_#9f1239,inset_0_-3px_5px_rgba(0,0,0,0.2),inset_0_4px_5px_rgba(255,255,255,0.4)] active:shadow-[0_0px_0_0_#9f1239,inset_0_3px_5px_rgba(0,0,0,0.4)] active:translate-y-1 transition-all flex items-center justify-center gap-2 overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1/2 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:rounded-t-2xl">
                <Settings className="w-5 h-5 drop-shadow-sm" /> Settings
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-4 leading-relaxed">Skeuomorphic design imitating shiny plastic arcade buttons. Highly clickable, deeply nostalgic, and fun.</p>
          </div>

          {/* Option F: Retro 8-Bit */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border-4 border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
            <h3 className="text-sm font-black text-black dark:text-white tracking-widest uppercase mb-6" style={{ fontFamily: 'monospace' }}>Option F: Retro 8-Bit</h3>
            <div className="flex flex-col gap-4">
              <button className="w-full py-3.5 px-6 bg-yellow-400 text-black border-4 border-black font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2" style={{ fontFamily: 'monospace' }}>
                <Gamepad2 className="w-5 h-5" /> Play Game
              </button>
              <button className="w-full py-3.5 px-6 bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] dark:hover:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2" style={{ fontFamily: 'monospace' }}>
                <Settings className="w-5 h-5" /> Settings
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-4 leading-relaxed" style={{ fontFamily: 'monospace' }}>Sharp corners, thick solid black borders, and hard drop shadows mimicking old-school 8-bit game interfaces.</p>
          </div>

          {/* Option G: Holographic / Cyberpunk */}
          <div className="bg-black rounded-3xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
            <h3 className="text-sm font-black text-cyan-400 tracking-[0.2em] uppercase mb-6">Option G: Holographic</h3>
            <div className="flex flex-col gap-4">
              <button className="w-full py-3.5 px-6 rounded-none bg-cyan-950/40 text-cyan-400 border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_0_10px_rgba(6,182,212,0.2)] font-bold tracking-[0.2em] hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] transition-all duration-300 flex items-center justify-center gap-2 uppercase">
                <Gamepad2 className="w-5 h-5" /> Play Game
              </button>
              <button className="w-full py-3.5 px-6 rounded-none bg-purple-950/40 text-purple-400 border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4),inset_0_0_10px_rgba(168,85,247,0.2)] font-bold tracking-[0.2em] hover:bg-purple-500 hover:text-black hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-all duration-300 flex items-center justify-center gap-2 uppercase">
                <Settings className="w-5 h-5" /> Settings
              </button>
            </div>
            <p className="text-xs text-cyan-600 mt-4 leading-relaxed tracking-wider">Neon glowing borders, deep dark backgrounds, and stark text inversions on hover. Highly futuristic.</p>
          </div>

          {/* Option H: Bubbly Cloud */}
          <div className="bg-sky-50 dark:bg-sky-950/30 rounded-3xl p-6 border-2 border-sky-100 dark:border-sky-900 relative">
            <h3 className="text-sm font-black text-sky-400 tracking-widest uppercase mb-6">Option H: Bubbly Cloud</h3>
            <div className="flex flex-col gap-4">
              <button className="w-full py-4 px-6 rounded-[2rem] bg-white dark:bg-stone-800 text-sky-500 font-black tracking-wide border-2 border-sky-200 dark:border-sky-800 shadow-[0_8px_0_0_#bae6fd] dark:shadow-[0_8px_0_0_#0284c7] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#bae6fd] dark:hover:shadow-[0_12px_0_0_#0284c7] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2">
                <Gamepad2 className="w-6 h-6" /> PLAY GAME
              </button>
              <button className="w-full py-4 px-6 rounded-[2rem] bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-300 font-black tracking-wide border-2 border-stone-200 dark:border-stone-700 shadow-[0_8px_0_0_#e7e5e4] dark:shadow-[0_8px_0_0_#44403c] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#e7e5e4] dark:hover:shadow-[0_12px_0_0_#44403c] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2">
                <Settings className="w-6 h-6" /> SETTINGS
              </button>
            </div>
            <p className="text-xs text-sky-600/70 dark:text-sky-400/70 mt-4 leading-relaxed">Extremely rounded, large font sizes, light colored borders with matching thick drop shadows. Very friendly and cartoonish.</p>
          </div>

          {/* Option I: Standard Flat + Custom Fonts */}
          <div className="col-span-1 md:col-span-2 bg-white dark:bg-stone-900 rounded-3xl p-6 border-2 border-stone-100 dark:border-stone-800 shadow-sm relative">
            <style dangerouslySetInnerHTML={{__html: `
              @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&family=Bangers&family=Comic+Neue:wght@700&family=Fredoka:wght@600&display=swap');
            `}} />
            <h3 className="text-sm font-black text-stone-400 tracking-widest uppercase mb-6">Option I: Standard Flat + Fonts</h3>
            <p className="text-sm text-stone-500 mb-6">These are completely flat, standard buttons. The only difference is the typography.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-400 text-center uppercase">Fredoka</span>
                <button className="w-full py-3 px-4 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <Gamepad2 className="w-5 h-5" /> Play Game
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-400 text-center uppercase">Baloo 2</span>
                <button className="w-full py-3 px-4 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-sm text-lg" style={{ fontFamily: "'Baloo 2', sans-serif", lineHeight: '1' }}>
                  <Settings className="w-5 h-5" /> Settings
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-400 text-center uppercase">Comic Neue</span>
                <button className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-sm" style={{ fontFamily: "'Comic Neue', cursive" }}>
                  <Trophy className="w-5 h-5" /> Rewards
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-400 text-center uppercase">Bangers</span>
                <button className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-sm text-xl uppercase tracking-widest" style={{ fontFamily: "'Bangers', cursive", lineHeight: '1' }}>
                  <Star className="w-5 h-5" /> Bonus
                </button>
              </div>

            </div>
          </div>

          {/* Option J: Native iOS */}
          <div className="col-span-1 md:col-span-2 bg-[#F2F2F7] dark:bg-[#000000] rounded-3xl p-6 border border-stone-200 dark:border-stone-800 relative">
            <h3 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-wider mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>Option J: Native iOS</h3>
            <p className="text-sm text-[#8E8E93] mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>Authentic Apple iOS styling. Crisp, clean, uses the native system font, pure blue active states, and opacity-based presses.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              
              {/* iOS Primary */}
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] bg-[#007AFF] text-white font-semibold text-[17px] leading-[22px] active:bg-[#005bb5] transition-colors flex items-center justify-center gap-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <Gamepad2 className="w-[20px] h-[20px]" /> Play Game
              </button>

              {/* iOS Tonal / Gray */}
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] bg-[#E5E5EA] dark:bg-[#1C1C1E] text-[#000000] dark:text-[#FFFFFF] font-semibold text-[17px] leading-[22px] active:opacity-60 transition-opacity flex items-center justify-center gap-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <Settings className="w-[20px] h-[20px]" /> Settings
              </button>
              
              {/* iOS Destructive */}
              <button className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] bg-[#FF3B30] text-white font-semibold text-[17px] leading-[22px] active:bg-[#c92a22] transition-colors flex items-center justify-center gap-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <MinusCircle className="w-[20px] h-[20px]" /> Deduct
              </button>

              {/* iOS Ghost / Text Only */}
              <button className="w-full sm:w-auto px-4 py-3.5 rounded-[14px] bg-transparent text-[#007AFF] font-normal text-[17px] leading-[22px] active:opacity-40 transition-opacity flex items-center justify-center gap-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                History <ChevronRight className="w-[20px] h-[20px] -ml-1 opacity-50" />
              </button>

            </div>
          </div>

          {/* Option K: Flat Round (Pill shape) */}
          <div className="col-span-1 md:col-span-2 bg-white dark:bg-stone-900 rounded-3xl p-6 border-2 border-stone-100 dark:border-stone-800 relative">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6">Option K: Flat Round (Pill)</h3>
            <p className="text-sm text-stone-500 mb-6">Clean, flat, completely rounded buttons without the heavy gradients or shadows of Option A.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              
              <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-indigo-500 text-white font-bold tracking-wide hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5" /> Play Game
              </button>

              <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold tracking-wide hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" /> Settings
              </button>
              
              <button className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center gap-2">
                <ScrollText className="w-5 h-5" /> History
              </button>
              
              {/* Circular Icon Button */}
              <button className="w-12 h-12 rounded-full bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center shadow-sm">
                <MinusCircle className="w-6 h-6" />
              </button>

            </div>
          </div>

          {/* Option L: Round Icon with Text Underneath */}
          <div className="col-span-1 md:col-span-2 bg-stone-50 dark:bg-stone-900 rounded-3xl p-6 border-2 border-stone-100 dark:border-stone-800 relative">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6">Option L: Round Icon with Text Underneath</h3>
            <p className="text-sm text-stone-500 mb-6">Large, clickable circular buttons with descriptive text sitting underneath the icon (like an app grid on a phone screen).</p>
            
            <div className="flex flex-wrap gap-8 justify-center items-center">
              
              {/* Button Container */}
              <button className="flex flex-col items-center gap-3 group active:scale-95 transition-transform focus:outline-none">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg transition-all flex items-center justify-center shadow-sm">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">Play Game</span>
              </button>

              <button className="flex flex-col items-center gap-3 group active:scale-95 transition-transform focus:outline-none">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-lg transition-all flex items-center justify-center shadow-sm">
                  <MinusCircle className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">Deduct</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 group active:scale-95 transition-transform focus:outline-none">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg transition-all flex items-center justify-center shadow-sm">
                  <ScrollText className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">History</span>
              </button>

              <button className="flex flex-col items-center gap-3 group active:scale-95 transition-transform focus:outline-none">
                <div className="w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-stone-500 group-hover:text-white group-hover:shadow-lg transition-all flex items-center justify-center shadow-sm">
                  <Settings className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest group-hover:text-stone-500 transition-colors">Settings</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      <div className="w-full h-px bg-stone-200 dark:bg-stone-800 max-w-2xl mx-auto mt-16 mb-16"></div>
      {/* REFINED PANEL DESIGN */}
      <div className="text-center max-w-2xl mx-auto">
        <Typography variant="h2" className="text-3xl font-black text-stone-800 dark:text-stone-100 tracking-tight mb-3">Refined Panel Design</Typography>
        <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">Clean core, no levels, better avatar scaling, clear 'Linked' status, and new button layouts.</p>
      </div>

      <div className="max-w-[340px] mx-auto group perspective-1000">
        
        {/* Rainbow Border Outer Shell */}
        <div 
          className="relative w-full rounded-[2rem] p-2 shadow-2xl transition-transform duration-500 transform-gpu group-hover:-translate-y-2 group-hover:rotate-1"
          style={{ background: rainbowGradient }}
        >
          {/* Inner White Card */}
          <div className="bg-white dark:bg-stone-900 rounded-[1.5rem] p-5 border-[3px] border-stone-900/10 dark:border-white/10 shadow-inner flex flex-col h-full relative overflow-hidden">
            
            {/* Foil Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/10 opacity-50 mix-blend-overlay pointer-events-none z-20"></div>

            {/* Top Header */}
            <div className="flex justify-between items-center mb-4 z-10">
              <span className="text-sm font-black uppercase tracking-widest text-stone-800 dark:text-stone-100">{child.name}</span>
            </div>

            {/* Characters Banner (Smaller Height) */}
            <div className="w-full h-24 bg-stone-100 dark:bg-stone-800 rounded-2xl border-2 border-stone-200 dark:border-stone-700 shadow-inner flex items-center justify-around relative overflow-hidden mb-5 z-10 group/art">
              <div className="absolute inset-0 bg-gradient-to-br from-stone-200/50 to-transparent dark:from-stone-700/50 mix-blend-overlay"></div>
              
              <div className="flex flex-col items-center relative z-10">
                <ChildAvatar iconName={child.avatar_url} className="w-10 h-10 !border-none !bg-transparent text-stone-600 dark:text-stone-300 group-hover/art:scale-110 transition-transform duration-500 drop-shadow-xl" />
                <span className="text-[8px] font-bold text-stone-400 mt-1 uppercase tracking-widest">Avatar</span>
              </div>
              
              <div className="w-px h-12 bg-stone-200 dark:bg-stone-700 relative z-10"></div>

              <div className="flex flex-col items-center relative z-10">
                <img src="/characters/unicorn/stage-4.png" alt="Companion" className="w-14 h-14 object-contain group-hover/art:scale-110 transition-transform duration-500 drop-shadow-xl" />
                <span className="text-[8px] font-bold text-stone-400 mt-0.5 uppercase tracking-widest">Companion</span>
              </div>
            </div>

            {/* Middle Stats (Gold & Level Info) */}
            <div className="flex flex-col gap-3 mb-4 z-10 bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
               
               <div className="flex justify-between items-end">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Current Balance</span>
                   <div className="flex items-center">
                     <CoinBadge points={child.points} />
                   </div>
                 </div>
                 <div className="flex flex-col items-end text-right">
                   <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Level {child.level}</span>
                   <span className="text-amber-500 font-black text-sm">450/500 GOLD</span>
                 </div>
               </div>

               {/* Level Progress */}
               <div className="w-full">
                 <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-[90%] shadow-[0_0_5px_rgba(251,191,36,0.5)]"></div>
                 </div>
               </div>
            </div>

            {/* App Linked Status Row */}
            <div className="flex items-center justify-between mb-5 z-10 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5" /> App Linked</span>
               </div>
               <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{child.linked_email}</span>
            </div>

            {/* Refined Buttons - Option A: Minimalist horizontal text buttons */}
            <div className="flex justify-between items-center z-10 pt-2 border-t border-stone-100 dark:border-stone-800">
               <button className="flex flex-col items-center justify-center gap-1 flex-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors py-2">
                 <Settings className="w-5 h-5" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Adjust</span>
               </button>
               <div className="w-px h-8 bg-stone-100 dark:bg-stone-800"></div>
               <button className="flex flex-col items-center justify-center gap-1 flex-1 text-stone-500 hover:text-rose-500 transition-colors py-2">
                 <MinusCircle className="w-5 h-5" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Deduct</span>
               </button>
               <div className="w-px h-8 bg-stone-100 dark:bg-stone-800"></div>
               <button className="flex flex-col items-center justify-center gap-1 flex-1 text-stone-500 hover:text-indigo-500 transition-colors py-2">
                 <ScrollText className="w-5 h-5" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">History</span>
               </button>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}
