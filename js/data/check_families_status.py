import re

def check_families(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    families = ["Irosun", "Owonrin", "Obara", "Okanran"]
    suffixes = ["Ogbe", "Oyeku", "Iwori", "Odi", "Irosun", "Owonrin", "Obara", "Okanran", "Ogunda", "Osa", "Ika", "Oturupon", "Otura", "Irete", "Ose", "Ofun"]
    
    results = []
    
    for family in families:
        results.append(f"\n--- Checking {family} Family ---")
        for suffix in suffixes:
            if family == suffix:
                continue # Skip Meji (e.g. Irosun-Irosun) if handled separately, but check anyway
            
            key = f"{family}-{suffix}"
            
            # Find all occurrences
            matches = []
            for i, line in enumerate(lines):
                if f'"{key}":' in line:
                    matches.append(i + 1)
            
            if not matches:
                results.append(f"[MISSING] {key}: Not found in file")
                continue
            
            status = []
            for line_num in matches:
                # Extract content for this entry
                # Simple extraction: read from line_num until next "Key": or end of object
                # This is hard to do perfectly without parsing, but we can check the next few lines
                
                # Find the block start in content
                # We'll use regex on the whole content to find the block starting at this line
                # Actually, just looking at the file content around the line is enough
                
                # Let's check if "ifa: {" exists in the block
                # We'll search for the key in the content and look ahead
                
                # Construct a regex for this specific occurrence
                # This is tricky if there are multiple. 
                # Let's just check if the line is followed by "ifa:" within reasonable distance
                
                has_ifa = False
                start_idx = -1
                # Find the index of this line in the content
                # This is slow but accurate
                # Let's just use the line index from split
                
                # Look ahead 20 lines
                chunk = "\n".join(lines[line_num-1:line_num+50])
                if "ifa: {" in chunk:
                    has_ifa = True
                
                status.append(f"Line {line_num} (Has IFA: {has_ifa})")
            
            if len(matches) > 1:
                results.append(f"[DUPLICATE] {key}: Found {len(matches)} times: {', '.join(status)}")
            else:
                if "Has IFA: False" in status[0]:
                     results.append(f"[EMPTY] {key}: Found at {matches[0]} but NO IFA data")
                else:
                     results.append(f"[OK] {key}: Found at {matches[0]} with IFA")

    with open("families_status.txt", "w") as out:
        out.write("\n".join(results))

if __name__ == "__main__":
    check_families("js/data/odu.js")
