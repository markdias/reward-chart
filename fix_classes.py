import os
import re

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

    new_content = ""
    i = 0
    while i < len(content):
        # find "<Input" or "<Select"
        if content.startswith("<Input", i) or content.startswith("<Select", i):
            is_select = content.startswith("<Select", i)
            tag_name_len = 7 if is_select else 6
            start_idx = i
            i += tag_name_len
            
            in_string = False
            string_char = ''
            brace_level = 0
            
            while i < len(content):
                c = content[i]
                if not in_string and (c == '"' or c == "'" or c == '`'):
                    in_string = True
                    string_char = c
                elif in_string and c == string_char:
                    # simplistic, ignores escaped quotes but usually fine
                    in_string = False
                elif not in_string:
                    if c == '{':
                        brace_level += 1
                    elif c == '}':
                        brace_level -= 1
                    elif c == '>' and brace_level == 0:
                        # end of tag
                        end_idx = i
                        tag_content = content[start_idx:end_idx+1]
                        # Remove className carefully
                        stripped = re.sub(r'\s*className\s*=\s*(?:`[^`]*`|"[^"]*"|\'[^\']*\'|\{[^}]*\})', '', tag_content)
                        new_content += stripped
                        break
                i += 1
            i += 1
        else:
            new_content += content[i]
            i += 1

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

