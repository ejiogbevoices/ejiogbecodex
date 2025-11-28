import re

def analyze_odu():
    try:
        with open('js/data/odu.js', 'r') as f:
            content = f.read()
        
        report = []
        report.append(f"File size: {len(content)} bytes")
        
        # Check for AMULU_DETAILS
        amulu_match = re.search(r'const AMULU_DETAILS = \{', content)
        if not amulu_match:
            report.append("AMULU_DETAILS not found!")
            return "\n".join(report)
        
        start_idx = amulu_match.end()
        # Find end of AMULU_DETAILS (heuristic: }; at start of line)
        end_match = re.search(r'\n\};\n', content[start_idx:])
        if not end_match:
            report.append("End of AMULU_DETAILS not found!")
            # return "\n".join(report) # Continue anyway
            end_idx = len(content)
        else:
            end_idx = start_idx + end_match.start()
            
        amulu_content = content[start_idx:end_idx]
        
        # Find all keys
        # Pattern: "Key": {
        keys = re.findall(r'"([^"]+)":\s*\{', amulu_content)
        report.append(f"Found {len(keys)} entries in AMULU_DETAILS")
        
        # Check for Okanran entries
        okanran_keys = [k for k in keys if 'Okanran' in k]
        report.append(f"Found {len(okanran_keys)} Okanran entries: {okanran_keys}")
        
        # Check for missing 'fa' blocks
        # We iterate through the content and find blocks
        # This is hard with regex alone.
        # Let's check specific keys.
        
        missing_fa = []
        for key in keys:
            # Find the block for this key
            # We need to be careful with regex
            pattern = r'"' + re.escape(key) + r'":\s*\{(.*?)\n\s*\},?'
            # This regex assumes the block ends with }, or } at start of line
            # It might fail if nested braces are complex.
            # But let's try a simpler check:
            # Does the file contain "Key": { ... fa: { ... }
            
            # We can't easily isolate the block without a parser.
            # But we can check if "fa:" appears after "Key": and before the next "Key":
            pass

        # Let's try to find the specific Okanran entries and print their content
        for key in okanran_keys:
            # Find start
            key_start = amulu_content.find(f'"{key}":')
            if key_start == -1: continue
            
            # Find next key or end
            # This is rough
            snippet = amulu_content[key_start:key_start+1000] # Grab 1000 chars
            report.append(f"--- {key} ---")
            if "fa: {" not in snippet:
                report.append(f"WARNING: 'fa: {{' NOT FOUND in first 1000 chars of {key}")
                report.append(snippet[:200] + "...")
            else:
                report.append("fa block found")
                
        with open('debug_report.txt', 'w') as f:
            f.write("\n".join(report))
            
    except Exception as e:
        with open('debug_report.txt', 'w') as f:
            f.write(f"Error: {str(e)}")

if __name__ == "__main__":
    analyze_odu()
