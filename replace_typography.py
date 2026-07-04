import os
import re
import sys

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # Import
    if 'Typography' not in content:
        if filepath.count('/') == 2: # src/components/File.tsx
            content = re.sub(r'(import .*;\n)', r"\1import { Typography } from './ui/Typography';\n", content, count=1)
        elif filepath.count('/') == 3: # src/components/Onboarding/File.tsx
            content = re.sub(r'(import .*;\n)', r"\1import { Typography } from '../ui/Typography';\n", content, count=1)

    # Replacements
    # h1 variants
    content = re.sub(
        r'<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-stone-900.*?>([\s\S]*?)</h1>',
        r'<Typography variant="h1">\1</Typography>',
        content
    )
    content = re.sub(
        r'<h2 className="text-3xl md:text-5xl font-black font-display text-stone-900.*?>([\s\S]*?)</h2>',
        r'<Typography variant="h1" as="h2">\1</Typography>',
        content
    )
    content = re.sub(
        r'<h2 className="text-3xl font-black font-display text-stone-900">([\s\S]*?)</h2>',
        r'<Typography variant="h1" as="h2">\1</Typography>',
        content
    )

    # h2 variants
    content = re.sub(
        r'<h2 className="text-xl font-bold font-display tracking-wide text-slate-900">([\s\S]*?)</h2>',
        r'<Typography variant="h2">\1</Typography>',
        content
    )
    content = re.sub(
        r'<h2 className="text-2xl font-black font-display text-stone-900 uppercase tracking-widest">([\s\S]*?)</h2>',
        r'<Typography variant="h2">\1</Typography>',
        content
    )
    content = re.sub(
        r'<span className="text-lg sm:text-2xl font-black font-display tracking-wider text-slate-900 drop-shadow-sm">([\s\S]*?)</span>',
        r'<Typography variant="h2" as="span">\1</Typography>',
        content
    )

    # body
    content = re.sub(
        r'<p className="text-sm text-stone-600.*?">([\s\S]*?)</p>',
        r'<Typography variant="body">\1</Typography>',
        content
    )

    # helper
    content = re.sub(
        r'<p className=`?text-\[10px\] sm:text-xs font-mono text-(?:stone-500|gray-400)`?>([\s\S]*?)</p>',
        r'<Typography variant="helper">\1</Typography>',
        content
    )
    content = re.sub(
        r'<p className="text-xs font-mono text-stone-500.*?">([\s\S]*?)</p>',
        r'<Typography variant="helper">\1</Typography>',
        content
    )

    # label
    content = re.sub(
        r'<p className="text-\[10px\] font-mono text-stone-400 uppercase tracking-widest.*?">([\s\S]*?)</p>',
        r'<Typography variant="label" as="p">\1</Typography>',
        content
    )
    content = re.sub(
        r'<span className="font-bold text-xs font-mono tracking-wider text-gray-500 uppercase">([\s\S]*?)</span>',
        r'<Typography variant="label">\1</Typography>',
        content
    )
    content = re.sub(
        r'<label className="block text-\[9px\] font-bold font-mono text-stone-500 uppercase tracking-widest.*?">([\s\S]*?)</label>',
        r'<Typography variant="label" as="label">\1</Typography>',
        content
    )
    content = re.sub(
        r'<p className="text-xs font-mono font-bold tracking-widest text-stone-400.*?">([\s\S]*?)</p>',
        r'<Typography variant="label" as="p">\1</Typography>',
        content
    )
    content = re.sub(
        r'<span className="text-xs font-black font-mono uppercase tracking-wider">([\s\S]*?)</span>',
        r'<Typography variant="label">\1</Typography>',
        content
    )

    # number
    content = re.sub(
        r'<span className="text-xl font-black font-mono text-amber-900 drop-shadow-sm tabular-nums">([\s\S]*?)</span>',
        r'<Typography variant="number">\1</Typography>',
        content
    )
    content = re.sub(
        r'<span className="text-lg font-mono font-black text-orange-700">([\s\S]*?)</span>',
        r'<Typography variant="number">\1</Typography>',
        content
    )

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    for root, dirs, files in os.walk('src/components'):
        for f in files:
            if f.endswith('.tsx') and 'TypographyShowcase' not in f and 'Typography.tsx' not in f:
                process_file(os.path.join(root, f))
