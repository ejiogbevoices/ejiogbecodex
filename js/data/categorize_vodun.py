import json
import re

# Categories definition
vodun_categories = [
    {
        "title": "MAWU LINE",
        "items": ["Nana Buluku", "Mawu", "Lissa", "Mahou-Lissa"]
    },
    {
        "title": "DESTINY / DIVINATION",
        "items": ["Gbadu", "Fa"]
    },
    {
        "title": "SERPENT / AXIS",
        "items": ["Ayidohouedo", "Dan", "Dangbé"]
    },
    {
        "title": "EARTH / LAND",
        "items": ["Sakpata", "Loko", "Tohossou", "Zã̀gbétɔ́", "Aziza"]
    },
    {
        "title": "SEA / FRESH WATER",
        "items": ["Agbe", "Ague Vodun", "Naete", "Adjakpa", "Avelekéte"]
    },
    {
        "title": "MAMI WATA COMPLEX",
        "items": ["Mami Wata", "Mami Ablo", "Mami Siki", "Mami Apouké", "Densu"]
    },
    {
        "title": "THUNDER / SKY",
        "items": ["Héviosso", "Sɛgbolisa"]
    },
    {
        "title": "IRON / WAR",
        "items": ["Gou"]
    },
    {
        "title": "ANCESTORS / SHRINES",
        "items": ["Asɛn", "Hoxo"]
    },
    {
        "title": "GATEKEEPER / MESSENGER",
        "items": ["Lêgba"]
    },
    {
        "title": "LOCAL / REGIONAL",
        "items": ["Ade", "Kluvito"]
    },
    {
        "title": "EWE / TRƆ SPIRITS",
        "items": ["Trowo/Tro", "Gambada", "Hoedo", "Xuelú"]
    },
    {
        "title": "GOROVODOU / NORTHERN COMPLEX",
        "items": ["Allah", "Bangre", "Kunde", "Kadzanka", "Sacra Bode", "Sunia Compo", "Kwamosi", "Nana Wango"]
    },
    {
        "title": "YORUBA SYSTEMS",
        "items": ["Abiku", "Òrò", "Gelede", "Ogboni", "Egungun"]
    }
]

# Mapping for name normalization (User list name -> ID or Name in existing data)
name_mapping = {
    "Nana Buluku": "nana_baluku",
    "Mawu": "mawu",
    "Lissa": "lisa",
    "Mahou-Lissa": "mawu_lisa",
    "Gbadu": "gabadu",
    "Fa": "fa",
    "Ayidohouedo": "ayido_wedo",
    "Dan": "dan",
    "Dangbé": "dangbe",
    "Sakpata": "sakpata",
    "Loko": "loko",
    "Tohossou": "tohossou",
    "Zã̀gbétɔ́": "zangbeto",
    "Aziza": "aziza",
    "Agbe": "agbe",
    "Ague Vodun": "ague_vodun", # Or Ague
    "Naete": "naete",
    "Adjakpa": "adjakpa",
    "Avelekéte": "avelekete",
    "Mami Wata": "mami_wata",
    "Mami Ablo": "mami_ablo",
    "Mami Siki": "mami_siki",
    "Mami Apouké": "mami_apouke",
    "Densu": "densu",
    "Héviosso": "heviosso",
    "Sɛgbolisa": "segbolisa",
    "Gou": "gu",
    "Asɛn": "asen",
    "Hoxo": "hoho", # or hoxo
    "Lêgba": "legba",
    "Ade": "ade",
    "Kluvito": "klouvito",
    "Trowo/Tro": "trowo",
    "Gambada": "gambada",
    "Hoedo": "hoedo",
    "Xuelú": "xuelu",
    "Allah": "allah",
    "Bangre": "bangre",
    "Kunde": "kunde",
    "Kadzanka": "kadzanka",
    "Sacra Bode": "sacra_bode",
    "Sunia Compo": "sunia_compo",
    "Kwamosi": "kwamosi",
    "Nana Wango": "nana_wango",
    "Abiku": "abiku",
    "Òrò": "oro", # Might be in Orisa list, need to duplicate or move? User put it in Vodun list too.
    "Gelede": "gelede",
    "Ogboni": "edan_ogboni", # Maybe? Or new entry
    "Egungun": "egungun"
}

# Read existing divinities.js
with open('js/data/divinities.js', 'r') as f:
    content = f.read()

# Extract Orisa data (it's already categorized)
# It starts after `orisa: [` and ends before `],` followed by `vodun:`
# This is tricky with regex because of nested brackets.
# But we know the structure is `orisa: [ ... ], vodun: [ ... ]`
# Let's assume the indentation helps.
# Orisa block is indented.

# Let's try to extract the two main blocks.
# Find `orisa: [`
orisa_start = content.find('orisa: [') + len('orisa: [')
# Find `vodun: [`
vodun_start_key = content.find('vodun: [')
orisa_end = content.rfind('],', 0, vodun_start_key)
orisa_data_str = content[orisa_start:orisa_end].strip()

# Find `vodun: [`
vodun_start = vodun_start_key + len('vodun: [')
vodun_end = content.rfind(']') # Last closing bracket of the file is for the main object? No, main object ends with `}`.
# The `vodun` array ends before the last `}`.
vodun_end = content.rfind(']', 0, content.rfind('}'))
vodun_data_str = content[vodun_start:vodun_end].strip()

# Parse Vodun data into a list of dicts
# Since it's JS object format, we can't use json.loads directly.
# We need to parse it manually or use a JS engine.
# I'll use a simple parser that assumes the format I generated.
def parse_js_objects(text):
    objects = []
    current_obj = []
    brace_count = 0
    in_object = False
    
    lines = text.split('\n')
    for line in lines:
        stripped = line.strip()
        if not stripped: continue
        
        if stripped == '{' or stripped.endswith('{'):
            if brace_count == 0:
                in_object = True
                current_obj = [line]
            else:
                current_obj.append(line)
            brace_count += 1
        elif stripped == '},' or stripped == '}':
            brace_count -= 1
            current_obj.append(line)
            if brace_count == 0:
                in_object = False
                # Process current_obj into a dict
                obj_str = '\n'.join(current_obj)
                objects.append(obj_str)
                current_obj = []
        else:
            if in_object:
                current_obj.append(line)
                
    return objects

vodun_objects_strs = parse_js_objects(vodun_data_str)

# Map ID to Object String
id_to_obj = {}
for obj_str in vodun_objects_strs:
    # Extract ID
    match = re.search(r'id:\s*"([^"]+)"', obj_str)
    if match:
        id_to_obj[match.group(1)] = obj_str

# Also need to look in Orisa data for things like Oro, Gelede if they are moved/copied
# But for now let's just look in Vodun data. If missing, we create placeholder.

# Generate new Vodun structure
new_vodun_content = []

for cat in vodun_categories:
    new_vodun_content.append("        {")
    new_vodun_content.append(f'            category: "{cat["title"]}",')
    new_vodun_content.append("            items: [")
    
    for item_name in cat["items"]:
        # Determine ID
        item_id = name_mapping.get(item_name)
        if not item_id:
             # Fallback: slugify
             item_id = item_name.lower().replace(' ', '_').replace('/', '_')
        
        obj_str = id_to_obj.get(item_id)
        
        if obj_str:
            # Clean up the object string (remove trailing comma if present)
            if obj_str.strip().endswith(','):
                obj_str = obj_str.strip()[:-1]
            # Indent
            lines = obj_str.split('\n')
            for line in lines:
                new_vodun_content.append("            " + line)
            new_vodun_content[-1] += "," # Add comma
        else:
            # Create placeholder
            safe_id = item_id
            new_vodun_content.append("                {")
            new_vodun_content.append(f'                    id: "{safe_id}",')
            new_vodun_content.append(f'                    name: "{item_name}",')
            new_vodun_content.append('                    aka: [],')
            new_vodun_content.append(f'                    title: "{item_name}",')
            new_vodun_content.append('                    description: "Description coming soon.",')
            new_vodun_content.append('                    attributes: [],')
            new_vodun_content.append('                    colors: [],')
            new_vodun_content.append('                    offerings: [],')
            new_vodun_content.append('                    day: ""')
            new_vodun_content.append("                },")

    new_vodun_content.append("            ]")
    new_vodun_content.append("        },")

# Reconstruct the file
final_content = f"""const divinityData = {{
    orisa: [
{orisa_data_str}
    ],
    vodun: [
{chr(10).join(new_vodun_content)}
    ]
}};

window.divinityData = divinityData;
"""

with open('js/data/divinities.js', 'w') as f:
    f.write(final_content)
