import os
import re

COMPONENTS_DIR = '/Users/mdias9/myprojects/reward-chart/src/components'

def fix_prefixes():
    for root, dirs, files in os.walk(COMPONENTS_DIR):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = content
                
                def replace_prefix(match):
                    prefix = match.group(1)
                    base_color = match.group(2)
                    dark_color = match.group(3)
                    
                    base_type = base_color.split('-')[0]
                    dark_type = dark_color.split('-')[0]
                    
                    if base_type == dark_type:
                        return f"{prefix}:{base_color} dark:{prefix}:{dark_color}"
                    return match.group(0)
                
                # Regex matches e.g. hover:bg-stone-50 dark:bg-stone-950
                new_content = re.sub(r'(hover|focus|active|disabled|group-hover):([a-z]+(?:-[a-z0-9]+)*) dark:([a-z]+(?:-[a-z0-9]+)*)', replace_prefix, new_content)
                
                # Fix specific hover background colors for dark mode to ensure they actually look like hovers (lighter than base)
                # Base card is stone-900. Hover should be stone-800.
                new_content = new_content.replace('dark:hover:bg-stone-950', 'dark:hover:bg-stone-800')
                new_content = new_content.replace('dark:hover:bg-stone-900', 'dark:hover:bg-stone-800')
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Fixed prefixes in {file}")

if __name__ == '__main__':
    fix_prefixes()
