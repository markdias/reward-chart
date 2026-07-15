import React from 'react';
import { Typography } from './ui/Typography';
import { Users, BookOpen, Star, ShieldCheck, Gamepad2, Settings } from 'lucide-react';

export function HelpTab() {
  return (
    <div className="space-y-6 animate-fade-in-up w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Typography variant="h1" className={`text-xl sm:text-2xl font-black text-stone-800 dark:text-stone-100 mb-1 tracking-tight`}>
            How to Use the App
          </Typography>
          <Typography variant="body" className={`text-stone-600 dark:text-stone-400 text-sm`}>
            A complete guide to the chore and reward ecosystem
          </Typography>
        </div>
      </div>

      <div className={`p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm space-y-8`}>
        {/* Parent Mode */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <Typography variant="h3" className={`text-lg font-bold text-stone-800 dark:text-stone-100`}>For Parents (Parent Mode)</Typography>
          </div>
          <Typography variant="body" className={`text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4`}>
            Parent Mode is your control center. It is protected by a password to ensure kids can't accidentally (or intentionally!) approve their own tasks.
          </Typography>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
              <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-stone-400" /> Managing Children</h4>
              <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                <li><strong>Add a Child:</strong> Set up a profile for each child, including their starting level.</li>
                <li><strong>Track Progress:</strong> View their current level, gold coin balance, and recent activity from the home tab.</li>
              </ul>
            </div>
            
            <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
              <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-stone-400" /> Rewards Store</h4>
              <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                <li><strong>Create Rewards:</strong> Set up real-life rewards (e.g., "Trip to the Park", "New Toy") and price them in gold coins.</li>
                <li><strong>Customization:</strong> Assign specific icons to make the rewards visually appealing for kids.</li>
              </ul>
            </div>
            
            <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800 sm:col-span-2">
              <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-stone-400" /> The Pot Ecosystem (Tasks & Routines)</h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">Instead of a boring list of chores, tasks are categorized into distinct "Pots" to build a healthy, balanced routine:</p>
              <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                <li><strong>Chores Pot:</strong> Household duties (e.g., Tidy room, Empty dishwasher).</li>
                <li><strong>Learning Pot:</strong> Educational goals (e.g., Read for 20 minutes, Math practice).</li>
                <li><strong>Care Pot:</strong> Personal hygiene and self-care (e.g., Brush teeth, Shower).</li>
                <li><strong>Maintenance Pot:</strong> Recurring baseline habits required to keep their virtual pet happy.</li>
              </ul>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2"><strong>How to manage:</strong> Create new tasks, assign them, set the coin reward, and choose repeat days from the Tasks tab.</p>
            </div>
          </div>
        </section>

        <hr className="border-stone-100 dark:border-stone-700" />

        {/* Child Mode */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <Typography variant="h3" className={`text-lg font-bold text-stone-800 dark:text-stone-100`}>For Kids (Child Mode)</Typography>
          </div>
          <Typography variant="body" className={`text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4`}>
            Child Mode is a gamified, safe space where kids can see their progress, interact with their virtual pet, and earn rewards.
          </Typography>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
              <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2">Daily Quests (Tasks)</h4>
              <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                <li><strong>To-Do List:</strong> See daily tasks categorized by their Pots.</li>
                <li><strong>Completing Tasks:</strong> Tapping a task marks it as "Pending Approval." Once approved, coins rain down!</li>
              </ul>
            </div>
            
            <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800">
              <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2">Claiming Rewards</h4>
              <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                <li><strong>The Shop:</strong> Browse available rewards set up by parents.</li>
                <li><strong>Redeeming:</strong> "Buy" a reward to deduct coins and send a request to the parent's inbox.</li>
              </ul>
            </div>
            
            <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800 sm:col-span-2">
              <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-2">Pet Ecosystem & Leveling Up</h4>
              <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2 list-disc pl-4">
                <li><strong>Virtual Pet:</strong> Every child gets a virtual companion (like the Emerald Dragon) on their dashboard.</li>
                <li><strong>Feeding & Maintenance:</strong> Completing tasks keeps the pet fed and happy. If neglected, the pet gets hungry!</li>
                <li><strong>Leveling Up:</strong> Earning gold coins fills up the XP bar. Reaching a new level triggers an exciting evolution sequence where their pet grows!</li>
              </ul>
            </div>
          </div>
        </section>
        
        <hr className="border-stone-100 dark:border-stone-700" />

        {/* General */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <Typography variant="h3" className={`text-lg font-bold text-stone-800 dark:text-stone-100`}>General Features</Typography>
          </div>
          <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-3 list-disc pl-5">
            <li><strong>Offline Mode:</strong> The app works even without an internet connection! Any tasks completed offline will automatically sync once you're back online.</li>
            <li><strong>Push Notifications:</strong> Get reminded about pending approvals or incomplete daily tasks.</li>
            <li><strong>Dark Mode:</strong> Fully supports both light and dark themes for comfortable viewing anytime.</li>
            <li><strong>Family Sharing:</strong> Invite another parent or guardian to manage the same family dashboard via a simple share link.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
