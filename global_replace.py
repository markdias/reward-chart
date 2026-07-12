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

def add_imports(content, filepath):
    if 'import { Input }' not in content:
        # Find the last import
        imports_end = content.rfind('import ')
        if imports_end != -1:
            line_end = content.find('\n', imports_end)
            if filepath.startswith('src/components/ui/'):
                new_imports = "\nimport { Input } from './Input';\nimport { Select } from './Select';"
            else:
                new_imports = "\nimport { Input } from './ui/Input';\nimport { Select } from './ui/Select';"
            content = content[:line_end] + new_imports + content[line_end:]
    return content

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # Replace <select ...> with <Select ...>
    content = re.sub(r'<select(\s+)', r'<Select\1', content)
    content = content.replace('</select>', '</Select>')
    
    # For <input>, only replace if type is not checkbox or radio
    # We will find all <input tags and process them
    
    def replace_input(match):
        tag_str = match.group(0)
        if 'type="checkbox"' in tag_str or 'type="radio"' in tag_str or 'type="file"' in tag_str:
            return tag_str
        return '<Input' + match.group(1)
        
    content = re.sub(r'<input(\s|>)', replace_input, content)
    
    # Now, strip `className="..."` from <Select> and <Input> tags
    # Wait, in Showcase.tsx there is: <select defaultValue={defaultValue} className="..." style={{...}}>
    # We want to remove the className from Input and Select.
    # To do this safely, we can parse the tags.
    
    def strip_class(match):
        tag_start = match.group(1) # "<Input" or "<Select"
        inner_content = match.group(2) # attributes
        
        # Remove className attribute
        inner_content = re.sub(r'className=(?:`[^`]*`|"[^"]*"|\'[^\']*\')', '', inner_content)
        return tag_start + inner_content
        
    content = re.sub(r'(<Input|<Select)([\s\S]*?>)', strip_class, content)

    if content != original_content:
        content = add_imports(content, filepath)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

