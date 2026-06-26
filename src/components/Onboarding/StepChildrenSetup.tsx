import React, { useState } from 'react';
import { ThemeId, THEME_PRESETS } from '../../utils/theme';
import { Child } from '../../types';
import { CHARACTER_PACKS, getCharacterStage, PRECANNED_AVATARS } from '../../data/characters';
import { UserPlus, ArrowRight, User } from 'lucide-react';

interface StepChildrenSetupProps {
  theme: ThemeId;
  initialChildren: Partial<Child>[];
  onNext: (children: Partial<Child>[]) => void;
}

export default function StepChildrenSetup({ theme, initialChildren, onNext }: StepChildrenSetupProps) {
  const styles = THEME_PRESETS[theme];
  const [children, setChildren] = useState<Partial<Child>[]>(initialChildren);
  const [isAdding, setIsAdding] = useState(initialChildren.length === 0);
  const [name, setName] = useState('');
  const [selectedCharId, setSelectedCharId] = useState(CHARACTER_PACKS[0].id);
  const [selectedAvatar, setSelectedAvatar] = useState(PRECANNED_AVATARS[0]);

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setChildren(prev => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        name: name.trim(),
        character_id: selectedCharId,
        avatar_url: selectedAvatar,
      }
    ]);
    setName('');
    setSelectedCharId(CHARACTER_PACKS[0].id);
    setSelectedAvatar(PRECANNED_AVATARS[0]);
    setIsAdding(false);
  };

  const handleContinue = () => {
    if (children.length > 0) {
      onNext(children);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center h-full`}>
      <div className={`p-6 sm:p-8 rounded-3xl ${styles.cardBg} space-y-6 shadow-xl relative z-10`}>
        <div className="text-center space-y-2">
          <h2 className={`text-2xl font-display font-bold ${styles.titleColor}`}>Setup Children</h2>
          <p className={`text-xs ${styles.textMuted}`}>Add the children who will be earning rewards.</p>
        </div>

        {children.length > 0 && (
          <div className="space-y-3">
            <h3 className={`text-xs font-bold font-mono tracking-widest uppercase ${styles.textMuted}`}>Added So Far</h3>
            <div className="space-y-2">
              {children.map(child => (
                <div key={child.id} className={`flex items-center gap-3 p-3 rounded-xl border ${styles.innerCard}`}>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-1 border">
                    {child.avatar_url ? (
                      <img src={child.avatar_url} alt={child.name} className="w-full h-full object-contain" />
                    ) : (
                      <User className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <span className={`font-bold ${styles.textColor}`}>{child.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdding ? (
          <form onSubmit={handleAddChild} className={`p-4 rounded-2xl border ${styles.innerCard} space-y-4`}>
            <div>
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
                    <span className="text-2xl">{getCharacterStage(char.id, 4).emoji}</span>
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
                    className={`p-1 rounded-xl border-2 transition-all cursor-pointer ${selectedAvatar === url ? 'border-amber-500 bg-amber-50' : 'border-transparent hover:border-slate-500/50'}`}
                  >
                    <img src={url} alt="Avatar option" className="w-full aspect-square rounded-lg object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {children.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`flex-[2] py-2 rounded-xl text-xs font-bold font-mono tracking-widest uppercase text-white bg-stone-900 hover:bg-stone-800`}
              >
                Save Child
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 font-bold hover:bg-stone-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Add Another Child
            </button>
            <button
              onClick={handleContinue}
              className={`w-full ${styles.btnPrimary} py-3.5 rounded-xl flex items-center justify-center gap-2 font-display uppercase tracking-wide shadow-lg`}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
