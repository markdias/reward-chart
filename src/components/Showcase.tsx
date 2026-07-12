import React from 'react';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { FaBone } from 'react-icons/fa6';
import { Coins, PiggyBank, Utensils, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { CoinBadge } from './CoinBadge';
import { ChildAvatar } from './ChildAvatar';
import { Plane, Star, Zap, Shield, Crown, Play, Trophy, Flame, ChevronRight } from 'lucide-react';

const SettingsBlock = ({ children, title }: { children: React.ReactNode, title?: string }) => (
  <div className="mb-6 w-full max-w-md mx-auto">
    {title && <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 px-4">{title}</h3>}
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ label, value, type = 'text', isToggle = false, isLast = false, toggleActive = false }: any) => (
  <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-stone-100' : ''} bg-white hover:bg-stone-50 transition-colors`}>
    <span className="text-sm font-bold text-stone-700">{label}</span>
    <div className="w-1/2 flex justify-end">
      {isToggle ? (
         <div className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 ${toggleActive ? 'bg-cyan-500' : 'bg-stone-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 ml-0.5 transition-transform duration-300 shadow-sm ${toggleActive ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
      ) : (
        <input 
           type={type} 
           defaultValue={value} 
           className="w-full text-right bg-transparent text-stone-500 font-semibold focus:outline-none focus:text-stone-900 transition-colors"
        />
      )}
    </div>
  </div>
);

const SettingsSelectRow = ({ label, options, defaultValue, isLast = false }: any) => (
  <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-stone-100' : ''} bg-white hover:bg-stone-50 transition-colors`}>
    <span className="text-sm font-bold text-stone-700">{label}</span>
    <select defaultValue={defaultValue} className="text-right bg-transparent text-stone-500 font-semibold focus:outline-none appearance-none cursor-pointer pr-4" style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a8a29e%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '8px auto' }}>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export default function Showcase() {
  const mockPet = { name: 'Astro', emoji: '👽', level: 5 };

  const renderPetScreen = (title: string, backgroundStyle: React.CSSProperties, id: string) => (
    <div className="space-y-4" id={id}>
      <Typography variant="h3" className="text-lg font-black text-stone-800 uppercase tracking-widest">{title}</Typography>
      
      <div className="w-full">
        {/* Rainbow Stripe Wrapper */}
        <div 
          className="relative p-2 rounded-3xl transition-transform duration-200 flex flex-col items-center text-center shadow-2xl overflow-hidden"
          style={backgroundStyle}
        >
          {/* Inner Cutout */}
          <div className="relative z-10 w-full h-full bg-white rounded-[1.25rem] p-4 sm:p-6 flex flex-col items-center border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
            
            <div className="flex justify-between w-full items-start mt-1">
              <div className="text-left">
                <span className={`text-[8px] font-sans tracking-widest uppercase text-stone-400 font-extrabold`}>PET SPECIES</span>
                <Typography variant="h3" className={`font-black text-stone-800 text-xs mt-0.5 uppercase tracking-wider`}>{mockPet.name}</Typography>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center w-full">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold animate-pulse">
                 <FaBone className="inline-block mr-2 text-amber-700" /> Hungry! Needs Food
               </span>
            </div>

            {/* Giant Levitating Pedestal */}
            <div className="my-6 sm:my-10 relative flex items-center justify-center">
              <div className="absolute h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-gradient-to-tr from-cyan-400/10 to-purple-500/10 animate-spin duration-[15s]" />
              
              <motion.div
                animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`h-32 w-32 sm:h-56 sm:w-56 rounded-full bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center shadow-2xl border-4 border-stone-900 relative z-10 transition-colors duration-500 overflow-hidden`}
              >
                <span className="text-6xl sm:text-[9rem] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                  {mockPet.emoji}
                </span>
              </motion.div>
            </div>

            <div className={`w-full pt-5 mt-5 border-t border-stone-200`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[14px] font-bold text-black tracking-tight">Level {mockPet.level}</span>
                <span className="text-[12px] font-semibold text-stone-500">
                  250 / 500 gold coins
                </span>
              </div>
              <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-stone-800 w-1/2"></div>
              </div>
            </div>

            <div className="w-full pt-4 mt-4 border-t border-dashed border-stone-200 flex flex-col gap-2">
              <Button
                variant="none"
                size="none"
                className={`w-full py-3 rounded-2xl font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all bg-amber-400 border-2 border-stone-900 text-stone-900 shadow-sm hover:translate-y-0.5 active:translate-y-1 active:shadow-none`}
              >
                <span><FaBone className="inline-block mr-2 text-stone-900" /> Feed Pet (1 Food)</span>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  const renderPot = (title: string, subtitle: string, backgroundStyle: React.CSSProperties, Icon: React.ElementType, iconColorClass: string, points: number, isLocked: boolean = false) => {
    if (isLocked) {
      return (
        <div className="relative p-2 rounded-[2.5rem] transition-transform duration-200 flex flex-col shadow-xl overflow-hidden h-full grayscale opacity-70" style={{ background: 'repeating-linear-gradient(45deg, #e7e5e4, #e7e5e4 10px, #d6d3d1 10px, #d6d3d1 20px)' }}>
          <div className="relative z-10 w-full h-full bg-stone-50 rounded-[2rem] p-4 sm:p-5 flex flex-col items-center justify-center text-center border-4 border-dashed border-stone-300 text-stone-500">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" />
              <Typography variant="label" className="font-bold">Unlock at Level 4!</Typography>
            </div>
            <div className="w-full max-w-[150px] h-2 bg-stone-200 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-stone-400 w-1/3"></div>
            </div>
            <span className="text-[9px] font-sans text-stone-400 font-bold uppercase tracking-wider">
              150 / 500 GOLD
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative p-2 rounded-[2.5rem] transition-transform duration-200 flex flex-col shadow-xl overflow-hidden h-full" style={backgroundStyle}>
        <div className="relative z-10 w-full h-full bg-white rounded-[2rem] p-4 sm:p-5 flex flex-col border-4 border-stone-900 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] text-left group">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${iconColorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <CoinBadge points={points} size="sm" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">{subtitle}</div>
            <Typography variant="h3" className="text-lg font-bold text-stone-900 px-1 mb-1">{title}</Typography>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* =========================================
            TICKET SHOWCASE IDEAS
            ========================================= */}
        <section className="space-y-6 pt-6">
          <Typography variant="h2" className="text-2xl font-black border-b-4 border-stone-200 pb-2 text-stone-800 uppercase tracking-widest">Character Ticket Ideas</Typography>
          <p className="text-stone-500 font-bold mb-4">Different designs to replace the Airline Boarding Pass using the Rainbow borders.</p>
          
          <div className="flex flex-col gap-10 w-full max-w-2xl mx-auto">
            
            {/* Idea 1: Classic Carnival Pass with Pot Edge */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Idea 1: Carnival Pass (Pot Edge Style)</span>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="w-full relative shadow-xl cursor-pointer"
              >
                {/* Rainbow Striped Outer Ticket */}
                <div 
                  className="w-full rounded-2xl p-2 relative overflow-hidden flex"
                  style={{ background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f59e0b 10px, #f59e0b 20px, #d97706 20px, #d97706 30px)' }}
                >
                  
                  {/* Left Notch (Hole punch effect) */}
                  <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-100 rounded-full z-20 border-[3px] border-stone-800" />
                  
                  {/* Right Notch */}
                  <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-100 rounded-full z-20 border-[3px] border-stone-800" />

                  {/* Inner White Body with thick dark border */}
                  <div className="flex-1 bg-white rounded-xl flex relative border-[3px] border-stone-800">
                    
                    {/* Main Content Area */}
                    <div className="flex-1 p-4 flex items-center gap-6 z-10 pl-8">
                      {/* Avatar */}
                      <div className="w-16 h-16 shrink-0 rounded-xl bg-stone-100 border-2 border-stone-800 shadow-sm flex items-center justify-center">
                        <ChildAvatar iconName="Rocket" className="w-12 h-12 !border-none text-stone-700" />
                      </div>
                      
                      {/* Name & Barcode */}
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-800 mb-1">ADMIT ONE</span>
                        
                        {/* Fake Barcode */}
                        <div className="flex gap-[2px] h-10 w-full max-w-[120px] mx-auto items-end mb-1">
                          {[...Array(24)].map((_, i) => (
                            <div key={i} className="bg-stone-800 rounded-sm" style={{ 
                              width: Math.random() > 0.5 ? '4px' : '2px', 
                              height: Math.random() > 0.2 ? '100%' : '80%' 
                            }} />
                          ))}
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-800">ADMIT ONE</span>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col items-center gap-2 pr-6">
                        <h3 className="text-3xl font-black font-display tracking-tight text-stone-800 uppercase leading-none">
                          ALEX
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md border-2 border-stone-800">LVL 4</span>
                          <CoinBadge points={250} size="sm" />
                        </div>
                      </div>
                    </div>

                    {/* Sideways Serial Number */}
                    <div className="w-12 shrink-0 border-l-[3px] border-stone-800 flex items-center justify-center bg-stone-50 z-10 pr-4">
                      <span className="text-red-500 font-mono font-black tracking-widest rotate-90 whitespace-nowrap text-lg">
                        83740104
                      </span>
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>

            {/* Idea 2: Clean Carnival Pass */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Idea 2: Carnival Pass (Clean Layout)</span>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="w-full relative shadow-lg cursor-pointer"
              >
                {/* Rainbow Outer Ticket */}
                <div className="w-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500 rounded-xl p-3 relative overflow-hidden flex">
                  
                  {/* Left Notch */}
                  <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-100 rounded-full z-20 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.1)]" />
                  
                  {/* Right Notch */}
                  <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-100 rounded-full z-20 shadow-[inset_3px_0_5px_rgba(0,0,0,0.1)]" />

                  {/* Inner White Body */}
                  <div className="flex-1 bg-white rounded-lg flex relative overflow-hidden border border-black/5">
                    
                    {/* Main Content Area */}
                    <div className="flex-1 p-5 flex items-center gap-5 z-10 pl-8">
                      {/* Avatar */}
                      <div className="w-16 h-16 shrink-0 rounded-full bg-stone-100 border-2 border-stone-200 shadow-inner flex items-center justify-center overflow-hidden">
                        <ChildAvatar iconName="Sparkles" className="w-12 h-12 !border-none text-purple-600 !bg-transparent" />
                      </div>
                      
                      {/* Name & Info */}
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5 block">Player Select</span>
                        <h3 className="text-3xl font-black font-display tracking-tight text-stone-800 uppercase leading-none mb-2">
                          ALEX
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">LEVEL 4</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 pr-6">
                        <CoinBadge points={250} size="sm" />
                      </div>
                    </div>

                    {/* Right Stub with Barcode */}
                    <div className="w-24 shrink-0 border-l border-dashed border-stone-300 flex flex-col items-center justify-center bg-stone-50 z-10 pr-6 pl-2 py-2">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-1">TICKET</span>
                      {/* Vertical Fake Barcode */}
                      <div className="flex gap-[2px] w-full h-16 items-end justify-center mb-1">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="bg-stone-800 rounded-sm" style={{ 
                            width: Math.random() > 0.5 ? '4px' : '2px', 
                            height: Math.random() > 0.2 ? '100%' : '80%' 
                          }} />
                        ))}
                      </div>
                      <span className="text-stone-400 font-mono text-[8px] tracking-widest">
                        00134
                      </span>
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </section>
        
        {/* =========================================
            POTS THEME SHOWCASE
            ========================================= */}
        <section className="space-y-6 pt-6">
          <Typography variant="h2" className="text-2xl font-black border-b-4 border-stone-200 pb-2 text-stone-800 uppercase tracking-widest">Rainbow Stripe Pots</Typography>
          <p className="text-stone-500 font-bold mb-4">Applying the Rainbow Stripe theme with unique color palettes for each pot type!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Pots */}
            {renderPot(
              "Gold Pot", 
              "Main Pocket", 
              { background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f59e0b 10px, #f59e0b 20px, #d97706 20px, #d97706 30px)' }, 
              Coins, 
              "bg-amber-100 text-amber-500", 
              250
            )}
            
            {renderPot(
              "Savings", 
              "Savings Pot", 
              { background: 'repeating-linear-gradient(-45deg, #34d399, #34d399 10px, #10b981 10px, #10b981 20px, #059669 20px, #059669 30px)' }, 
              PiggyBank, 
              "bg-emerald-100 text-emerald-500", 
              1500
            )}

            {/* Inactive/Locked Pots */}
            {renderPot(
              "Food", 
              "Food Pot (Locked)", 
              {}, 
              Utensils, 
              "", 
              0,
              true // isLocked
            )}

            {renderPot(
              "Gifting", 
              "Gifting Pot (Locked)", 
              {}, 
              Gift, 
              "", 
              0,
              true // isLocked
            )}
          </div>
        </section>

        {/* =========================================
            PET SCREEN SHOWCASE
            ========================================= */}
        <section className="space-y-6 pt-16">
          <Typography variant="h2" className="text-2xl font-black border-b-4 border-stone-200 pb-2 text-stone-800 uppercase tracking-widest">Rainbow Stripe Pet Screen</Typography>
          <p className="text-stone-500 font-bold mb-4">Here are 3 color options for the Holo Pedestal (Pet Screen).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderPetScreen(
              'A: Cyan/Purple', 
              { background: 'repeating-linear-gradient(45deg, #22d3ee, #22d3ee 15px, #a855f7 15px, #a855f7 30px, #38bdf8 30px, #38bdf8 45px)' },
              'opt-a'
            )}

            {renderPetScreen(
              'B: Orange/Pink', 
              { background: 'repeating-linear-gradient(-45deg, #fb923c, #fb923c 15px, #f472b6 15px, #f472b6 30px, #fbbf24 30px, #fbbf24 45px)' },
              'opt-b'
            )}

            {renderPetScreen(
              'C: Emerald/Teal', 
              { background: 'repeating-linear-gradient(45deg, #34d399, #34d399 15px, #2dd4bf 15px, #2dd4bf 30px, #a3e635 30px, #a3e635 45px)' },
              'opt-c'
            )}
          </div>
        </section>

        {/* =========================================
            APP SETTINGS PROTOTYPE
            ========================================= */}
        <section className="space-y-6 pt-16 pb-16">
          <Typography variant="h2" className="text-2xl font-black border-b-4 border-stone-200 pb-2 text-stone-800 uppercase tracking-widest">Native App Settings Prototype</Typography>
          <p className="text-stone-500 font-bold mb-8">This is how the new Profile and Target tabs will look.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* PROFILE PROTOTYPE */}
            <div className="bg-stone-100 p-6 rounded-3xl border-2 border-stone-200">
              <Typography variant="h3" className="text-xl font-black text-stone-800 mb-6 text-center tracking-tight">Profile Tab</Typography>
              
              <SettingsBlock title="Personal Information">
                <SettingsRow label="Email" value="mark@mdias.co.uk" />
                <SettingsRow label="First Name" value="Mark" />
                <SettingsRow label="Family Name" value="The Dias'" isLast />
              </SettingsBlock>

              <SettingsBlock title="Appearance">
                <SettingsSelectRow 
                  label="Theme" 
                  defaultValue="system"
                  options={[
                    { label: 'System', value: 'system' },
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                  ]}
                  isLast 
                />
              </SettingsBlock>

              <SettingsBlock title="Notifications">
                <SettingsRow label="Push Notifications" isToggle toggleActive isLast />
              </SettingsBlock>
            </div>

            {/* TARGETS PROTOTYPE */}
            <div className="bg-stone-100 p-6 rounded-3xl border-2 border-stone-200">
              <Typography variant="h3" className="text-xl font-black text-stone-800 mb-6 text-center tracking-tight">Targets Tab</Typography>

              <SettingsBlock title="Global Rewards & Targets">
                <SettingsRow label="Daily Target (Gold)" value="50" type="number" />
                <SettingsRow label="Weekly Target (Gold)" value="300" type="number" />
                <SettingsRow label="Weekly Gold Bonus" value="200" type="number" />
                <SettingsRow label="Monthly Target (Gold)" value="1200" type="number" />
                <SettingsRow label="Monthly Gold Bonus" value="1000" type="number" isLast />
              </SettingsBlock>

              <SettingsBlock title="Levels & Pots">
                <SettingsRow label="Gold Required to Level Up" value="500" type="number" />
                <SettingsRow label="Level Up Gold Reward" value="500" type="number" />
                <SettingsRow label="Savings Pot Lvl" value="2" type="number" />
                <SettingsRow label="Food Pot Lvl" value="4" type="number" />
                <SettingsRow label="Gifting Pot Lvl" value="6" type="number" />
                <SettingsRow label="Maintenance Cost" value="2" type="number" isLast />
              </SettingsBlock>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
