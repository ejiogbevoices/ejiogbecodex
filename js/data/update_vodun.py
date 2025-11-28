import json
import re

# New Categories definition
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
        "title": "MARTIAL / WAR VODUN",
        "items": ["Gou", "Kokou"]
    },
    {
        "title": "ANCESTORS / SHRINES",
        "items": ["Asɛn", "Hoxo"]
    },
    {
        "title": "GATEKEEPER / MESSENGER",
        "items": ["Lêgba", "Aziyan"]
    },
    {
        "title": "WITCHCRAFT / AZÉ FORCES",
        "items": ["Minona", "Kɛnɛsi"]
    },
    {
        "title": "LOCAL / REGIONAL",
        "items": ["Ade", "Kluvito"]
    },
    {
        "title": "EWE / TRƆ TERRITORIAL FORCES",
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

# Mapping for name normalization
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
    "Ague Vodun": "ague_vodun",
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
    "Kokou": "kokou",
    "Asɛn": "asen",
    "Hoxo": "hoho",
    "Lêgba": "legba",
    "Minona": "minona",
    "Kɛnɛsi": "kenesi",
    "Aziyan": "aziyan",
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
    "Òrò": "oro",
    "Gelede": "gelede",
    "Ogboni": "edan_ogboni",
    "Egungun": "egungun"
}

# New Divinities Data
new_divinities = {
    "minona": """        {
            id: "minona",
            name: "Mǐnɔna",
            aka: ["Minona"],
            title: "Azé / Witchcraft Vodun",
            description: "Domain: forest magic, women’s power, domestic protection, agricultural fertility, divination with palm kernels. Relations: sister or mother of Legba in some lines; tightly linked to azé (witchcraft power), like Kɛnnɛsi and Gbadu.",
            attributes: ["Palm kernels", "Forest magic"],
            colors: [],
            offerings: [],
            day: ""
        },""",
    "aziyan": """        {
            id: "aziyan",
            name: "Aziyan",
            aka: ["Ayizan", "Aizan"],
            title: "Market Vodun",
            description: "Domain: marketplaces, commerce. Relations: paired with Legba. Function: guards the moral and spiritual rules of the market. Shrine logic: altar and shrine at or near entrances to markets.",
            attributes: ["Marketplace"],
            colors: [],
            offerings: [],
            day: ""
        },""",
    "kenesi": """        {
            id: "kenesi",
            name: "Kɛnɛsi",
            aka: ["Kɛnnɛsi"],
            title: "Azé / Witchcraft Vodun",
            description: "Function: sorcery enforcement, night power, punitive magic. Profile: invoked in harmful or high-risk workings, feared in Benin and Togo, aligned with Minona.",
            attributes: [],
            colors: [],
            offerings: [],
            day: ""
        },""",
    "kokou": """        {
            id: "kokou",
            name: "Kokou",
            aka: [],
            title: "Warrior Vodun",
            description: "Function: combat, possession, danger, blood-oath spirits. Profile: one of the most violent and demanding Vodun in Togo–Benin corridor, linked to drums, whips, and ecstatic trance.",
            attributes: ["Drums", "Whips"],
            colors: [],
            offerings: [],
            day: ""
        },"""
}

# Read existing divinities.js
with open('js/data/divinities.js', 'r') as f:
    content = f.read()

# Extract Orisa data (it's already categorized)
orisa_start = content.find('orisa: [') + len('orisa: [')
vodun_start_key = content.find('vodun: [')
orisa_end = content.rfind('],', 0, vodun_start_key)
orisa_data_str = content[orisa_start:orisa_end].strip()

# Extract Vodun data (it's categorized now)
vodun_start = vodun_start_key + len('vodun: [')
vodun_end = content.rfind(']', 0, content.rfind('}'))
vodun_data_str = content[vodun_start:vodun_end].strip()

# We need to flatten the existing categorized Vodun data to get the objects back
# or just parse it as is.
# Since I have the full list of categories and items I want to enforce,
# I can just extract all objects from the current file and re-bucket them.

def parse_all_objects(text):
    objects = {}
    
    # Simple state machine to find objects with IDs
    lines = text.split('\n')
    current_obj = []
    current_id = None
    in_object = False
    brace_level = 0
    
    for line in lines:
        stripped = line.strip()
        
        # Check for ID line
        id_match = re.search(r'id:\s*"([^"]+)"', stripped)
        if id_match:
            current_id = id_match.group(1)
        
        if '{' in stripped:
            brace_level += stripped.count('{')
            if brace_level > 0:
                in_object = True
        
        if in_object:
            current_obj.append(line)
        
        if '}' in stripped:
            brace_level -= stripped.count('}')
            if brace_level <= 0 and in_object:
                # End of object
                if current_id:
                    # Clean up trailing comma
                    obj_str = '\n'.join(current_obj)
                    if obj_str.strip().endswith(','):
                        obj_str = obj_str.strip()[:-1]
                    objects[current_id] = obj_str
                
                current_obj = []
                current_id = None
                in_object = False
                brace_level = 0 # Reset to be safe

    return objects

existing_vodun_objects = parse_all_objects(vodun_data_str)

# Add new divinities to the pool
for div_id, div_str in new_divinities.items():
    if div_str.strip().endswith(','):
        div_str = div_str.strip()[:-1]
    existing_vodun_objects[div_id] = div_str

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
             item_id = item_name.lower().replace(' ', '_').replace('/', '_')
        
        obj_str = existing_vodun_objects.get(item_id)
        
        if obj_str:
            # Re-indent
            lines = obj_str.split('\n')
            # Remove existing indentation
            cleaned_lines = [l.strip() for l in lines]
            
            # Add new indentation
            for line in cleaned_lines:
                new_vodun_content.append("                " + line)
            new_vodun_content[-1] += "," # Add comma
        else:
            # Placeholder if still missing (shouldn't happen for the new ones)
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
