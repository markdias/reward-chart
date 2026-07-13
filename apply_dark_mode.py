import os
import re

COMPONENTS_DIR = '/Users/mdias9/myprojects/reward-chart/src/components'

replacements = {
    r'\bbg-stone-50\b(?! dark:)': 'bg-stone-50 dark:bg-stone-950',
    r'\bbg-white\b(?! dark:)': 'bg-white dark:bg-stone-900',
    r'\btext-stone-900\b(?! dark:)': 'text-stone-900 dark:text-stone-50',
    r'\btext-stone-800\b(?! dark:)': 'text-stone-800 dark:text-stone-100',
    r'\btext-stone-700\b(?! dark:)': 'text-stone-700 dark:text-stone-200',
    r'\btext-stone-600\b(?! dark:)': 'text-stone-600 dark:text-stone-300',
    r'\btext-stone-500\b(?! dark:)': 'text-stone-500 dark:text-stone-400',
    r'\bborder-stone-100\b(?! dark:)': 'border-stone-100 dark:border-stone-800',
    r'\bborder-stone-200\b(?! dark:)': 'border-stone-200 dark:border-stone-700',
    r'\bbg-stone-100\b(?! dark:)': 'bg-stone-100 dark:bg-stone-800',
    r'\btext-dark\b(?! dark:)': 'text-dark dark:text-white',
}

def apply_dark_mode():
    for root, dirs, files in os.walk(COMPONENTS_DIR):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = content
                for pattern, replacement in replacements.items():
                    new_content = re.sub(pattern, replacement, new_content)
                
                # Also remove playful_pop specific logic
                new_content = re.sub(r'data-theme=\{.*?\}', '', new_content)
                new_content = re.sub(r'const isPlayfulPop.*?;', '', new_content)
                new_content = re.sub(r'isPlayfulPop \? .*? :', '', new_content)
                new_content = re.sub(r'theme=\{theme\}', '', new_content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {file}")

if __name__ == '__main__':
    apply_dark_mode()
