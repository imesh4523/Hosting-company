const fs = require('fs');
const html = fs.readFileSync('c:/Users/azureuser/Desktop/Hosting site/frontend/public/index.html', 'utf8');

// Find all hrefs
const hrefs = [];
const regex = /href="([^"]+)"/g;
let match;
while ((match = regex.exec(html)) !== null) {
    hrefs.push(match[1]);
}

// Group and count
const counts = {};
hrefs.forEach(h => counts[h] = (counts[h] || 0) + 1);

console.log(JSON.stringify(counts, null, 2));
