import React, { useState } from 'react';
import { Button } from './ui/Button';

export function TabsShowcase() {
  const [activeTab1, setActiveTab1] = useState<'profile' | 'security' | 'sharing' | 'danger'>('profile');
  const [activeTab2, setActiveTab2] = useState<'profile' | 'security' | 'sharing' | 'danger'>('profile');
  const [activeTab3, setActiveTab3] = useState<'profile' | 'security' | 'sharing' | 'danger'>('profile');
  const [activeTab4, setActiveTab4] = useState<'profile' | 'security' | 'sharing' | 'danger'>('profile');

  const tabs = [
    { id: 'profile', label: 'PROFILE' },
    { id: 'security', label: 'SECURITY' },
    { id: 'sharing', label: 'SHARING' },
    { id: 'danger', label: 'DANGER' }
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 p-8 sm:p-12 font-sans text-stone-900">
      <div className="max-w-3xl mx-auto space-y-16">
        <div>
          <h1 className="text-3xl font-black mb-2 font-display text-stone-800">Tabs Showcase</h1>
          <p className="text-stone-500 mb-8">Examples of different tab bar styles for the Settings page.</p>
        </div>

        {/* Current Style */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-stone-700">1. Current Style (Neobrutalist)</h2>
          <div className="flex bg-stone-100 p-1.5 rounded-xl mb-6 shadow-inner overflow-x-auto gap-1">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab1 === tab.id ? (tab.id === 'danger' ? 'danger' : 'secondary') : 'ghost'}
                size="sm"
                className={`flex-1 whitespace-nowrap ${activeTab1 !== tab.id && tab.id === 'danger' ? 'text-rose-400 hover:text-rose-500' : ''}`}
                onClick={() => setActiveTab1(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Option 1: Minimalist Segmented Control */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-stone-700">2. Minimalist Segmented Control (iOS Style)</h2>
          <div className="flex bg-stone-200/50 p-1.5 rounded-xl mb-6 overflow-x-auto">
            {tabs.map(tab => {
              const isActive = activeTab2 === tab.id;
              const isDanger = tab.id === 'danger';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab2(tab.id)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                    ${isActive 
                      ? `bg-white shadow-sm ${isDanger ? 'text-rose-600' : 'text-stone-900'}`
                      : `text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 ${isDanger ? 'hover:text-rose-500' : ''}`
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Option 2: Classic Underline Tabs */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-stone-700">3. Classic Underline Tabs</h2>
          <div className="flex border-b-2 border-stone-100 mb-6 overflow-x-auto">
            {tabs.map(tab => {
              const isActive = activeTab3 === tab.id;
              const isDanger = tab.id === 'danger';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab3(tab.id)}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-all whitespace-nowrap border-b-2 -mb-[2px]
                    ${isActive 
                      ? `${isDanger ? 'border-rose-500 text-rose-600' : 'border-sky-500 text-sky-600'}`
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Option 3: Soft Floating Pills */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-stone-700">4. Soft Floating Pills</h2>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map(tab => {
              const isActive = activeTab4 === tab.id;
              const isDanger = tab.id === 'danger';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab4(tab.id)}
                  className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap
                    ${isActive 
                      ? `${isDanger ? 'bg-rose-100 text-rose-700 shadow-sm border border-rose-200' : 'bg-sky-100 text-sky-700 shadow-sm border border-sky-200'}`
                      : 'bg-stone-100 text-stone-500 border border-transparent hover:bg-stone-200 hover:text-stone-700'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
