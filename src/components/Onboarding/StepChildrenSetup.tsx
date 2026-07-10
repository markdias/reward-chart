import React, { useState } from 'react';
import { Typography } from '../ui/Typography';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { Child } from '../../types';
import { CHARACTER_PACKS, getCharacterStage, PRECANNED_AVATARS } from '../../data/characters';
import { UserPlus, ArrowRight, User, ArrowLeft, Edit3 } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';
import { ChildAvatar } from '../ChildAvatar';

interface StepChildrenSetupProps {
  theme: ThemeId;
  onNext: (children: Partial<Child>[]) => void;
  initialChildren?: Partial<Child>[];
  startedBy?: 'parent' | 'child' | null;
  onBack?: () => void;
}

export default function StepChildrenSetup({ theme, onNext, onBack, initialChildren = [], startedBy }: StepChildrenSetupProps) {
  const styles = THEME_PRESETS[theme];
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
      <div className={`p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6 shadow-xl relative z-10`}>
        <div className="text-center space-y-2">
          <h2 className={`text-2xl font-display font-bold ${styles.titleColor}`}>Setup Children</h2>
          <p className={`text-xs ${styles.textMuted}`}>Add the children who will be earning rewards.</p>
        </div>

        {children.length > 0 && (
          <div className="space-y-3">
            <h3 className={`text-xs font-bold font-mono tracking-widest uppercase ${styles.textMuted}`}>Added So Far</h3>
            <div className="space-y-2">
              {children.map(child => (
                <div key={child.id} className={`flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200`}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-1 border shrink-0">
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
          <form onSubmit={handleAddChild} className={`p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4`}>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted} mb-1`}>Child's First Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Leo"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border ${styles.inputBg}`}
                  required
                />
              </div>
              <div className="col-span-1">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${styles.textMuted} mb-1`}>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="e.g. 7"
                  min={1}
                  max={18}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border ${styles.inputBg}`}
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
                      selectedCharId === char.id ? 'border-amber-400 bg-amber-50' : 'border-transparent bg-white hover:border-stone-200'
                    }`}
                  >
                    <img src={getCharacterStage(char.id, 4).image_url} alt={char.name} className="w-10 h-10 object-contain mb-1" />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${selectedCharId === char.id ? 'text-amber-700' : 'text-stone-500'}`}>
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
                    className={`p-1 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${selectedAvatar === url ? 'border-amber-500 bg-amber-50 text-amber-500' : 'border-transparent text-stone-500 hover:border-stone-500/50 hover:bg-stone-50'}`}
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
