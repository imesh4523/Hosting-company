const fs = require('fs');
const html = fs.readFileSync('c:/Users/azureuser/Desktop/Hosting site/frontend/public/dashboard-static.html', 'utf8');
const regex = /href="([^"]+)"/g;
let match;
const links = new Set();
while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('tel:') || url.startsWith('mailto:')) continue;
    links.add(url);
}

console.log('--- ALL LINKS ---');
Array.from(links).sort().forEach(l => console.log(l));
