import re

with open('src/components/ParentDashboard.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'import { Input }' not in content:
    content = content.replace("import { Button } from './ui/Button';", "import { Button } from './ui/Button';\nimport { Input } from './ui/Input';\nimport { Select } from './ui/Select';")

# 1. Add Task Modal
content = re.sub(
    r'<input\s+type="text"\s+value=\{taskTitle\}\s+onChange=\{\(e\) => setTaskTitle\(e\.target\.value\)\}\s+placeholder="Clean your room, finish maths workbook, brush teeth..."\s+className=\{`w-full [^`]+`\}\s+required\s+/>',
    r'<Input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Clean your room, finish maths workbook, brush teeth..." required />',
    content
)

content = re.sub(
    r'<input\s+type="number"\s+min="0"\s+value=\{taskPoints\}\s+onChange=\{e => setTaskPoints\(Number\(e\.target\.value\)\)\}\s+className=\{`w-full [^`]+`\}\s+/>',
    r'<Input type="number" min="0" value={taskPoints} onChange={e => setTaskPoints(Number(e.target.value))} />',
    content
)

content = re.sub(
    r'<select\s+value=\{taskRecurrence\}\s+onChange=\{\(e\) => setTaskRecurrence\(e\.target\.value as any\)\}\s+className=\{`w-full [^`]+`\}\s*>',
    r'<Select value={taskRecurrence} onChange={(e) => setTaskRecurrence(e.target.value as any)}>',
    content
)

content = content.replace('</select>', '</Select>')

content = re.sub(
    r'<input\s+type="number"\s+min="1"\s+value=\{taskCooldownMinutes \|\| \'\'\}\s+onChange=\{e => setTaskCooldownMinutes\(e\.target\.value \? Number\(e\.target\.value\) : undefined\)\}\s+className=\{`w-full [^`]+`\}\s+required\s+/>',
    r'<Input type="number" min="1" value={taskCooldownMinutes || \'\'} onChange={e => setTaskCooldownMinutes(e.target.value ? Number(e.target.value) : undefined)} required />',
    content
)

with open('src/components/ParentDashboard.tsx', 'w') as f:
    f.write(content)

