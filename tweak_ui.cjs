const fs = require('fs');
const file = 'src/components/ChildDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Height
content = content.replace(/h-\[260px\] pot-flip-card/g, 'h-[210px] pot-flip-card');

// Front text
content = content.replace(/text-\[9px\] font-black uppercase tracking-widest/g, 'text-xs font-black uppercase tracking-widest');
content = content.replace(/text-lg font-bold text-stone-900/g, 'text-2xl font-bold text-stone-900');
content = content.replace(/text-\[10px\] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2/g, 'text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2');

// Back texts (Gold Pot)
content = content.replace(/text-sm text-stone-500 dark:text-stone-400 leading-snug/g, 'text-base text-stone-500 dark:text-stone-400 leading-snug');
content = content.replace(/text-sm font-bold uppercase transition-colors/g, 'text-base font-bold uppercase transition-colors');

// Back texts (Other Pots)
content = content.replace(/text-xs text-stone-500 dark:text-stone-400 leading-snug/g, 'text-sm text-stone-500 dark:text-stone-400 leading-snug');
content = content.replace(/text-xs \$\{styles\.textMuted\} leading-snug/g, 'text-sm ${styles.textMuted} leading-snug');
content = content.replace(/text-xs \$\{styles\.textMuted\} mb-2 leading-snug/g, 'text-sm ${styles.textMuted} mb-2 leading-snug');
content = content.replace(/text-xs font-bold leading-snug mb-3/g, 'text-sm font-bold leading-snug mb-3');

// Badges and Progress text
content = content.replace(/text-\[10px\] font-bold text-(emerald|orange)-850/g, 'text-xs font-bold text-$1-850');
content = content.replace(/text-\[10px\] font-black text-(emerald|orange)-600/g, 'text-xs font-black text-$1-600');
content = content.replace(/text-\[9px\] font-sans \$\{styles\.textMuted\} mt-1\.5/g, 'text-[10px] font-sans ${styles.textMuted} mt-1.5');
content = content.replace(/text-\[10px\] text-red-700/g, 'text-xs text-red-700');

// Action Buttons
content = content.replace(/py-2 rounded-xl font-bold text-xs/g, 'py-2 rounded-xl font-bold text-sm');
content = content.replace(/py-1\.5 rounded-xl/g, 'py-2 rounded-xl');

// Maintenance pot back
content = content.replace(/text-\[8px\] font-black/g, 'text-[10px] font-black');
content = content.replace(/text-xs font-bold \$\{activeChild\.gold_pot_broken/g, 'text-sm font-bold ${activeChild.gold_pot_broken');
content = content.replace(/text-\[10px\] text-red-700 dark:text-red-400 mb-2 leading-tight font-bold/g, 'text-xs text-red-700 dark:text-red-400 mb-2 leading-tight font-bold');

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements done.');
