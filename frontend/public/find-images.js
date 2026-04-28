const fs = require('fs');
const html = fs.readFileSync('c:/Users/azureuser/Desktop/Hosting site/frontend/public/hostingcompany-vs-godaddy.html', 'utf8');

// Find all src and data-src
const srcRegex = /src="([^"]+)"/g;
const dataSrcRegex = /data-src="([^"]+)"/g;

const srcs = [];
let match;
while ((match = srcRegex.exec(html)) !== null) { srcs.push(match[1]); }
while ((match = dataSrcRegex.exec(html)) !== null) { srcs.push(match[1]); }

console.log(srcs.slice(0, 20));
