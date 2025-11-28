const fs = require('fs');
const code = fs.readFileSync('./js/data/odu.js', 'utf8');
global.window = {};
try {
    eval(code);
    fs.writeFileSync('test_output.txt', "oduData length: " + (window.oduData ? window.oduData.length : "undefined"));
} catch (e) {
    fs.writeFileSync('test_output.txt', "Error: " + e.toString());
}
