
import re
import json
import os

LOG_FILE = 'debug_split_16.txt'

def log(msg):
    with open(LOG_FILE, 'a') as f:
        f.write(msg + '\n')

# Define the 8 pairs of roots
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

def parse_odu_js(file_path):
    if not os.path.exists(file_path):
        log(f"File not found: {file_path}")
        return {}

    with open(file_path, 'r') as f:
        content = f.read()
    
    log(f"Read {len(content)} bytes from {file_path}")
    
    data = {}
    
    lines = content.split('\n')
    current_key = None
    buffer = []
    brace_count = 0
    in_object = False
    
    key_pattern = re.compile(r'^"?([A-Z][a-z]+-[A-Z][a-z]+)"?:\s*\{')
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        if not in_object:
            match = key_pattern.match(stripped)
            if match:
                current_key = match.group(1)
                in_object = True
                brace_count = 0 
                buffer = []
                # Fall through
        
        if in_object:
            buffer.append(line)
            brace_count += line.count('{')
            brace_count -= line.count('}')
            
            if brace_count == 0:
                full_block = '\n'.join(buffer)
                if full_block.strip().endswith(','):
                    full_block = full_block.strip()[:-1]
                data[current_key] = full_block
                in_object = False
                current_key = None
                
    log(f"Parsed {len(data)} entries")
    return data

def extract_inner_section(block, section_name):
    start_marker = f'{section_name}: {{'
    start_idx = block.find(start_marker)
    if start_idx == -1:
        start_marker = f'"{section_name}": {{'
        start_idx = block.find(start_marker)
        if start_idx == -1:
            return None

    open_brace_idx = start_idx + len(start_marker) - 1
    
    brace_count = 1
    curr_idx = open_brace_idx + 1
    
    while brace_count > 0 and curr_idx < len(block):
        char = block[curr_idx]
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
        curr_idx += 1
        
    if brace_count == 0:
        return block[open_brace_idx:curr_idx]

    return None

def main():
    with open(LOG_FILE, 'w') as f:
        f.write("Starting split_16...\n")
        
    all_data = parse_odu_js('js/data/odu.js')
    
    os.makedirs('js/data/16_files', exist_ok=True)
    
    for i, (root1, root2) in enumerate(PAIRS):
        idx = i + 1
        base_name = f"{root1.lower()}_{root2.lower()}"
        odu_filename = f"{base_name}_ifa.js"
        faodu_filename = f"{base_name}_fa.js"
        
        log(f"Processing pair {root1}-{root2} -> {odu_filename}, {faodu_filename}")
        
        ifa_content = []
        ifa_content.append(f"window.ODU_{root1.upper()}_{root2.upper()}_IFA = {{")
        
        fa_content = []
        fa_content.append(f"window.ODU_{root1.upper()}_{root2.upper()}_FA = {{")
        
        count = 0
        for key, block in all_data.items():
            parts = key.split('-')
            if len(parts) != 2: continue
            right_leg = parts[0]
            
            if right_leg == root1 or right_leg == root2:
                count += 1
                # Extract Ifa
                ifa_val = extract_inner_section(block, 'ifa')
                if ifa_val:
                    ifa_content.append(f'    "{key}": {ifa_val},')
                
                # Extract Fa
                fa_val = extract_inner_section(block, 'fa')
                if fa_val:
                    fa_content.append(f'    "{key}": {fa_val},')
        
        log(f"Found {count} entries for this pair")
                    
        ifa_content.append("};")
        fa_content.append("};")
        
        with open(f"js/data/{odu_filename}", 'w') as f:
            f.write('\n'.join(ifa_content))
            
        with open(f"js/data/{faodu_filename}", 'w') as f:
            f.write('\n'.join(fa_content))
            
    log("Done.")

if __name__ == '__main__':
    main()
