
import re

ROOTS = [
    "Ogbe", "Oyeku", "Iwori", "Odi", "Irosun", "Owonrin", "Obara", "Okanran",
    "Ogunda", "Osa", "Ika", "Oturupon", "Otura", "Irete", "Ose", "Ofun"
]

with open('/Users/monroerodriguezjohnson/Downloads/Ejiogbe Voices/Oduverse/js/data/odu.js', 'r') as f:
    content = f.read()

missing = []

for r in ROOTS:
    for l in ROOTS:
        if r == l:
            continue
        
        key = f"{r}-{l}"
        if f'"{key}": {{' not in content:
            missing.append(key)

print("Missing Odu:", missing)
