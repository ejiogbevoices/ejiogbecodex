const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js/data/odu.js');
console.log(`Reading ${filePath}...`);

try {
    const code = fs.readFileSync(filePath, 'utf8');
    const window = {};

    // Mock other potential globals if needed

    console.log("Evaluating code...");
    eval(code);

    if (window.oduData) {
        console.log("Success! oduData length:", window.oduData.length);
    } else {
        console.error("Error: oduData not found on window object.");
    }
} catch (e) {
    console.error("Runtime Error:", e.message);
    // console.error(e.stack); // Stack might be huge if it's a syntax error in a large file
    if (e instanceof SyntaxError) {
        console.error("Syntax Error Details:", e);
    }
}
