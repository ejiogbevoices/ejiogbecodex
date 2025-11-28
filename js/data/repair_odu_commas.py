import re

def repair_odu_js(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Pattern: closing brace of ifa object, followed by whitespace (including newlines), followed by "fa:"
    # We want to ensure there is a comma after the closing brace.
    
    # Regex to find: } followed by whitespace, then "fa:"
    # We use a lookahead or just capture groups to insert the comma.
    
    # This regex matches "}" then any whitespace then "fa:"
    # We replace it with "}," then the whitespace then "fa:"
    
    # Be careful not to double commas if one exists (though the error suggests none exist)
    # But let's be safe: match "}" then whitespace (without comma) then "fa:"
    
    pattern = r'}(\s+)fa:'
    
    # Replacement: },\1fa:
    new_content = re.sub(pattern, r'},\1fa:', content)
    
    if content != new_content:
        print("Fixed missing commas.")
        with open(file_path, 'w') as f:
            f.write(new_content)
    else:
        print("No missing commas found matching the pattern.")

if __name__ == "__main__":
    repair_odu_js("js/data/odu.js")
