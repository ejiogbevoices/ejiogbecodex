
const fs = require('fs');

const ROOTS = [
    "Ogbe", "Oyeku", "Iwori", "Odi", "Irosun", "Owonrin", "Obara", "Okanran",
    "Ogunda", "Osa", "Ika", "Oturupon", "Otura", "Irete", "Ose", "Ofun"
];

const content = fs.readFileSync('/Users/monroerodriguezjohnson/Downloads/Ejiogbe Voices/Oduverse/js/data/odu.js', 'utf8');

const missing = [];
const generic = [];

for (let r = 0; r < ROOTS.length; r++) {
    for (let l = 0; l < ROOTS.length; l++) {
        if (r === l) continue;

        const key = `${ROOTS[r]}-${ROOTS[l]}`;
        if (!content.includes(`"${key}": {`)) {
            missing.push(key);
        } else {
            // Check if it has generic info (empty prohibitions, vodun, etc - though the user asked for "generic information or no information")
            // A simple check is if the content block is very short or missing fields.
            // But for now let's just find the missing keys first.
        }
    }
}

console.log("Missing Odu:", missing);
