
import re
import json
import os

# Define the 8 pairs of roots as requested
PAIRS = [
    ("Ogbe", "Oyeku"),
    ("Iwori", "Odi"),
    ("Irosun", "Owonrin"),
    ("Obara", "Okanran"),
    ("Ogunda", "Osa"),
    ("Ika", "Oturupon"),
    ("Otura", "Irete"),
    ("Ose", "Ofun")
]

# Mapping for file names
FILE_NAMES = [
    "ogbe_oyeku.js",
    "iwori_odi.js",
    "irosun_owonrin.js",
    "obara_okanran.js",
    "ogunda_osa.js",
    "ika_oturupon.js",
    "otura_irete.js",
    "ose_ofun.js"
]

def parse_odu_js(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return {}

    with open(file_path, 'r') as f:
        content = f.read()
    
    data = {}
    
    # Regex to find object keys and their content
    # Matches "Key": { ... }
    # We use a state machine approach for robustness with nested braces
    
    lines = content.split('\n')
    current_key = None
    buffer = []
    brace_count = 0
    in_object = False
    
    # Regex for keys: "Name-Name": {
    key_pattern = re.compile(r'^"?([A-Z][a-z]+-[A-Z][a-z]+)"?:\s*\{')
    
    for line in lines:
        stripped = line.strip()
        
        # Check for key match if not inside an object
        if not in_object:
            match = key_pattern.match(stripped)
            if match:
                current_key = match.group(1)
                in_object = True
                brace_count = 0 # Will be incremented below
                buffer = []
                # Fall through to process the line
        
        if in_object:
            buffer.append(line)
            brace_count += line.count('{')
            brace_count -= line.count('}')
            
            if brace_count == 0:
                # End of object
                full_block = '\n'.join(buffer)
                # Remove trailing comma if present
                if full_block.strip().endswith(','):
                    full_block = full_block.strip()[:-1]
                
                data[current_key] = full_block
                in_object = False
                current_key = None
                
    return data

def main():
    print("Parsing odu.js...")
    all_data = parse_odu_js('js/data/odu.js')
    print(f"Found {len(all_data)} entries.")
    
    # Create output directory if not exists
    os.makedirs('js/data/couplets', exist_ok=True)
    
    for i, (root1, root2) in enumerate(PAIRS):
        filename = FILE_NAMES[i]
        print(f"Generating {filename} for {root1} and {root2}...")
        
        file_content = []
        file_content.append(f"// Odu Data for {root1} and {root2}")
        file_content.append(f"window.ODU_BATCH_{i+1} = {{")
        
        count = 0
        # Find all keys starting with root1- or root2-
        # Also handle Meji keys which might be "Ogbe-Ogbe"
        
        for key, block in all_data.items():
            # Check if key belongs to this pair
            # Key format is "Right-Left" (e.g. Ogbe-Oyeku)
            # We want all Odu where the Right leg (first part) is root1 or root2
            
            parts = key.split('-')
            if len(parts) != 2:
                continue
                
            right_leg = parts[0]
            
            if right_leg == root1 or right_leg == root2:
                # This entry belongs to this file
                # We need to ensure the block doesn't have a trailing comma if it's the last one,
                # but since we are constructing a JS object, we can just add commas between them.
                
                # The block captured includes the key "Key": { ... }
                # We need to preserve that structure.
                # Wait, parse_odu_js returns the value block? No, it returns the whole thing?
                # Let's check parse_odu_js logic.
                # It captures "buffer". Buffer starts with the line containing the key.
                # So `block` is `"Key": { ... }`.
                
                file_content.append(block + ",")
                count += 1
        
        file_content.append("};")
        
        with open(f"js/data/couplets/{filename}", 'w') as f:
            f.write('\n'.join(file_content))
            
        print(f"Wrote {count} entries to {filename}")

if __name__ == '__main__':
    main()
