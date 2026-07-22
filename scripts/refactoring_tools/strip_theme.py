import os
import re

COMPONENTS_DIR = '/Users/mdias9/myprojects/reward-chart/src/components'

def strip_theme():
    for root, dirs, files in os.walk(COMPONENTS_DIR):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = content
                
                # Remove import { ThemeId ...
                new_content = re.sub(r'import\s+\{[^}]*ThemeId[^}]*\}\s+from\s+[^;]+;', '', new_content)
                new_content = re.sub(r'import\s+ThemeId\s+from\s+[^;]+;', '', new_content)
                
                # Remove theme: ThemeId; from interfaces
                new_content = re.sub(r'\s*theme:\s*ThemeId\s*;', '', new_content)
                
                # Remove theme from props destructuring e.g., export default function TargetsTab({ theme, parentProfile
                # Just replace "theme, " with ""
                new_content = re.sub(r'\btheme,\s*', '', new_content)
                
                # Remove { theme } if it's the only prop
                new_content = re.sub(r'\(\{\s*theme\s*\}\)', '()', new_content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {file}")

if __name__ == '__main__':
    strip_theme()
