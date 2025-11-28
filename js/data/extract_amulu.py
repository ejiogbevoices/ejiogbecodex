
with open('js/data/odu.js', 'r') as f:
    lines = f.readlines()

# Extract AMULU_DETAILS (lines 707 to 4374, 0-indexed is 706 to 4374)
amulu_lines = lines[706:4374]
with open('js/data/amulu.js', 'w') as f:
    f.writelines(amulu_lines)
