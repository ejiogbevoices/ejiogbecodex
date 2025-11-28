import re
import sys

print("Starting analysis...")

def analyze_odu_js(file_path):
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    print(f"Total lines: {len(lines)}")

    # Check for duplicate keys
    keys = {}
    duplicates = []
    
    key_pattern = re.compile(r'^\s*"([^"]+)":')
    
    for i, line in enumerate(lines):
        match = key_pattern.match(line)
        if match:
            key = match.group(1)
            # Ignore keys inside 'names' object (male, female) or 'animals' etc.
            # We only care about Odu names like "Ogbe-Ogbe", "Irosun-Oyeku"
            if "-" in key or "Ogbe" in key: 
                if key in keys:
                    duplicates.append((key, keys[key], i + 1))
                keys[key] = i + 1

    if duplicates:
        print(f"Found {len(duplicates)} duplicate keys:")
        for key, line1, line2 in duplicates:
            print(f"  {key}: lines {line1} and {line2}")
    else:
        print("No duplicate keys found.")

    # Check for closing braces
    print("\nClosing braces analysis:")
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == "}," or stripped == "};":
            indent = len(line) - len(line.lstrip())
            print(f"  Line {i+1}: '{stripped}' (indent {indent})")

if __name__ == "__main__":
    analyze_odu_js("js/data/odu.js")
