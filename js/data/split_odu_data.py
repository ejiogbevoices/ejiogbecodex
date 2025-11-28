
import re
import json
import os

LOG_FILE = 'debug_log.txt'

def log(msg):
    with open(LOG_FILE, 'a') as f:
        f.write(msg + '\n')

def parse_odu_js(file_path):
    if not os.path.exists(file_path):
        log(f"File not found: {file_path}")
        return {}

    with open(file_path, 'r') as f:
        content = f.read()
    
    log(f"File size: {len(content)} bytes")
    lines = content.split('\n')
    log(f"Total lines: {len(lines)}")
    
    data = {}
    
    # Regex to find object keys
    # We'll be more permissive: look for "Key": {
    pattern = re.compile(r'"?([A-Z][a-z]+-[A-Z][a-z]+)"?:\s*\{')
    
    current_key = None
    buffer = []
    brace_count = 0
    in_object = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        if i < 20:
            log(f"Line {i}: {stripped}")
            
        # Check for key match
        match = pattern.match(stripped)
        
        if match and not in_object:
            key = match.group(1)
            log(f"Found key: {key}")
            current_key = key
            in_object = True
            brace_count = 1
            buffer = [line]
            continue
            
        if in_object:
            buffer.append(line)
            brace_count += line.count('{')
            brace_count -= line.count('}')
            
            if brace_count == 0:
                # End of object
                full_block = '\n'.join(buffer)
                data[current_key] = full_block
                in_object = False
                current_key = None
                
    return data

def extract_section(block, section_name):
    start_idx = block.find(f'{section_name}: {{')
    if start_idx == -1:
        return None
        
    brace_count = 1
    idx = start_idx + len(f'{section_name}: {{')
    end_idx = idx
    
    while brace_count > 0 and end_idx < len(block):
        char = block[end_idx]
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
        end_idx += 1
        
    if brace_count == 0:
        return block[start_idx:end_idx]
    return None

def main():
    # Clear log
    with open(LOG_FILE, 'w') as f:
        f.write("Starting extraction...\n")

    raw_data = parse_odu_js('js/data/odu.js')
    log(f"Extracted {len(raw_data)} raw entries")
    
    ifa_data = {}
    fa_data = {}
    
    for key, block in raw_data.items():
        ifa_block = extract_section(block, 'ifa')
        fa_block = extract_section(block, 'fa')
        
        if ifa_block:
            try:
                value = ifa_block.split(':', 1)[1].strip()
                if value.endswith(','): value = value[:-1]
                ifa_data[key] = value
            except:
                log(f"Error parsing ifa block for {key}")
            
        if fa_block:
            try:
                value = fa_block.split(':', 1)[1].strip()
                if value.endswith(','): value = value[:-1]
                fa_data[key] = value
            except:
                log(f"Error parsing fa block for {key}")

    # Write IFA_DATA
    with open('js/data/ifa.js', 'w') as f:
        f.write('const IFA_DATA = {\n')
        for key, value in ifa_data.items():
            f.write(f'    "{key}": {value},\n')
        f.write('};\n')
        
    # Write FA_DATA
    with open('js/data/fa.js', 'w') as f:
        f.write('const FA_DATA = {\n')
        for key, value in fa_data.items():
            f.write(f'    "{key}": {value},\n')
        f.write('};\n')
        
    log("Done.")

if __name__ == '__main__':
    main()
