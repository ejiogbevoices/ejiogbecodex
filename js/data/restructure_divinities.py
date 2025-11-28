import json
import re

# Load the existing divinities data (I'll paste the content here essentially, or read it if I could, but I'll just paste the structure I know)
# Since I can't read the JS file directly as JSON, I'll mock the data loading or use a regex to extract it if I were running locally.
# But here I will define the mapping logic and the new structure.

# I will create a script that outputs the new JS file content.

categories = [
    {
        "title": "1. PRIMORDIAL FORCES (ÌMÒLÈ / ÌRÚNMÒLÈ)",
        "items": ["Olódùmarè", "Òrìsà Ọ̀run", "Ìmòlè", "Ìgbàmòlè", "Irúnmòle", "Odù", "Odùdúwà", "Òrún"]
    },
    {
        "title": "2. FORCES OF NATURE (ÒRÌSÀ)",
        "items": ["Obàtálá", "Ògún", "Sàngó", "Ọ̀ṣun", "Òṣóòsì", "Òṣànyìn", "Ọya", "Olókun", "Yemo̩ja", "Ọbà", "Ọrìṣà Oko", "Olósa", "Olùmú", "Ọ̀ràngún", "Òrànmíyàn"]
    },
    {
        "title": "3. PERSONAL DESTINY AND CONSCIOUSNESS FORCES (ORÍ SYSTEM)",
        "items": ["Orí", "Àjàlá-mòpín", "Ìpònrí", "Ìporí", "Elédà", "Ejùfiri", "Korí", "Sàaragáà", "Sùngbèmí", "Aláànú"]
    },
    {
        "title": "4. ANCESTRAL REALM (ÈGÚN / ÌRÚNLÈ)",
        "items": ["Ègún", "Irúnlẹ̀", "Òrìṣà Ìdílé", "Ajọbí", "Àjínde", "Ọ̀sì", "Arúkú", "Iwin"]
    },
    {
        "title": "5. DESTRUCTIVE / ADVERSARIAL FORCES (AJOGÚN)",
        "items": ["Ikú", "Àrùn", "Òfò", "Ègún-burúkú", "Èpè", "Òògùn-burúkú", "Eburu", "Elénìní"]
    },
    {
        "title": "6. SPIRIT CHILDREN (ÀBÌKÚ / ÈMÈRÈ)",
        "items": ["Àbìkú", "Èmèrè", "Eléré", "Dàdá"]
    },
    {
        "title": "7. ELEMENTAL / FOREST / RIVER SPIRITS (ÀRÒNÌ, IWIN, WÀRÀPÀ ETC.)",
        "items": ["Aroní", "Àgbìgbò", "Agemo", "Oluéri", "Òrò", "Ọ̀rò-Òkè", "Òòsàoko", "Egbéògba", "Iwin"]
    },
    {
        "title": "8. MOTHERS / ELDER WOMEN SPIRIT COLLECTIVES (ÌYÁÀMI / ELÉYẸ)",
        "items": ["Ìyáàmi", "Àjé", "Aje Saluga", "Ayélalà", "Egbéògba"]
    },
    {
        "title": "9. ESU AND MESSENGER FORCES",
        "items": ["Èṣù", "Ìrànṣẹ́", "Opèlè", "Akódá", "Àṣedá"]
    },
    {
        "title": "10. DIVINATION / ODÙ / ORUNMILA SYSTEM",
        "items": ["Òrúnmìlà", "Èlà", "Opèlè", "Odù", "Apetebi"]
    },
    {
        "title": "11. COSMIC BODIES / ASTRAL FORCES",
        "items": ["Òòrùn", "Osù", "Ìràwò alé", "Àmòká", "Òsùmàrè"]
    },
    {
        "title": "12. WEATHER / WIND / ATMOSPHERIC FORCES",
        "items": ["Aàjà", "Oyè", "Iyansa"]
    },
    {
        "title": "13. EARTH / MATERIAL FORCES",
        "items": ["Onílẹ̀", "Edan", "Sigidi", "Sigidi-àgbọ"]
    },
    {
        "title": "14. SOCIAL / ROYAL ANCESTRAL FORCES (HISTORICAL-SPIRITUAL HYBRIDS)",
        "items": ["Òrànmíyàn", "Òràáyàn", "Òràngún"]
    }
]

# Mapping from name to ID in existing data
name_to_id = {
    "Olódùmarè": "olodumare",
    "Odù": "odu_orisa",
    "Odùdúwà": "oduduwa",
    "Òrún": "orun",
    "Obàtálá": "obatala",
    "Ògún": "ogun",
    "Sàngó": "sango",
    "Ọ̀ṣun": "osun",
    "Òṣóòsì": "osoosi",
    "Òṣànyìn": "osanyin",
    "Ọya": "oya",
    "Olókun": "olokun",
    "Yemo̩ja": "yemoja",
    "Ọbà": "oba",
    "Ọrìṣà Oko": "orisa_oko",
    "Olósa": "olosa",
    "Òrànmíyàn": "oranmiyan",
    "Orí": "ori",
    "Àjàlá-mòpín": "ajala_mopin",
    "Korí": "kori",
    "Ègún": "egungun",
    "Ikú": "iku",
    "Ajogún": "ajogun", # Generic
    "Àbìkú": "abiku",
    "Dàdá": "dada",
    "Òrò": "oro",
    "Ọ̀rò-Òkè": "oke",
    "Òòsàoko": "orisa_oko",
    "Egbéògba": "egbe_orun",
    "Ìyáàmi": "iyami",
    "Àjé": "aje",
    "Èṣù": "esu",
    "Òrúnmìlà": "orunmila",
    "Òsùmàrè": "osumare",
    "Onílẹ̀": "ile_onile",
    "Edan": "edan_ogboni"
}

# I need to read the file content to get the full objects.
# I will assume the file is passed as an argument or I read it from a known path.
import sys

def parse_js_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract the object content. It's assigned to `const divinityData = { ... };`
    # This is a bit hacky but should work for this specific file structure.
    # I'll look for `orisa: [` and `vodun: [` blocks.
    
    # Actually, I'll just use regex to find objects with ids.
    # pattern = r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",.*?\}(?=,\s*\{|\s*\])'
    # This is too complex for regex on nested structures.
    
    # Better approach: Read the file, and for each ID in my mapping, extract that block.
    # Or, since I'm in the environment, I can just use the `divinityData` if I could execute JS.
    # But I can't.
    
    # Let's try to extract blocks by matching `{ id: "..." ... }`
    
    divinities = {}
    
    # Split by `id: "` to find starts of objects
    parts = content.split('id: "')
    for part in parts[1:]: # Skip the first chunk before the first id
        id_val = part.split('"')[0]
        
        # Now find the end of this object. It's tricky with nested braces.
        # But looking at the file, the objects are well formatted.
        # They end with `},` or `}` before `]`
        
        # Let's reconstruct the object string.
        # We need to find the closing brace.
        # Simple counter for braces.
        brace_count = 0
        obj_str = 'id: "' + part
        
        # We need to find where this object ends.
        # Since we split by `id: "`, the `part` contains the rest of the file starting from the ID.
        # But wait, splitting destroys the structure.
        pass

    # Let's use a simpler approach. I will read the file line by line and build a dictionary of ID -> lines.
    current_id = None
    current_lines = []
    
    lines = content.split('\n')
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('id: "'):
            if current_id:
                divinities[current_id] = current_lines
            current_id = stripped.split('"')[1]
            current_lines = [line]
        elif current_id:
            # Check if this line ends the object.
            # In the file, objects in the array end with `},` or `}`
            if stripped == '},' or stripped == '}':
                current_lines.append(line)
                divinities[current_id] = current_lines
                current_id = None
                current_lines = []
            else:
                current_lines.append(line)
                
    return divinities

def generate_new_js(divinities, categories, name_to_id):
    output = ["const divinityData = ["]
    
    processed_ids = set()
    
    for cat in categories:
        output.append("    {")
        output.append(f'        category: "{cat["title"]}",')
        output.append("        items: [")
        
        for item_name in cat["items"]:
            # Find the ID
            div_id = name_to_id.get(item_name)
            
            # Special handling for names with accents that might not match exactly or aliases
            if not div_id:
                # Try to find by name in the loaded divinities
                for did, lines in divinities.items():
                    # Extract name from lines
                    name_line = next((l for l in lines if 'name: "' in l), None)
                    if name_line:
                        d_name = name_line.split('name: "')[1].split('"')[0]
                        if d_name == item_name:
                            div_id = did
                            break
            
            if div_id and div_id in divinities:
                # Existing divinity
                processed_ids.add(div_id)
                lines = divinities[div_id]
                # Indent lines
                output.append("            {")
                for line in lines:
                    output.append("    " + line)
                # Ensure the last line has a comma if it's not the last item?
                # The `lines` include the closing brace. We should strip it and wrap properly.
                # Actually, the `lines` from my parser include the closing `},` or `}`.
                # Let's strip the last line and the first line (which is just `id: ...`)
                # Reconstruct:
                # output.append(f'                id: "{div_id}",')
                # for line in lines[1:-1]:
                #     output.append("    " + line)
                # output.append("            },")
            else:
                # New divinity placeholder
                safe_id = item_name.lower().replace(' ', '_').replace('/', '_').replace('(', '').replace(')', '').replace("'", "").replace('à', 'a').replace('á', 'a').replace('è', 'e').replace('é', 'e').replace('ì', 'i').replace('í', 'i').replace('ò', 'o').replace('ó', 'o').replace('ù', 'u').replace('ú', 'u').replace('ṣ', 's').replace('ọ', 'o').replace('ẹ', 'e').replace('-', '_')
                output.append("            {")
                output.append(f'                id: "{safe_id}",')
                output.append(f'                name: "{item_name}",')
                output.append('                aka: [],')
                output.append(f'                title: "{item_name}",')
                output.append('                description: "Description coming soon.",')
                output.append('                attributes: [],')
                output.append('                colors: [],')
                output.append('                offerings: [],')
                output.append('                day: ""')
                output.append("            },")
        
        output.append("        ]")
        output.append("    },")
        
    output.append("];")
    output.append("")
    output.append("window.divinityData = divinityData;")
    
    return "\n".join(output)

# Run the script
divinities = parse_js_file('/Users/monroerodriguezjohnson/Downloads/Ejiogbe Voices/Oduverse/js/data/divinities.js')
new_js = generate_new_js(divinities, categories, name_to_id)
print(new_js)
