import re
import os

files_to_update = [
    'src/components/ParentDashboard.tsx',
    'src/components/ChildDashboard.tsx',
    'src/components/SettingsTab.tsx',
    'src/components/AuthPage.tsx',
    'src/components/LockScreen.tsx',
    'src/components/PasswordInput.tsx',
    'src/components/Showcase.tsx',
    'src/components/ui/SettingsList.tsx'
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    def strip_class(match):
        tag_start = match.group(1) # "<Input" or "<Select"
        inner_content = match.group(2) # attributes
        
        # Remove className="...", className={'...'}, className={`...`}
        inner_content = re.sub(r'\s*className\s*=\s*(?:`[^`]*`|"[^"]*"|\'[^\']*\'|\{[^}]*\})', '', inner_content)
        return tag_start + inner_content
        
    content = re.sub(r'(<Input|<Select)([\s\S]*?>)', strip_class, content)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

