import re

def process_pot(content, start_marker, end_marker, pot_name, amount_code):
    start_idx = content.find(start_marker)
    if start_idx == -1:
        return content
    
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        end_idx = len(content)
        
    pot_code = content[start_idx:end_idx]
    
    # 1. Find the header block. It starts with {/* Header */} and ends with the first <p className=...
    header_start_idx = pot_code.find('{/* Header */}')
    if header_start_idx == -1:
        return content
        
    p_tag_idx = pot_code.find('<p className=', header_start_idx)
    if p_tag_idx == -1:
        return content
        
    header_block = pot_code[header_start_idx:p_tag_idx]
    body_block = pot_code[p_tag_idx:]
    
    # Modify header block
    # Replace <div className="flex items-center justify-between mb-3 mt-1"> with cursor-pointer and onClick
    header_block = header_block.replace(
        '<div className="flex items-center justify-between mb-3 mt-1">',
        f'<div className="flex items-center justify-between mb-3 mt-1 cursor-pointer" onClick={{() => setExpandedPot(expandedPot === \'{pot_name}\' ? null : \'{pot_name}\')}}>'
    )
    
    # Add ChevronDown
    old_badge_div = f'<div className="flex items-center justify-center mr-1">\n                                  <CoinBadge points={{{amount_code}}} size="md" />\n                                </div>'
    new_badge_div = f'''<div className="flex items-center justify-center mr-1 gap-3">
                                  <CoinBadge points={{{amount_code}}} size="md" />
                                  <motion.div animate={{{{ rotate: expandedPot === '{pot_name}' ? 180 : 0 }}}}>
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  </motion.div>
                                </div>'''
    
    if old_badge_div in header_block:
        header_block = header_block.replace(old_badge_div, new_badge_div)
    else:
        # Maintenance pot doesn't have CoinBadge, it just has nothing or a different layout in the header right side.
        # Let's check maintenance pot header later.
        pass

    # Modify body block
    # We need to wrap it, but exclude the closing </div> of the pot card which is usually at the very end.
    # We'll just wrap the whole body_block minus the last </div>
    
    # Find the last </div>
    last_div_idx = body_block.rfind('</div>')
    if last_div_idx != -1:
        inner_body = body_block[:last_div_idx]
        closing_div = body_block[last_div_idx:]
        
        wrapped_body = f'''<AnimatePresence>
                                {{expandedPot === '{pot_name}' && (
                                  <motion.div
                                    initial={{{{ height: 0, opacity: 0 }}}}
                                    animate={{{{ height: 'auto', opacity: 1 }}}}
                                    exit={{{{ height: 0, opacity: 0 }}}}
                                    className="overflow-hidden"
                                  >
{inner_body}
                                  </motion.div>
                                )}}
                              </AnimatePresence>
{closing_div}'''
        
        new_pot_code = header_block + wrapped_body
        return content[:start_idx] + new_pot_code + content[end_idx:]
    else:
        return content


with open('src/components/ChildDashboard.tsx', 'r') as f:
    content = f.read()

# Savings Pot
content = process_pot(content, '{/* Savings Pot Unlocked Card */}', '{/* === FOOD POT SECTION === */}', 'savings', 'activeChild.savings_pot || 0')
# Food Pot
content = process_pot(content, '{/* Food Pot Card */}', '{/* === GIFTING POT SECTION === */}', 'food', 'activeChild.food_pot || 0')
# Gifting Pot
content = process_pot(content, '{/* Gifting Pot Card */}', '{/* === MAINTENANCE POT SECTION === */}', 'gifting', 'activeChild.charity_pot || 0')

# Maintenance Pot is a bit different because it has no CoinBadge and has a different header right side. Let's do it manually.

with open('src/components/ChildDashboard.tsx', 'w') as f:
    f.write(content)
print("Done")
