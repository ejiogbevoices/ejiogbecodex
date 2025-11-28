
global.window = {};
try {
    require('./js/data/odu.js');
    console.log("odu.js loaded successfully.");
    if (window.oduData) {
        console.log("oduData length: " + window.oduData.length);
    } else {
        console.log("oduData is undefined after loading.");
    }
} catch (e) {
    console.error("Error loading odu.js:");
    console.error(e);
}
