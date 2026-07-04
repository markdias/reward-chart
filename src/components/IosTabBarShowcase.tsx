import React, { useState } from 'react';
import { Home, CheckCircle, Gift, ArrowLeft } from 'lucide-react';
import { FaCat } from 'react-icons/fa';
import { FaJar } from 'react-icons/fa6';

export function IosTabBarShowcase() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'rewards', label: 'Prizes', icon: Gift },
    { id: 'companion', label: 'Pet', icon: FaCat },
    { id: 'pots', label: 'Pots', icon: FaJar }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative pb-safe">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
        <a href="/" className="mr-4 p-2 rounded-full hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </a>
        <h1 className="text-xl font-bold text-slate-800">iOS Tab Bar Concepts</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-12 pb-40">
        
        {/* Concept 1: Classic iOS (Apple Native) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">1. Classic iOS Translucent (Native Feel)</h2>
            <p className="text-sm text-slate-500">Frosted glass, standard iOS blue tint, tight text-to-icon spacing.</p>
          </div>
          
          <div className="relative w-full max-w-sm mx-auto h-[300px] bg-cover bg-center rounded-[40px] overflow-hidden border-8 border-slate-800 shadow-2xl" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600)' }}>
            <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 pt-4 px-4 bg-gradient-to-t from-white/40 to-transparent" />
            
            {/* The Tab Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/50 pb-safe pt-2 flex justify-around items-center px-2 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative w-full max-w-[64px] flex flex-col items-center justify-center transition-colors ${
                      isSelected ? 'text-[#007AFF]' : 'text-slate-400'
                    }`}
                  >
                    <Icon 
                      className={`w-6 h-6 mb-1 ${isSelected ? 'scale-105 transition-transform duration-200' : ''}`} 
                      fill={isSelected && tab.id !== 'companion' && tab.id !== 'pots' ? "currentColor" : "none"}
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    <span className={`text-[10px] tracking-tight ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Concept 2: Modern Floating Island */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">2. Floating Dynamic Island (Modern/Playful)</h2>
            <p className="text-sm text-slate-500">Detached pill, heavy shadow, fluid pill indicator.</p>
          </div>
          
          <div className="relative w-full max-w-sm mx-auto h-[300px] bg-slate-100 rounded-[40px] overflow-hidden border-8 border-slate-800 shadow-2xl">
            {/* The Tab Bar */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-full pb-safe-offset-4 pt-0 flex justify-around items-center px-2 h-16 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/40">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative h-full flex-1 flex flex-col items-center justify-center transition-all ${
                      isSelected ? 'text-slate-800' : 'text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 w-8 h-1 bg-slate-800 rounded-full" />
                    )}
                    <Icon 
                      className={`w-6 h-6 transition-all duration-300 ${isSelected ? '-translate-y-0.5' : ''}`} 
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    <span className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Concept 3: Minimalist Solid (Clean) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">3. High-Contrast Minimalist (Bold)</h2>
            <p className="text-sm text-slate-500">Solid white, no labels, bold active states.</p>
          </div>
          
          <div className="relative w-full max-w-sm mx-auto h-[300px] bg-slate-50 rounded-[40px] overflow-hidden border-8 border-slate-800 shadow-2xl">
            
            {/* The Tab Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe h-16 flex justify-around items-center px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative p-2 rounded-2xl transition-all duration-300 ${
                      isSelected ? 'bg-slate-900 text-white shadow-md scale-110' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isSelected ? 2.5 : 2} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Concept 4: Neon Glow (Dark Theme) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">4. Dark Neon (Game / Night Mode)</h2>
            <p className="text-sm text-slate-500">Dark background, glowing active indicators.</p>
          </div>
          
          <div className="relative w-full max-w-sm mx-auto h-[300px] bg-slate-900 rounded-[40px] overflow-hidden border-8 border-slate-800 shadow-2xl">
            {/* The Tab Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 pb-safe h-16 flex justify-around items-center px-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 h-full flex flex-col items-center justify-center transition-all duration-300 ${
                      isSelected ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-400/10 rounded-xl blur-md" />
                    )}
                    <Icon 
                      className={`w-6 h-6 mb-1 relative z-10 ${isSelected ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`} 
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    <span className={`text-[9px] font-bold tracking-widest relative z-10 ${isSelected ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-500'}`}>
                      {tab.label.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Concept 5: Expanding Pill (Hybrid) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">5. Expanding Pill (Hybrid)</h2>
            <p className="text-sm text-slate-500">Animated background pill that expands to fit the label.</p>
          </div>
          
          <div className="relative w-full max-w-sm mx-auto h-[300px] bg-indigo-50 rounded-[40px] overflow-hidden border-8 border-slate-800 shadow-2xl">
            {/* The Tab Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe pt-2 flex justify-around items-center px-4 rounded-t-3xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center transition-all duration-500 overflow-hidden ${
                      isSelected ? 'w-24 bg-indigo-100 text-indigo-700 py-2.5 px-3 rounded-full' : 'w-12 text-slate-400 py-2'
                    }`}
                  >
                    <Icon 
                      className={`shrink-0 transition-all duration-500 ${isSelected ? 'w-5 h-5' : 'w-6 h-6'}`} 
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    <span 
                      className={`text-[10px] font-bold ml-1.5 whitespace-nowrap transition-all duration-500 ${
                        isSelected ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Concept 6: Floating Pill with Highlight (Light Theme) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">6. Floating Highlighted Pill (Light)</h2>
            <p className="text-sm text-slate-500">Floating rounded bar where the active item gets a subtle pill background.</p>
          </div>
          
          <div className="relative w-full max-w-sm mx-auto h-[300px] bg-slate-100/50 rounded-[40px] overflow-hidden border-8 border-slate-800 shadow-2xl">
            {/* The Tab Bar */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[2rem] p-1.5 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative w-16 h-14 flex flex-col items-center justify-center transition-all duration-300 rounded-[1.25rem] ${
                      isSelected ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon 
                      className={`w-6 h-6 mb-0.5 transition-transform ${isSelected ? 'scale-105' : ''}`} 
                      fill={isSelected && tab.id !== 'companion' && tab.id !== 'pots' ? "currentColor" : "none"}
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    <span className={`text-[9px] font-bold tracking-tight`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
