const fs = require('fs');
const html = fs.readFileSync('frontend/public/server-status-static.html', 'utf8');

const navIdx = html.indexOf('<div class="app-nav-header " id="header">');
const mainIdx = html.indexOf('<div class="app-main ">');
console.log('Nav header index:', navIdx);
console.log('Main index:', mainIdx);

if (navIdx !== -1 && mainIdx !== -1) {
    const navHtml = html.substring(navIdx, mainIdx);
    console.log('Nav contains Products?', navHtml.includes('Products'));
    
    // Check what elements have id="header"
    const m = html.match(/id="header"/g);
    console.log('Number of id="header":', m ? m.length : 0);
}
