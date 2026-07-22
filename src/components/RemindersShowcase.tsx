import React from 'react';
import { Typography } from './ui/Typography';
import { motion } from 'motion/react';
import { Bell, ShieldAlert, HeartCrack, PiggyBank, Gift, Bone, Wrench, AlertTriangle, Info } from 'lucide-react';
import { FaBone, FaWrench, FaPiggyBank, FaGift } from 'react-icons/fa6';
import { getPetStripeBackground } from './ArcadeTicketCard';

export const RemindersShowcase = () => {
  const mockReminders = [
    { id: '1', type: 'food', text: 'Your pet is hungry!', urgency: 'high', icon: FaBone, color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' },
    { id: '2', type: 'maintenance', text: 'Maintenance Pot: Broken! Last fixed 14/07/2026', urgency: 'high', icon: FaWrench, color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' },
    { id: '3', type: 'savings', text: 'Time to deposit some coins!', urgency: 'medium', icon: FaPiggyBank, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" className="text-2xl font-black border-b-4 border-stone-200 dark:border-stone-700 pb-2 text-stone-800 dark:text-stone-100 uppercase tracking-widest">
          Reminders Concepts
        </Typography>
        <p className="text-stone-500 dark:text-stone-400 font-bold mb-4 mt-2">
          Options for displaying notifications and pot reminders on the home page.
        </p>
      </div>

      {/* Option 1: Stacked Mini-Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Option 1: Contextual Stacked Mini-Cards</span>
        <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-3xl border-2 border-stone-200 dark:border-stone-700 space-y-3">
          {mockReminders.map((reminder) => {
            const Icon = reminder.icon;
            return (
              <div key={reminder.id} className={`flex items-center gap-3 p-3 rounded-2xl border shadow-sm ${reminder.color}`}>
                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <Typography variant="body" className="font-bold text-sm">
                    {reminder.text}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Option 2: Horizontal Scroll Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Option 2: Horizontal Action Chips</span>
        <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-3xl border-2 border-stone-200 dark:border-stone-700">
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
            {mockReminders.map((reminder) => {
              const Icon = reminder.icon;
              return (
                <div key={reminder.id} className={`flex items-center gap-2 p-2 pr-4 rounded-full border shadow-sm shrink-0 whitespace-nowrap ${reminder.color}`}>
                  <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <Typography variant="body" className="font-bold text-xs uppercase tracking-wider">
                    {reminder.text}
                  </Typography>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Option 3: Single Compact Banner (Rotates or shows most urgent) */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Option 3: Priority Alert Banner</span>
        <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-3xl border-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-start gap-3 p-4 rounded-2xl border shadow-sm bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="flex-1">
              <Typography variant="body" className="font-black text-sm uppercase tracking-wider mb-1 text-white">
                Action Required!
              </Typography>
              <Typography variant="body" className="text-xs font-medium text-white/90">
                • {mockReminders[0].text}<br/>
                • {mockReminders[1].text}
              </Typography>
            </div>
            <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold">
              2 Alerts
            </div>
          </div>
        </div>
      </div>

      {/* Option 4: Rainbow Border Layout */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Option 4: Rainbow Border Banner</span>
        <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-3xl border-2 border-stone-200 dark:border-stone-700">
          <div className="w-full rounded-[1.6rem] p-[3px] shadow-md" style={{ background: getPetStripeBackground() }}>
            <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-[1.4rem] p-4 sm:p-5 flex items-start gap-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <div className="bg-stone-100 dark:bg-stone-800 p-2 rounded-xl shrink-0 mt-0.5 shadow-inner">
                <Bell className="w-5 h-5 text-stone-700 dark:text-stone-200 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 leading-tight tracking-tight">
                  Needs Attention!
                </Typography>
                <ul className="flex flex-col gap-2 mt-1">
                  {mockReminders.map((reminder) => {
                    const parts = reminder.text.split(':');
                    if (parts.length > 1) {
                      return (
                        <li key={reminder.id} className="flex gap-2 items-start text-xs text-stone-600 dark:text-stone-300 font-medium">
                          <span className="text-stone-300 mt-0.5 shrink-0">•</span>
                          <span><span className="font-bold text-stone-800 dark:text-stone-100 mr-1 uppercase tracking-wider text-[10px]">{parts[0]}:</span>{parts.slice(1).join(':')}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={reminder.id} className="flex gap-2 items-start text-xs text-stone-600 dark:text-stone-300 font-medium">
                        <span className="text-stone-300 mt-0.5 shrink-0">•</span>
                        <span>{reminder.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Option 5: Rainbow Border + Mini Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Option 5: Rainbow Border + Small Sections</span>
        <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-3xl border-2 border-stone-200 dark:border-stone-700">
          <div className="w-full rounded-[1.6rem] p-[3px] shadow-md" style={{ background: getPetStripeBackground() }}>
            <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 rounded-[1.4rem] p-4 sm:p-5 flex flex-col gap-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 dark:bg-stone-800 p-2 rounded-xl shrink-0 shadow-inner">
                  <Bell className="w-5 h-5 text-stone-700 dark:text-stone-200 animate-pulse" />
                </div>
                <Typography variant="h3" className="text-lg font-bold text-stone-900 dark:text-stone-50 leading-tight tracking-tight">
                  Needs Attention!
                </Typography>
              </div>
              <div className="flex flex-col gap-2 w-full mt-1">
                {mockReminders.map((reminder) => {
                  const Icon = reminder.icon;
                  return (
                    <div key={reminder.id} className={`flex items-center gap-2 p-2 rounded-xl border shadow-sm ${reminder.color}`}>
                      <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-sans font-bold text-xs text-inherit">
                          {reminder.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
