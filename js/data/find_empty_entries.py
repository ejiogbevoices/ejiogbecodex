import re

def find_empty_entries(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    families = ["Irosun", "Owonrin", "Obara", "Okanran"]
    suffixes = ["Ogbe", "Oyeku", "Iwori", "Odi", "Irosun", "Owonrin", "Obara", "Okanran", "Ogunda", "Osa", "Ika", "Oturupon", "Otura", "Irete", "Ose", "Ofun"]
    
    empty_entries = []
    
    print("Checking for empty entries in Irosun, Owonrin, Obara, Okanran families:\n")
    
    with open("empty_entries.txt", "w") as out:
        out.write("Empty Entries Report:\n\n")
        
        for family in families:
            for suffix in suffixes:
                if family == suffix:
                    continue
                
                key = f"{family}-{suffix}"
                
                # Regex to find the entry
                pattern = r'"' + key + r'":\s*\{(.*?)\n\s*\},?'
                match = re.search(pattern, content, re.DOTALL)
                
                if match:
                    entry_content = match.group(1)
                    if "ifa: {" in entry_content:
                        # Check if summary is empty
                        summary_match = re.search(r'summary:\s*"(.*?)"', entry_content)
                        if not summary_match or not summary_match.group(1).strip():
                             out.write(f"[EMPTY SUMMARY] {key}\n")
                             empty_entries.append(key)
                        # Check if advice is empty
                        advice_match = re.search(r'advice:\s*"(.*?)"', entry_content)
                        if not advice_match or not advice_match.group(1).strip():
                             out.write(f"[EMPTY ADVICE] {key}\n")
                             if key not in empty_entries: empty_entries.append(key)
                    else:
                        out.write(f"[MISSING IFA] {key}\n")
                        empty_entries.append(key)
                else:
                    # Try finding without trailing comma
                    pattern = r'"' + key + r'":\s*\{(.*?)\n\s*\}'
                    match = re.search(pattern, content, re.DOTALL)
                    if match:
                        entry_content = match.group(1)
                        if "ifa: {" in entry_content:
                            summary_match = re.search(r'summary:\s*"(.*?)"', entry_content)
                            if not summary_match or not summary_match.group(1).strip():
                                 out.write(f"[EMPTY SUMMARY] {key}\n")
                                 empty_entries.append(key)
                        else:
                            out.write(f"[MISSING IFA] {key}\n")
                            empty_entries.append(key)
                    else:
                        out.write(f"[NOT FOUND] {key}\n")
                        empty_entries.append(key)

if __name__ == "__main__":
    find_empty_entries("js/data/odu.js")
