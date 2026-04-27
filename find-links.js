const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');
const linkRegex = /<a[^>]+href="([^">]+)"/g;
let match;
const links = new Set();
while ((match = linkRegex.exec(html)) !== null) {
  links.add(match[1]);
}
console.log(Array.from(links).filter(l => l.includes('clientarea') || l.includes('.php')).slice(0, 15).join('\n'));
