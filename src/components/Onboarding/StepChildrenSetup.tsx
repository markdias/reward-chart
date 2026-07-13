import React, { useState } from 'react';
import { Typography } from '../ui/Typography';

import { Child } from '../../types';
import { CHARACTER_PACKS, getCharacterStage, PRECANNED_AVATARS } from '../../data/characters';
import { UserPlus, ArrowRight, User, ArrowLeft, Edit3 } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChildAvatar } from '../ChildAvatar';

interface StepChildrenSetupProps {
  onNext: (children: Partial<Child>[]) => void;
  initialChildren?: Partial<Child>[];
  startedBy?: 'parent' | 'child' | null;
  onBack?: () => void;
}

export default function StepChildrenSetup({ onNext, onBack, initialChildren = [], startedBy }: StepChildrenSetupProps) {
  const styles = {
    text: 'text-stone-900 dark:text-stone-50',
    textMuted: 'text-stone-500 dark:text-stone-400',
    bodyBg: 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50',
    cardBg: 'bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-50',
    headerBg: 'bg-white/90 dark:bg-stone-900/90 border-b border-stone-100 dark:border-stone-800 backdrop-blur-md',
    btnPrimary: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all uppercase tracking-wider rounded-2xl border-none',
    btnSecondary: 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98] transition-all rounded-2xl',
    tabActive: 'bg-rose-400 text-white shadow-md shadow-rose-400/30 font-bold rounded-2xl',
    tabInactive: 'text-stone-400 hover:text-stone-600 bg-transparent',
    inputBg: 'bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl text-stone-900 dark:text-stone-50 placeholder-[#A8A29E] focus:bg-white dark:focus:bg-stone-900 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:outline-none transition-all',
    accentGlow: 'bg-orange-100/40 opacity-50',
    tagCategory: 'text-orange-600 bg-orange-50 border border-orange-100 font-bold uppercase rounded-full',
    gridStyle: 'scrolling-grid opacity-[0.03]',
    innerCard: 'bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl',
    titleGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent',
    divider: 'border-stone-100 dark:border-stone-800',
    overlayCrt: 'hidden',
    titleColor: 'text-[#1C1917] dark:text-stone-50',
    borderStyle: 'border-stone-100 dark:border-stone-800'
};
  const [children, setChildren] = useState<Partial<Child>[]>(initialChildren);
  const [isAdding, setIsAdding] = useState(initialChildren.length === 0);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [selectedCharId, setSelectedCharId] = useState(CHARACTER_PACKS[0].id);
  const [selectedAvatar, setSelectedAvatar] = useState(PRECANNED_AVATARS[0]);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);

  const handleEditChild = (child: Partial<Child>) => {
    setName(child.name || '');
    setAge(child.age || '');
    setSelectedCharId(child.character_id || CHARACTER_PACKS[0].id);
    setSelectedAvatar(child.avatar_url || PRECANNED_AVATARS[0]);
    setEditingChildId(child.id || null);
    setIsAdding(true);
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingChildId) {
      setChildren(prev => prev.map(child => 
        child.id === editingChildId 
          ? { ...child, name: name.trim(), age: typeof age === 'number' ? age : undefined, character_id: selectedCharId, avatar_url: selectedAvatar }
          : child
      ));
    } else {
      setChildren(prev => [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          name: name.trim(),
          age: typeof age === 'number' ? age : undefined,
          character_id: selectedCharId,
          avatar_url: selectedAvatar,
        }
      ]);
    }

    setName('');
    setAge('');
    setSelectedCharId(CHARACTER_PACKS[0].id);
    setSelectedAvatar(PRECANNED_AVATARS[0]);
    setEditingChildId(null);
    setIsAdding(false);
  };

  const handleContinue = () => {
    if (children.length > 0) {
      onNext(children);
    }
  };

  return (
    <div className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 pt-[8vh] sm:pt-[12vh] pb-10 flex flex-col min-h-[100dvh]`}>
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-6 shadow-xl relative z-10`}>
        <div className="text-center space-y-2">
          <Typography variant="h2" className={styles.titleColor}>Setup Children</Typography>
          <p className={`text-xs ${styles.textMuted}`}>Add the children who will be earning rewards.</p>
        </div>

        {children.length > 0 && (
          <div className="space-y-3">
            <Typography variant="label" className={styles.textMuted}>Added So Far</Typography>
            <div className="space-y-2">
              {children.map(child => (
                <div key={child.id} className={`flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700`}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 flex items-center justify-center shadow-sm overflow-hidden p-1 border shrink-0">
                      {child.avatar_url ? (
                        <ChildAvatar iconName={child.avatar_url} className="w-full h-full" />
                      ) : (
                        <User className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold ${styles.textColor}`}>{child.name}</span>
                      {child.age && <span className={`text-[10px] ${styles.textMuted}`}>Age {child.age}</span>}
                    </div>
                  </div>
                  <Tooltip content="Edit Child" position="top">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleEditChild(child)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdding ? (
          <form onSubmit={handleAddChild} className={`p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 space-y-4`}>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Child's First Name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Leo"
                  required
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Age"
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. 7"
                  min={1}
                  max={18}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted} mb-2`}>Choose Companion</label>
              <div className="grid grid-cols-3 gap-2">
                {CHARACTER_PACKS.map(char => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedCharId(char.id)}
                    className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center border-2 transition-colors ${
                      selectedCharId === char.id ? 'border-amber-400 bg-amber-50' : 'border-transparent bg-white dark:bg-stone-900 hover:border-stone-200 dark:hover:border-stone-700'
                    }`}
                  >
                    <img src={getCharacterStage(char.id, 4).image_url} alt={char.name} className="w-10 h-10 object-contain mb-1" />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${selectedCharId === char.id ? 'text-amber-700' : 'text-stone-500 dark:text-stone-400'}`}>
                      {char.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted} mb-2`}>Select Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {PRECANNED_AVATARS.map(url => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`p-1 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${selectedAvatar === url ? 'border-amber-500 bg-amber-50 text-amber-500' : 'border-transparent text-stone-500 dark:text-stone-400 hover:border-stone-500/50 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                  >
                    <ChildAvatar iconName={url} className="w-full aspect-square !rounded-lg" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {children.length > 0 ? (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingChildId(null);
                    setName('');
                    setAge('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              ) : (
                onBack && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={onBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )
              )}
              <Button
                variant="dark"
                type="submit"
                className="flex-[2]"
              >
                {editingChildId ? 'Update Child' : 'Save Child'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            {startedBy === 'child' ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsAdding(true)}
                leftIcon={<UserPlus className="w-5 h-5 text-indigo-500" />}
              >
                Add a sibling? Pass them the phone!
              </Button>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsAdding(true)}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Add Another Child
              </Button>
            )}
            <div className="flex gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="primary"
                fullWidth
                className="flex-1"
                onClick={handleContinue}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {startedBy === 'child' ? "I'm Done" : "Continue"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
