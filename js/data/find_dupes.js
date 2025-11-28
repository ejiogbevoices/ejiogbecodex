const fs = require('fs');

const content = fs.readFileSync('js/data/odu.js', 'utf8');
const lines = content.split('\n');

const keys = {};
const duplicates = [];

const keyRegex = /^\s*"([^"]+)":/;

lines.forEach((line, index) => {
    const match = line.match(keyRegex);
    if (match) {
        const key = match[1];
        // Ignore common properties
        if (["summary", "orisa", "advice", "taboos", "names", "professions", "male", "female", "fa", "name", "theme", "order", "prohibitions", "vodun", "overview", "symbolism", "characteristics", "gender", "elements", "animals", "colors", "esoteric", "associated", "prohibited", "pseudonyms"].includes(key)) {
            return;
        }

        if (keys[key]) {
            duplicates.push({
                key: key,
                firstLine: keys[key],
                secondLine: index + 1
            });
        } else {
            keys[key] = index + 1;
        }
    }
});

const output = duplicates.map(d => `Key: "${d.key}" - Lines: ${d.firstLine} and ${d.secondLine}`).join('\n');
fs.writeFileSync('dupes.txt', `Found ${duplicates.length} duplicates:\n` + output);
