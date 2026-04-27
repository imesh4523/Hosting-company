const fs = require('fs');
const content = fs.readFileSync('public/index.html', 'utf8');
const match = content.match(/href="[^"]*".{0,20}>Client Area/i);
console.log(match ? match[0] : 'Not found');
