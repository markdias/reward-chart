import re
import json

def extract_buttons(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    pattern = re.compile(r"<([bB]utton)([^>]*)>(.*?)</\1>|<([bB]utton)([^>]*?)\s*/>", re.DOTALL)
    
    buttons = []
    for m in pattern.finditer(content):
        line_no = content[:m.start()].count("\n") + 1
        
        tag1, attrs1, inner, tag2, attrs2 = m.groups()
        tag = tag1 or tag2
        attrs = attrs1 or attrs2
        
        inner_clean = inner.strip() if inner else ""
        if len(inner_clean) > 50:
            inner_clean = inner_clean[:47] + "..."
            
        variant_m = re.search(r"variant=[\"']([^\"']+)[\"']", attrs)
        variant = variant_m.group(1) if variant_m else "default"
        
        className_m = re.search(r"className=[\"']([^\"']+)[\"']", attrs)
        className = className_m.group(1) if className_m else ""
        
        buttons.append({
            "line": line_no,
            "tag": tag,
            "variant": variant,
            "className": className,
            "content": inner_clean
        })
    return buttons

results = {}
for f in ["src/components/ParentDashboard.tsx", "src/components/TargetsTab.tsx", "src/components/SettingsTab.tsx"]:
    results[f] = extract_buttons(f)

print(json.dumps(results, indent=2))
