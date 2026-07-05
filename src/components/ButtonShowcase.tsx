import React from 'react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { CheckCircle, Play, Sparkles, Heart, Settings } from 'lucide-react';

export default function ButtonShowcase() {
  return (
    <div className="min-h-screen bg-stone-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-black font-display text-stone-900 mb-2">Button Style Explorations</h1>
          <p className="text-stone-500">Since the heavy drop-shadows didn't feel right, here are 3 new aesthetic directions for the buttons. Let me know which one feels best for the site!</p>
        </div>

        {/* Variation 1: Soft Bubble / Pill */}
        <section className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Style 1: Soft Bubble
            </h2>
            <p className="text-gray-500 mt-1">Friendly, pill-shaped (`rounded-full`), with a soft colorful glow and a gentle scaling effect on hover. Very approachable for a kids' app.</p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="bg-gradient-to-b from-primary to-primary-shadow text-white font-bold rounded-full px-8 py-3.5 transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_var(--color-primary-shadow)] hover:shadow-[0_6px_20px_var(--color-primary)] flex items-center gap-2">
              <Play className="w-5 h-5" /> Let's Play
            </button>
            <button className="bg-surface text-dark font-bold rounded-full px-8 py-3.5 transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_oklch(0%_0_0/0.05)] border border-gray-100">
              Cancel Action
            </button>
            <button className="bg-gradient-to-b from-danger to-danger-shadow text-white font-bold rounded-full px-8 py-3.5 transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_var(--color-danger-shadow)]">
              Delete
            </button>
          </div>
        </section>

        {/* Variation 2: Modern Flat / iOS Style */}
        <section className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📱 Style 2: Modern Flat (iOS Style)
            </h2>
            <p className="text-gray-500 mt-1">Clean, minimalist, and sleek. Uses solid flat colors, rounded corners (`rounded-2xl`), and relies on simple opacity fades rather than scaling or heavy shadows.</p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="bg-primary hover:bg-primary-hover active:bg-primary-shadow text-white font-semibold rounded-2xl px-6 py-3 transition-colors flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Approve Task
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-2xl px-6 py-3 transition-colors">
              Secondary
            </button>
            <button className="bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 font-semibold rounded-2xl px-6 py-3 transition-colors">
              Reject
            </button>
          </div>
        </section>

        {/* Variation 3: Playful Sticker */}
        <section className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Style 3: Playful Sticker
            </h2>
            <p className="text-gray-500 mt-1">A fun, vibrant style that uses a thick white inner border and a soft drop shadow to make the buttons look like 3D stickers on the page.</p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <button className="bg-info text-white font-black uppercase tracking-wider rounded-2xl px-6 py-3 transition-transform hover:-translate-y-1 active:translate-y-0 shadow-lg ring-4 ring-white inset-0 flex items-center gap-2">
              Earn Gold
            </button>
            <button className="bg-warning text-dark font-black uppercase tracking-wider rounded-2xl px-6 py-3 transition-transform hover:-translate-y-1 active:translate-y-0 shadow-lg ring-4 ring-white inset-0">
              Buy Pet Food
            </button>
            <button className="bg-purple-500 text-white font-black uppercase tracking-wider rounded-2xl px-6 py-3 transition-transform hover:-translate-y-1 active:translate-y-0 shadow-lg ring-4 ring-white inset-0 flex items-center gap-2">
              Settings <Settings className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* The Original (For Comparison) */}
        <section className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-200 opacity-60 hover:opacity-100 transition-opacity">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-gray-500">The Original (Duolingo Style)</h2>
            <p className="text-gray-400 mt-1">For comparison purposes, here is what we are replacing.</p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
