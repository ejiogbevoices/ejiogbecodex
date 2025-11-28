import re
import json
import os

def parse_extended_data(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Split into sections
    # 1. Meji 1-16 (Stories, Etutu, Taboos)
    # 2. Praise Names for Odu (at the end)
    
    # Find Praise Names section
    praise_section_start = content.find("PRAISE NAMES FOR ODU")
    
    meji_text = content[:praise_section_start] if praise_section_start != -1 else content
    praise_text = content[praise_section_start:] if praise_section_start != -1 else ""
    
    meji_data = {}
    
    # Parse Meji Text
    # It's a mix of numbered items "1. Ogbe..." and then sections like "EJIOGBE ... Commentary ... Etutu ... Eewo"
    
    # Let's try to extract by Odu name headers like "EJIOGBE", "OYEKU MEJI", etc.
    odu_headers = [
        "EJIOGBE", "OYEKU MEJI", "IWORI MEJI", "IDI MEJI", "ODI MEJI", 
        "IROSUN MEJI", "OHENREN MEJI", "OWONRIN MEJI", "O'BARA MEJI", 
        "OKANRAN MEJI", "OGUNDA MEJI", "OSA MEJI", "IKA MEJI", 
        "OTURUPON MEJI", "OTURA MEJI", "IRETE MEJI", "OSE MEJI", 
        "ORAGUN MEJI", "OFUN MEJI"
    ]
    
    # Normalize headers for regex
    # Some might have extra spaces or variations
    
    # We can split by these headers.
    # But first, let's get the "1. Ogbe..." definitions at the top.
    
    # The top section seems to be definitions 1-16.
    # "1. Ogbe... Key Phrase: ..."
    
    definitions = {}
    for i in range(1, 17):
        # Regex to find "1. Ogbe" etc.
        # Note: The text has "1. Ogbe", "2. Oyeku", etc.
        pattern = r'{}\.\s+([A-Za-z]+).*?Key Phrase:\s*(.*?)(?=\n\d+\.|EJIOGBE|$)'.format(i)
        match = re.search(pattern, meji_text, re.DOTALL)
        if match:
            name = match.group(1)
            key_phrase = match.group(2).strip()
            # We can also extract the description text before Key Phrase
            full_match = match.group(0)
            desc = full_match.split("Key Phrase:")[0].split(match.group(1), 1)[1].strip(" ,.-")
            definitions[i] = {"description": desc, "key_phrase": key_phrase}

    # Now parse the detailed sections (Stories, Etutu, Eewo)
    # We'll map headers to index 1-16
    header_map = {
        "EJIOGBE": 1, "OYEKU MEJI": 2, "IWORI MEJI": 3, "IDI MEJI": 4, "ODI MEJI": 4,
        "IROSUN MEJI": 5, "OHENREN MEJI": 6, "OWONRIN MEJI": 6, "O'BARA MEJI": 7,
        "OKANRAN MEJI": 8, "OGUNDA MEJI": 9, "OSA MEJI": 10, "IKA MEJI": 11,
        "OTURUPON MEJI": 12, "OTURA MEJI": 13, "IRETE MEJI": 14, "OSE MEJI": 15,
        "ORAGUN MEJI": 16, "OFUN MEJI": 16
    }
    
    detailed_data = {}
    
    # Split by headers
    # We need to be careful because some headers are substrings of others or repeated? No.
    # But "IDI MEJI (ODI MEJI)" is one header.
    
    # Let's iterate through the text and find positions of headers
    sorted_headers = sorted(header_map.keys(), key=len, reverse=True)
    
    # Create a list of (index, header) tuples
    indices = []
    for h in sorted_headers:
        # Find all occurrences? Just the first one usually.
        # Note: "ODI MEJI" might appear in "IDI MEJI (ODI MEJI)"
        # So we should look for headers that are somewhat isolated or capitalized.
        # The text has them on their own lines usually.
        matches = list(re.finditer(re.escape(h), meji_text))
        for m in matches:
            indices.append((m.start(), header_map[h]))
            
    indices.sort()
    
    # Now extract content between indices
    for k in range(len(indices)):
        start, num = indices[k]
        end = indices[k+1][0] if k < len(indices) - 1 else len(meji_text)
        section_content = meji_text[start:end]
        
        # Parse Etutu, Eewo, Commentary, Story
        # Story is usually at the top.
        # Commentary: ...
        # Etutu: ...
        # Eewo: ...
        
        entry = {}
        
        # Extract Commentary
        if "Commentary:" in section_content:
            parts = section_content.split("Commentary:")
            if "\n" in parts[0]:
                entry["story"] = parts[0].split("\n", 1)[1].strip() # Remove header line
            else:
                entry["story"] = parts[0].strip()
            rest = parts[1]
        else:
            if "\n" in section_content:
                entry["story"] = section_content.split("\n", 1)[1].strip()
            else:
                entry["story"] = section_content.strip()
            rest = ""
            
        # Extract Etutu
        if "Etutu" in rest:
            etutu_parts = re.split(r'Etutu.*?:', rest)
            entry["commentary"] = etutu_parts[0].strip()
            if len(etutu_parts) > 1:
                etutu_content = etutu_parts[1]
                # Check for Eewo
                if "Eewo" in etutu_content:
                    eewo_parts = re.split(r'Eewo.*?:', etutu_content)
                    entry["etutu"] = eewo_parts[0].strip()
                    entry["eewo"] = eewo_parts[1].strip()
                elif "Eewu" in etutu_content: # Typo in text
                     eewo_parts = re.split(r'Eewu.*?:', etutu_content)
                     entry["etutu"] = eewo_parts[0].strip()
                     entry["eewo"] = eewo_parts[1].strip()
                else:
                    entry["etutu"] = etutu_content.strip()
        else:
            entry["commentary"] = rest.strip()
            
        # Merge into detailed_data
        if num not in detailed_data:
            detailed_data[num] = entry
        else:
            # If duplicate (e.g. multiple stories), maybe append?
            # For now, let's just keep the first or overwrite?
            # The text has multiple stories for some Odu (e.g. Ejiogbe has 2).
            # Let's make it a list of stories if possible, or just append text.
            detailed_data[num]["story"] += "\n\n" + entry.get("story", "")
            detailed_data[num]["commentary"] += "\n\n" + entry.get("commentary", "")
            if entry.get("etutu"):
                detailed_data[num]["etutu"] = (detailed_data[num].get("etutu", "") + "\n" + entry["etutu"]).strip()
            if entry.get("eewo"):
                detailed_data[num]["eewo"] = (detailed_data[num].get("eewo", "") + "\n" + entry["eewo"]).strip()

    return definitions, detailed_data, praise_text

def parse_orisa_praise(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
        
    orisa_data = {}
    current_orisa = None
    
    for line in content.split('\n'):
        line = line.strip()
        if not line: continue
        
        # If line is all caps (mostly), it's a header
        # But some praise names might be caps?
        # Headers: ÈSÙ, ÒSÓÒSÌ, etc.
        if line.isupper() and len(line) < 20: # Heuristic
            current_orisa = line
            orisa_data[current_orisa] = []
        elif current_orisa:
            # It's a praise name line
            # "Agongó-ogó — bearer of force."
            orisa_data[current_orisa].append(line)
            
    return orisa_data

def update_odu_js(definitions, detailed_data, praise_text, orisa_data, js_path):
    with open(js_path, 'r') as f:
        content = f.read()
        
    meji_keys = [
        "Ogbe-Ogbe", "Oyeku-Oyeku", "Iwori-Iwori", "Odi-Odi", 
        "Irosun-Irosun", "Owonrin-Owonrin", "Obara-Obara", "Okanran-Okanran",
        "Ogunda-Ogunda", "Osa-Osa", "Ika-Ika", "Oturupon-Oturupon",
        "Otura-Otura", "Irete-Irete", "Ose-Ose", "Ofun-Ofun"
    ]
    
    # 1. Update Meji Details
    for i, key in enumerate(meji_keys):
        num = i + 1
        
        # Get existing data to preserve some fields if needed
        # But we are largely overwriting or appending.
        
        def_data = definitions.get(num, {})
        det_data = detailed_data.get(num, {})
        
        # Construct new fields
        # We want to inject these into the 'ifa' object of MEJI_DETAILS
        
        # Find the entry
        entry_start = content.find(f'"{key}":')
        if entry_start == -1: continue
        
        ifa_start = content.find("ifa: {", entry_start)
        if ifa_start == -1: continue
        
        # We need to parse the existing ifa object to modify it safely
        # This is hard with regex.
        # Alternative: We can just inject new properties at the end of the ifa object.
        
        # Find closing brace of ifa object
        brace_count = 1
        curr = ifa_start + 6
        while brace_count > 0 and curr < len(content):
            if content[curr] == '{': brace_count += 1
            elif content[curr] == '}': brace_count -= 1
            curr += 1
        ifa_end = curr
        
        # Content inside ifa: { ... }
        ifa_content = content[ifa_start:ifa_end]
        
        # Prepare new fields
        new_fields = []
        if def_data.get("key_phrase"):
            new_fields.append(f'key_phrase: {json.dumps(def_data["key_phrase"])}')
        if det_data.get("story"):
            new_fields.append(f'stories: {json.dumps(det_data["story"])}') # Store as string for now
        if det_data.get("commentary"):
            new_fields.append(f'commentary: {json.dumps(det_data["commentary"])}')
        if det_data.get("etutu"):
            new_fields.append(f'etutu: {json.dumps(det_data["etutu"])}')
        if det_data.get("eewo"):
            new_fields.append(f'eewo: {json.dumps(det_data["eewo"])}')
            
        # Insert before the closing brace
        # Check if the last char before } is a comma
        last_char_idx = ifa_end - 2
        while content[last_char_idx].isspace(): last_char_idx -= 1
        
        insertion = ",\n            ".join(new_fields)
        
        if content[last_char_idx] != ',':
            insertion = ",\n            " + insertion
        else:
            insertion = "\n            " + insertion
            
        # Actually, let's just replace the whole ifa block if we can, but that risks losing other data.
        # Let's append.
        
        content = content[:ifa_end-1] + insertion + "\n        " + content[ifa_end-1:]

    # 2. Update Orisa Lists (Filter based on user list)
    # User said: "delete others under orisa that are not in the list"
    # The list is in orisa_data keys.
    valid_orisa = set(orisa_data.keys())
    
    # We need to map the names in odu.js (e.g. "Sango", "Ogun") to the keys in orisa_data (e.g. "ṢÀNGÓ", "ÒGÚN")
    # This requires fuzzy matching or normalization.
    
    def normalize(name):
        # Remove accents and lowercase for comparison
        # This is a simple approximation
        import unicodedata
        n = unicodedata.normalize('NFD', name).encode('ascii', 'ignore').decode('utf-8').lower()
        return n
        
    normalized_valid = {normalize(k): k for k in valid_orisa}
    
    # Regex to find orisa: [...] arrays
    # This is global replacement
    
    def replace_orisa_array(match):
        # match.group(0) is "orisa: [...]"
        array_str = match.group(1) # content inside []
        
        # Parse items
        # items are strings "..."
        items = re.findall(r'"(.*?)"', array_str)
        
        new_items = []
        for item in items:
            norm = normalize(item)
            # Check if it matches any valid orisa
            # We check if 'norm' contains any valid key or vice versa?
            # "Sango" vs "Sango"
            # "Esu Odara" vs "Esu"
            
            match_found = False
            for v_norm, v_real in normalized_valid.items():
                if v_norm in norm or norm in v_norm:
                    # Keep it, but maybe use the canonical name?
                    # User said "delete others...".
                    # If I replace "Esu Odara" with "ÈSÙ", I lose the "Odara" specificity.
                    # But maybe that's what they want?
                    # "praise Name correction *delete others under orisa that are not in the list"
                    # Let's keep the original item if it matches a valid Orisa.
                    new_items.append(item)
                    match_found = True
                    break
            
            if not match_found:
                # Delete it (don't add to new_items)
                pass
                
        return f'orisa: {json.dumps(new_items)}'

    content = re.sub(r'orisa:\s*\[(.*?)\]', replace_orisa_array, content, flags=re.DOTALL)
    
    # 3. Add ORISA_PRAISE_NAMES constant
    # We'll add it at the end of the file or after AMULU_DETAILS
    
    orisa_praise_js = "const ORISA_PRAISE_NAMES = " + json.dumps(orisa_data, indent=4) + ";\n"
    
    # Find end of file
    content += "\n\n" + orisa_praise_js
    
    # Also export it if needed? The file seems to just define consts.
    # We should probably attach it to window if it's not a module.
    content += "\nwindow.ORISA_PRAISE_NAMES = ORISA_PRAISE_NAMES;\n"

    with open(js_path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    definitions, detailed_data, praise_text = parse_extended_data("js/data/raw_odu_data_extended.txt")
    orisa_data = parse_orisa_praise("js/data/orisa_praise_names.txt")
    update_odu_js(definitions, detailed_data, praise_text, orisa_data, "js/data/odu.js")
    print("Update complete.")
