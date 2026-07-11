import React from 'react';
import { motion } from 'motion/react';
import { Plane } from 'lucide-react';
import { ChildAvatar } from './ChildAvatar';

export interface ChildData {
  id: string;
  name: string;
  avatar_url: string;
  age?: number;
  level: number;
  streak_days: number;
  points: number;
}

export interface BoardingPassCardProps {
  child: ChildData;
  onClick?: () => void;
  isLoading?: boolean;
  key?: string;
}

export function BoardingPassCard({ child, onClick, isLoading = false }: BoardingPassCardProps) {
  if (isLoading) {
    return (
      <div className="w-full flex shadow-sm rounded-2xl overflow-hidden animate-pulse relative h-48 sm:h-56">
        <div className="flex-[3] bg-stone-100 border border-stone-200 border-r-0 rounded-l-2xl" />
        <div className="w-4 sm:w-6 shrink-0 bg-white relative flex flex-col justify-between border-y border-stone-200">
          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-stone-50 rounded-b-full absolute top-0 left-0 border-b border-stone-200" />
          <div className="absolute top-6 bottom-6 sm:top-8 sm:bottom-8 left-1/2 -translate-x-1/2 w-px border-l-2 sm:border-l-[3px] border-dotted border-stone-300" />
          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-stone-50 rounded-t-full absolute bottom-0 left-0 border-t border-stone-200" />
        </div>
        <div className="flex-1 shrink-0 bg-stone-50 border border-stone-200 border-l-0 rounded-r-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full cursor-pointer group flex shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden relative"
    >
      {/* Main Pass Body */}
      <div className="flex-[3] bg-white border border-stone-200 border-r-0 flex flex-col relative z-10">
        {/* Header */}
        <div className="h-8 sm:h-10 bg-[#0033A0] flex items-center justify-between px-3 sm:px-6 border-b border-[#002277]">
          <div className="flex items-center gap-2 text-white font-bold tracking-widest text-xs uppercase">
            <Plane className="w-4 h-4" /> <span>Reward Airways</span>
          </div>
          <div className="text-blue-200 font-sans text-[10px] tracking-widest uppercase">
            First Class
          </div>
        </div>
        
        <div className="p-2 sm:p-6 flex justify-between items-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
          
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="w-12 h-12 sm:w-24 sm:h-24 shrink-0 rounded-lg bg-stone-100 border-2 border-white shadow-md overflow-hidden bg-white">
              <ChildAvatar iconName={child.avatar_url} className="w-full h-full !rounded-none border-none" />
            </div>
            
            <div className="flex flex-col justify-center py-1 sm:py-2">
              <div>
                <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-0.5 sm:mb-1 block">Name of Passenger</span>
                <h3 className="text-xl sm:text-3xl font-black font-display text-stone-900 uppercase tracking-tight leading-none">
                  {child.name}
                  {child.age && <span className="text-sm sm:text-xl text-stone-500 font-normal ml-2">({child.age})</span>}
                </h3>
              </div>
              
              <div className="flex gap-2 sm:gap-10 mt-2 sm:mt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Flight</span>
                  <span className="font-sans font-bold text-stone-800 text-sm sm:text-lg">RW-{child.level.toString().padStart(3, '0')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Gate</span>
                  <span className="font-sans font-bold text-stone-800 text-sm sm:text-lg">{child.streak_days > 0 ? child.streak_days : 'TBD'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Seat</span>
                  <span className="font-sans font-bold text-[#0033A0] text-sm sm:text-lg">{child.points || '00'}A</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end shrink-0 ml-2 sm:ml-4">
            <div className="w-16 sm:w-32 h-8 sm:h-16 flex justify-between items-end opacity-60">
              <div className="w-0.5 sm:w-1 h-full bg-stone-800" />
              <div className="w-1 sm:w-2 h-full bg-stone-800" />
              <div className="w-0.5 sm:w-1 h-full bg-stone-800" />
              <div className="w-1.5 sm:w-3 h-full bg-stone-800" />
              <div className="w-px sm:w-0.5 h-full bg-stone-800" />
              <div className="w-0.5 sm:w-1 h-full bg-stone-800" />
              <div className="w-1 sm:w-2 h-full bg-stone-800" />
              <div className="w-1 sm:w-1.5 h-full bg-stone-800" />
              <div className="w-0.5 sm:w-1 h-full bg-stone-800" />
              <div className="w-px sm:w-0.5 h-full bg-stone-800" />
              <div className="w-1 sm:w-2 h-full bg-stone-800" />
              <div className="w-0.5 sm:w-1 h-full bg-stone-800" />
              <div className="w-px sm:w-0.5 h-full bg-stone-800" />
            </div>
            <span className="font-sans text-[7px] sm:text-[9px] mt-1 text-stone-500 tracking-widest uppercase">TKT-{child.id.substring(0,8)}</span>
          </div>
          
        </div>
      </div>
      
      {/* Divider with Notches */}
      <div className="w-4 sm:w-6 shrink-0 bg-white relative flex flex-col justify-between border-y border-stone-200 z-0">
        {/* Top Notch */}
        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-stone-100 rounded-b-full absolute top-0 left-0 border-b border-stone-200 shadow-inner" />
        
        {/* Perforation Line */}
        <div className="absolute top-6 bottom-6 sm:top-8 sm:bottom-8 left-1/2 -translate-x-1/2 w-px border-l-2 sm:border-l-[3px] border-dotted border-stone-300" />
        
        {/* Bottom Notch */}
        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-stone-100 rounded-t-full absolute bottom-0 left-0 border-t border-stone-200 shadow-inner" />
      </div>
      
      {/* Tear-off Stub */}
      <div className="flex-1 shrink-0 bg-stone-50 border border-stone-200 border-l-0 flex flex-col relative overflow-hidden z-10">
        <div className="h-10 bg-[#0033A0] w-full border-b border-[#002277]" />
        <div className="p-4 sm:p-6 flex flex-col h-full justify-between items-center relative overflow-hidden">
          
          <Plane className="absolute -right-8 -bottom-8 w-24 h-24 sm:w-32 sm:h-32 text-stone-200 opacity-40 -rotate-45 pointer-events-none z-0" />

          <div className="w-full text-center mb-2 sm:mb-4 relative z-10">
            <span className="text-[8px] sm:text-[9px] text-stone-500 font-bold uppercase tracking-wider block mb-0.5 sm:mb-1">Boarding Time</span>
            <span className="font-sans font-black text-[#0033A0] text-lg sm:text-xl">NOW</span>
          </div>

          <div className="w-full flex justify-between relative z-10">
            <div className="flex flex-col text-center w-1/2">
              <span className="text-[9px] text-stone-500 font-bold uppercase">Zone</span>
              <span className="font-black text-3xl text-stone-800 leading-none mt-1">1</span>
            </div>
            <div className="flex flex-col text-center w-1/2">
              <span className="text-[9px] text-stone-500 font-bold uppercase">Class</span>
              <span className="font-black text-3xl text-stone-800 leading-none mt-1">F</span>
            </div>
          </div>
        </div>
      </div>
        
    </motion.div>
  );
}
