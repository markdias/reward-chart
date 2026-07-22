import React from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
  isBeta?: boolean;
}

export interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  layoutId?: string;
  className?: string;
}

export function BottomTabBar({
  tabs,
  activeTab,
  onTabChange,
  layoutId = 'bottom-tab-bar',
  className = ''
}: BottomTabBarProps) {
  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pt-4 pb-safe-bottom mb-4 ${className}`}>
      <div className="bg-white dark:bg-stone-900/20 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl p-2 flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              id={`tour-mobile-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`joyride-target-${tab.id} relative flex-1 flex flex-col items-center justify-center p-2 rounded-2xl touch-target`}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 bg-cyan-500/15 rounded-2xl border border-cyan-500/10 shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-300 drop-shadow-sm ${isActive ? 'text-cyan-600' : 'text-stone-400'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                  {tab.isBeta && (
                    <span className="absolute -top-1.5 -right-3.5 bg-indigo-500 text-white text-[7px] font-black px-1 rounded-full uppercase shadow-xs">
                      BETA
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold tracking-wider transition-colors duration-300 flex items-center gap-0.5 ${isActive ? 'text-cyan-600' : 'text-stone-500 dark:text-stone-400'}`}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
