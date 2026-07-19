import React from 'react';
import { FaBone, FaTriangleExclamation } from 'react-icons/fa6';
import { LinearProgressBar } from './ProgressBar';
import { Button } from './ui/Button';

export const DashboardBottomConcepts = () => {
  const level = 4;
  const progress = 40; // 40%

  const renderConsole = (isDarkMode: boolean, hasFood: boolean) => {
    const foodCount = hasFood ? 6 : 0;
    
    return (
      <div className={`w-full relative rounded-3xl overflow-hidden flex items-end p-4 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center ${isDarkMode ? 'dark' : ''}`}>
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Unified Outer Container */}
        <div className="w-full relative z-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-[2rem] p-2 pr-2.5 flex items-stretch border-2 border-white/50 dark:border-stone-700/50 shadow-2xl">
          
          {/* Left Side: Level Progress */}
          <div className="flex-1 pl-3 pr-4 py-2 flex flex-col justify-center border-r-2 border-stone-200 dark:border-stone-800 border-dashed">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-black text-stone-800 dark:text-stone-100 uppercase tracking-widest">Level {level}</span>
              <span className="text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">250/500</span>
            </div>
            <LinearProgressBar progress={progress} heightClass="h-2" className="!bg-stone-200 dark:!bg-stone-800" />
            
            {/* Show warning text inline if no food */}
            {!hasFood && (
              <span className="text-[9px] text-black dark:text-white font-black mt-1.5 leading-tight flex items-center">
                <FaTriangleExclamation className="text-yellow-500 mr-1 shrink-0" />
                No food left!
              </span>
            )}
          </div>

          {/* Right Side: Feed Button */}
          <div className="w-[88px] shrink-0 pl-3 flex items-center">
            <div className="relative w-full">
              {/* Inventory Badge */}
              <div className={`absolute -top-2 -right-2 text-white text-[10px] font-black w-6 h-6 rounded-full border-2 shadow-lg z-20 flex items-center justify-center
                ${hasFood ? 'bg-orange-500 border-white dark:border-stone-900' : 'bg-stone-400 border-white dark:border-stone-900'}`}>
                {foodCount}
              </div>
              
              {/* Button */}
              <Button
                variant="none"
                size="none"
                disabled={!hasFood}
                className={`w-full h-[64px] rounded-2xl font-sans text-[10px] font-black uppercase flex flex-col items-center justify-center gap-1 transition-all
                  ${hasFood 
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white border-b-[4px] border-orange-700 hover:border-b-[2px] hover:translate-y-[2px] shadow-lg' 
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-2 border-stone-300 dark:border-stone-700 shadow-sm opacity-100 cursor-not-allowed'
                  }`}
              >
                <FaBone className="text-2xl drop-shadow-sm mb-0.5" />
                Feed
              </Button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 py-8 bg-stone-100 dark:bg-stone-950 px-4 rounded-3xl mt-12 border-4 border-stone-200 dark:border-stone-800">
      <div className="text-center">
        <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100 uppercase tracking-tight">Concept 3B Refined</h2>
        <p className="text-stone-500 text-sm mt-2 font-bold">Unified container approach in various states.</p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Light Mode - Has Food</h3>
          {renderConsole(false, true)}
        </div>

        <div>
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Light Mode - No Food</h3>
          {renderConsole(false, false)}
        </div>

        <div>
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Dark Mode - Has Food</h3>
          <div className="p-4 bg-stone-900 rounded-3xl">
            {renderConsole(true, true)}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Dark Mode - No Food</h3>
          <div className="p-4 bg-stone-900 rounded-3xl">
            {renderConsole(true, false)}
          </div>
        </div>
      </div>
    </div>
  );
};
