import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, Crown, Ticket, Sparkles, QrCode } from 'lucide-react';
import { Typography } from './ui/Typography';

import { ChildAvatar } from './ChildAvatar';

export default function PlayerSelectionShowcase() {
  const [selectedVariation, setSelectedVariation] = useState<number>(1);
  const children = [
    {
      id: 'mock-1',
      name: 'Leo',
      avatar_url: 'lion',
      level: 4,
      streak_days: 12,
      points: 450,
    },
    {
      id: 'mock-2',
      name: 'Lily',
      avatar_url: 'butterfly',
      level: 2,
      streak_days: 5,
      points: 120,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-12 text-center">
          <Typography variant="h1" as="h1" className="mb-4 text-slate-800">
            Boarding Pass Iterations
          </Typography>
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedVariation(num)}
                className={`px-8 py-2 rounded-full font-bold transition-all border-2 ${
                  selectedVariation === num
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                Pass {num}
              </button>
            ))}
          </div>
        </header>

        <div className="min-h-[65vh] flex flex-col items-center justify-center relative">
          {selectedVariation === 1 && (
            <IterationOne children={children} />
          )}

          {selectedVariation === 2 && (
            <IterationTwo children={children} />
          )}

          {selectedVariation === 3 && (
            <IterationThree children={children} />
          )}
        </div>
      </div>
    </div>
  );
}

// Iteration 1: Classic Authentic Airline
function IterationOne({ children }: { children: any[] }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl px-4">
      {children.map((child) => (
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          key={child.id}
          className="w-full cursor-pointer group flex shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden relative"
        >
          {/* Main Pass Body */}
          <div className="flex-[3] bg-white border border-slate-200 border-r-0 flex flex-col relative z-10">
            {/* Header */}
            <div className="h-10 bg-[#0033A0] flex items-center justify-between px-6 border-b border-[#002277]">
              <div className="flex items-center gap-2 text-white font-bold tracking-widest text-xs uppercase">
                <Plane className="w-4 h-4" /> <span>Reward Airways</span>
              </div>
              <div className="text-blue-200 font-mono text-[10px] tracking-widest uppercase">
                Economy Class
              </div>
            </div>
            
            <div className="p-6 flex justify-between items-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
              
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-white shadow-md overflow-hidden bg-white">
                  <ChildAvatar iconName={child.avatar_url} className="w-full h-full !rounded-none border-none" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Name of Passenger</span>
                  <h3 className="text-3xl font-black font-display text-slate-900 uppercase tracking-tight leading-none mb-4">
                    {child.name}
                  </h3>
                  
                  <div className="flex gap-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Flight</span>
                      <span className="font-mono font-bold text-slate-800 text-lg">RW-{child.level.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gate</span>
                      <span className="font-mono font-bold text-slate-800 text-lg">{child.streak_days > 0 ? child.streak_days : 'TBD'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Seat</span>
                      <span className="font-mono font-bold text-[#0033A0] text-lg">{child.points || '00'}A</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex flex-col items-end">
                <div className="w-32 h-16 flex justify-between items-end opacity-60">
                  <div className="w-1 h-full bg-slate-800" />
                  <div className="w-2 h-full bg-slate-800" />
                  <div className="w-1 h-full bg-slate-800" />
                  <div className="w-3 h-full bg-slate-800" />
                  <div className="w-0.5 h-full bg-slate-800" />
                  <div className="w-1 h-full bg-slate-800" />
                  <div className="w-2 h-full bg-slate-800" />
                  <div className="w-1.5 h-full bg-slate-800" />
                  <div className="w-1 h-full bg-slate-800" />
                  <div className="w-0.5 h-full bg-slate-800" />
                  <div className="w-2 h-full bg-slate-800" />
                  <div className="w-1 h-full bg-slate-800" />
                  <div className="w-0.5 h-full bg-slate-800" />
                </div>
                <span className="font-mono text-[9px] mt-1 text-slate-500 tracking-widest uppercase">TKT-{child.id.substring(0,8)}</span>
              </div>
              
            </div>
          </div>
          
          {/* Divider with Notches */}
          <div className="w-6 bg-white relative flex flex-col justify-between border-y border-slate-200 z-0">
            {/* Top Notch */}
            <div className="w-6 h-6 bg-slate-100 rounded-b-full absolute top-0 left-0 border-b border-slate-200 shadow-inner" />
            
            {/* Perforation Line */}
            <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-px border-l-[3px] border-dotted border-slate-300" />
            
            {/* Bottom Notch */}
            <div className="w-6 h-6 bg-slate-100 rounded-t-full absolute bottom-0 left-0 border-t border-slate-200 shadow-inner" />
          </div>
          
          {/* Tear-off Stub */}
          <div className="flex-1 bg-slate-50 border border-slate-200 border-l-0 flex flex-col relative overflow-hidden z-10">
            <div className="h-10 bg-[#0033A0] w-full border-b border-[#002277]" />
            <div className="p-6 flex flex-col h-full justify-between items-center relative overflow-hidden">
              
              <Plane className="absolute -right-8 -bottom-8 w-32 h-32 text-slate-200 opacity-40 -rotate-45 pointer-events-none z-0" />

              <div className="w-full text-center mb-4 relative z-10">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Boarding Time</span>
                <span className="font-mono font-black text-[#0033A0] text-xl">NOW</span>
              </div>

              <div className="w-full flex justify-between relative z-10">
                <div className="flex flex-col text-center w-1/2">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Zone</span>
                  <span className="font-black text-3xl text-slate-800 leading-none mt-1">1</span>
                </div>
                <div className="flex flex-col text-center w-1/2">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Class</span>
                  <span className="font-black text-3xl text-slate-800 leading-none mt-1">F</span>
                </div>
              </div>
            </div>
          </div>
          
        </motion.div>
      ))}
    </div>
  );
}

// Iteration 2: Premium First Class (Black & Gold)
function IterationTwo({ children }: { children: any[] }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl px-4">
      {children.map((child) => (
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          key={child.id}
          className="w-full cursor-pointer group flex shadow-[0_15px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-shadow rounded-2xl overflow-hidden relative"
        >
          {/* Main Pass Body */}
          <div className="flex-[3] bg-[#1A1A1A] border border-[#333] border-r-0 flex flex-col relative z-10">
            <div className="h-12 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] flex items-center justify-between px-6 border-b border-[#8A6305]">
              <div className="flex items-center gap-2 text-black font-black tracking-widest text-xs uppercase">
                <Crown className="w-4 h-4" /> <span>Prestige Airways</span>
              </div>
              <div className="text-black/70 font-mono text-[10px] tracking-widest font-black uppercase">
                VIP BOARDING
              </div>
            </div>
            
            <div className="p-6 flex justify-between items-center">
              
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-slate-800 border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] overflow-hidden">
                  <ChildAvatar iconName={child.avatar_url} className="w-full h-full !rounded-none border-none grayscale-[30%] contrast-125" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider mb-1 opacity-80">Passenger Name</span>
                  <h3 className="text-3xl font-black font-serif text-white uppercase tracking-wider mb-4">
                    {child.name}
                  </h3>
                  
                  <div className="flex gap-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider opacity-80">Level</span>
                      <span className="font-mono font-bold text-white text-lg">{child.level.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider opacity-80">Streak</span>
                      <span className="font-mono font-bold text-white text-lg">{child.streak_days > 0 ? child.streak_days : 'TBD'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider opacity-80">Coins</span>
                      <span className="font-mono font-bold text-[#D4AF37] text-lg">{child.points || '00'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex flex-col items-center">
                <div className="p-2 bg-white rounded-lg">
                  <QrCode className="w-16 h-16 text-black" />
                </div>
                <span className="font-mono text-[9px] mt-2 text-[#D4AF37] tracking-widest uppercase opacity-70">VIP-{child.id.substring(0,6)}</span>
              </div>
              
            </div>
          </div>
          
          {/* Divider with Notches */}
          <div className="w-6 bg-[#1A1A1A] relative flex flex-col justify-between border-y border-[#333] z-0">
            {/* Top Notch */}
            <div className="w-6 h-6 bg-slate-100 rounded-b-full absolute top-0 left-0 border-b border-[#333] shadow-inner" />
            
            {/* Perforation Line */}
            <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-px border-l-[3px] border-dotted border-[#444]" />
            
            {/* Bottom Notch */}
            <div className="w-6 h-6 bg-slate-100 rounded-t-full absolute bottom-0 left-0 border-t border-[#333] shadow-inner" />
          </div>
          
          {/* Tear-off Stub */}
          <div className="flex-1 bg-[#1A1A1A] border border-[#333] border-l-0 flex flex-col relative overflow-hidden z-10">
            <div className="h-12 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] w-full border-b border-[#8A6305]" />
            <div className="p-6 flex flex-col h-full justify-between items-center relative">
              
              <Crown className="absolute right-4 bottom-4 w-24 h-24 text-[#222] -rotate-12" />

              <div className="w-full text-center mb-4 z-10">
                <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider block mb-1">Boarding</span>
                <span className="font-mono font-black text-white text-xl uppercase tracking-widest">Priority</span>
              </div>

              <div className="w-full flex justify-between z-10">
                <div className="flex flex-col text-center w-full">
                  <span className="text-[8px] text-[#D4AF37] font-bold uppercase tracking-widest">Class</span>
                  <span className="font-serif italic font-black text-3xl text-white mt-1">First</span>
                </div>
              </div>
            </div>
          </div>
          
        </motion.div>
      ))}
    </div>
  );
}

// Iteration 3: Magical Kids Pass (Fun, colorful, theme park style)
function IterationThree({ children }: { children: any[] }) {
  const themes = [
    { bg: 'bg-rose-50', header: 'bg-rose-400', text: 'text-rose-900', accent: 'text-rose-500' },
    { bg: 'bg-cyan-50', header: 'bg-cyan-400', text: 'text-cyan-900', accent: 'text-cyan-600' },
    { bg: 'bg-amber-50', header: 'bg-amber-400', text: 'text-amber-900', accent: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl px-4">
      {children.map((child, idx) => {
        const theme = themes[idx % themes.length];
        
        return (
          <motion.div
            whileHover={{ scale: 1.02, rotate: idx % 2 === 0 ? 1 : -1 }}
            whileTap={{ scale: 0.98 }}
            key={child.id}
            className="w-full cursor-pointer group flex shadow-sm hover:shadow-lg transition-all rounded-3xl overflow-hidden relative"
          >
            {/* Main Pass Body */}
            <div className={`flex-[3] ${theme.bg} border-2 border-white flex flex-col relative z-10`}>
              {/* Header */}
              <div className={`h-12 ${theme.header} flex items-center justify-between px-6 border-b-4 border-white/20`}>
                <div className="flex items-center gap-2 text-white font-black tracking-widest text-sm uppercase font-display">
                  <Sparkles className="w-5 h-5 fill-white" /> <span>Magic Flight</span>
                </div>
              </div>
              
              <div className="p-6 flex justify-between items-center relative">
                
                <div className="flex items-center gap-6 z-10">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden relative">
                    <ChildAvatar iconName={child.avatar_url} className="w-full h-full" />
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className={`text-4xl font-black font-display ${theme.text} uppercase tracking-tight leading-none mb-3 drop-shadow-sm`}>
                      {child.name}
                    </h3>
                    
                    <div className="flex gap-4">
                      <div className="bg-white rounded-xl px-3 py-1 flex items-center gap-2 shadow-sm">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">LVL</span>
                        <span className={`font-black ${theme.text} text-lg leading-none`}>{child.level}</span>
                      </div>
                      <div className="bg-white rounded-xl px-3 py-1 flex items-center gap-2 shadow-sm">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">STRK</span>
                        <span className={`font-black ${theme.text} text-lg leading-none`}>{child.streak_days}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Big decorative icon */}
                <Plane className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${theme.accent} opacity-10 -rotate-12`} />
                
                <div className="hidden md:flex flex-col items-end z-10">
                  <div className={`text-4xl font-black font-display ${theme.accent} opacity-50`}>
                    #{child.points || 0}
                  </div>
                  <span className={`font-bold text-[10px] mt-1 ${theme.text} uppercase tracking-widest`}>Gold Coins</span>
                </div>
                
              </div>
            </div>
            
            {/* Divider with Notches - using white to blend with outer bg */}
            <div className={`w-6 ${theme.bg} relative flex flex-col justify-between border-y-2 border-white z-0`}>
              <div className="w-8 h-8 bg-slate-100 rounded-full absolute -top-4 -left-1 shadow-inner border border-slate-200" />
              <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-px border-l-[4px] border-dashed border-white" />
              <div className="w-8 h-8 bg-slate-100 rounded-full absolute -bottom-4 -left-1 shadow-inner border border-slate-200" />
            </div>
            
            {/* Tear-off Stub */}
            <div className={`flex-1 ${theme.bg} border-2 border-l-0 border-white flex flex-col relative overflow-hidden z-10`}>
              <div className={`h-12 ${theme.header} w-full border-b-4 border-white/20`} />
              <div className="p-6 flex flex-col h-full justify-center items-center relative">
                
                <div className="w-full text-center z-10">
                  <span className={`text-[10px] ${theme.text} font-bold uppercase tracking-widest block mb-2 opacity-80`}>Ready for takeoff</span>
                  <Ticket className={`w-12 h-12 mx-auto ${theme.accent}`} />
                  <span className={`font-black font-display ${theme.text} text-2xl uppercase tracking-widest mt-2 block`}>ADMIT 1</span>
                </div>

              </div>
            </div>
            
          </motion.div>
        );
      })}
    </div>
  );
}
