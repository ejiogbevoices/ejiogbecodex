import re

file_path = 'js/data/erindinlogun.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Function to remove nested verses
def remove_nested_verses(text, parent_key):
    # Pattern to find the parent object and its content
    # We look for key: { ... }
    # This is tricky with nested braces.
    # But we know verses: [...] is what we want to remove.
    
    # Alternative: Look for verses: [...] that is indented more than the root verses?
    # Root verses is usually indented by 8 spaces (inside the object in the array).
    # Nested verses would be indented by 12 spaces?
    # Let's check the file content again.
    # Line 8:         verses: [ -> 8 spaces.
    # Line 4:         name: { -> 8 spaces.
    # So verses inside name is indented by 8 spaces? No, line 8 looks aligned with line 7.
    # Line 7:             portuguese: "Okanran" -> 12 spaces.
    # Line 8:         verses: [ -> 8 spaces?
    # Let's check the view_file output again.
    # 4:         name: {
    # 5:             yoruba: "Òkànràn",
    # ...
    # 7:             portuguese: "Okanran"
    # 8:         verses: [
    # It seems the indentation of verses at line 8 is 8 spaces, same as name.
    # But it is syntactically inside name because there is no closing brace for name before it.
    # And line 20 is }, which closes name.
    
    # So effectively, we have:
    # name: {
    #    ...
    #    portuguese: "..."
    #    verses: [ ... ]
    # },
    
    # We want to remove the verses: [...] block from inside name, cowries, and aspects.
    
    # Strategy:
    # 1. Find occurrences of `name: \{` and the matching `\},`.
    #    Inside that range, remove `verses: \[[\s\S]*?\]`.
    #    Also fix the missing comma after the property before verses.
    
    # Since regex for nested structures is hard, and the structure is consistent:
    # We can use the fact that these "bad" verses blocks are followed immediately by `},` (closing the parent).
    # And the "good" verses block is followed by `},` (closing the main object) OR `sources:`.
    
    # Let's try to remove `verses: [...]` specifically when it follows `portuguese: "..."` (inside name),
    # `closed: ...` (inside cowries), or `negative: "..."` (inside aspects).
    
    pass

# 1. Remove verses inside name
# Pattern: "portuguese": "..." (missing comma) followed by verses: [...]
# We want to keep "portuguese": "..." and remove verses.
# And add a comma if needed? No, if we remove verses, portuguese is the last item, so no comma needed.
# But wait, line 7 is `portuguese: "Okanran"` (no comma).
# If we remove verses, it becomes `portuguese: "Okanran" \n },`. This is valid JSON/JS.
content = re.sub(r'(portuguese:\s*".*?")\s*verses:\s*\[[\s\S]*?\],\s*', r'\1', content)

# 2. Remove verses inside cowries
# Pattern: `closed: \d+` followed by `verses: [...]`
content = re.sub(r'(closed:\s*\d+)\s*verses:\s*\[[\s\S]*?\],\s*', r'\1', content)

# 3. Remove verses inside aspects
# Pattern: `negative: "..."` followed by `verses: [...]`
# Note: negative string might span multiple lines or contain quotes.
# But usually it's `negative: "..."`
content = re.sub(r'(negative:\s*".*?")\s*verses:\s*\[[\s\S]*?\],\s*', r'\1', content)

# 4. Fix missing comma after sources
# Pattern: `sources: "..."` followed by `verses: [...]`
# This one is actually correct (verses should be there), but sources needs a comma.
# content = re.sub(r'(sources:\s*".*?")\s*(verses:)', r'\1,\n        \2', content)
# Wait, let's check if sources is always followed by verses.
# In id 1: sources: "1" \n verses: [...]
# Yes.
content = re.sub(r'(sources:\s*".*?")\s*(verses:)', r'\1,\n        \2', content)

# 5. General cleanup of double commas or weird spacing if any
# (Optional)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully cleaned up erindinlogun.js")
