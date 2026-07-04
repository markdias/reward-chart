import React from 'react';
import { FaBowlFood, FaGlobe, FaTrophy, FaStar } from 'react-icons/fa6';
import { Lock, Play, Gift } from 'lucide-react';
import { Button } from './ui/Button';

export default function TypographyShowcase() {
  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl font-black font-display text-stone-900">Typography System Showcase</h1>
          <p className="text-stone-500 font-mono text-sm uppercase tracking-wider">Preview of text styles across the app</p>
        </div>

        {/* 1. Page Headers (Child Dashboard / Landing Page) */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">1. Main Page Headers</h2>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-8">
            <div>
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">Child Dashboard Greeting (text-2xl / text-4xl)</p>
              <h2 className="text-2xl md:text-4xl font-black font-display text-stone-900">
                Hi, Leo!
              </h2>
            </div>
            
            <div>
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">Landing Page Hero (text-3xl / text-5xl)</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-stone-900 leading-tight">
                Make Routines <br />
                Fun & Rewarding
              </h1>
            </div>
          </div>
        </section>

        {/* 2. Card & Section Titles (Parent Dashboard / Settings) */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">2. Card & Section Titles</h2>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Parent Dashboard Tab (text-xl)</p>
              <h2 className="text-xl font-bold font-display tracking-wide text-slate-900">
                Quest Directory
              </h2>
              <p className="text-sm text-stone-600">
                Manage your child's quests and tasks.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Child Dashboard Pot (text-sm)</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h4 className="font-black text-sm text-slate-900 leading-none">Food Pot</h4>
                <button className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-orange-700" /> Play Video
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Small Labels & Overlines (Metadata) */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">3. Small Labels & Overlines</h2>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">Form Label (Parent Dashboard)</p>
                <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase tracking-widest mb-1">Quest Name</label>
                <input type="text" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm" placeholder="Clean your room..." readOnly />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">Card Overline (Child Dashboard)</p>
                <span className="text-[8px] font-mono tracking-widest uppercase text-stone-500 font-extrabold">GIFTING POT</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Numbers & Counters (Coins) */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">4. Numbers & Counters (Monospace)</h2>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-6">
            <div>
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">Large Point Counter (Deposit Modal)</p>
              <div className="flex items-center gap-2 bg-amber-50 p-4 rounded-2xl border border-amber-200 w-fit">
                <span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm tabular-nums">42</span>
                <span className="text-sm font-bold text-amber-700">GOLD COINS</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">Small Badge (Top Nav)</p>
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl w-fit">
                <FaStar className="w-4 h-4 text-orange-500" />
                <span className="text-lg font-mono font-black text-orange-700 tabular-nums">125</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Subtitles & Helpers */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-100 pb-2">5. Subtitles & Helpers</h2>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-6">
            <div>
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2">Muted Explanatory Text (Child Dashboard)</p>
              <p className="text-[10px] sm:text-xs font-mono text-stone-500">
                Donate to charity or gift to a sibling directly from your Main Gold Pot. It feels good to give!
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
