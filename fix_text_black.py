import os
import re

COMPONENTS_DIR = '/Users/mdias9/myprojects/reward-chart/src/components'

def fix_text_black():
    for root, dirs, files in os.walk(COMPONENTS_DIR):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # Replace text-black with text-black dark:text-white
                # Make sure we don't duplicate it if it already has dark:text-white
                new_content = re.sub(r'\btext-black\b(?! dark:)', 'text-black dark:text-white', content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {file}")

if __name__ == '__main__':
    fix_text_black()
