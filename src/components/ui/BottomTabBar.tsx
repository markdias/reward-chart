import React from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
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
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pt-4 safe-area-bottom pb-4 ${className}`}>
      <div className="bg-white/80 backdrop-blur-xl border border-stone-200/50 rounded-3xl p-2 flex items-center justify-between shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center p-2 rounded-2xl touch-target"
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 bg-stone-900 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white' : 'text-stone-400'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold tracking-wider transition-colors duration-300 ${isActive ? 'text-white' : 'text-stone-500'}`}>
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
