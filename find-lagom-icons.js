const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /class="[^"]*(ls-[a-z0-9-]+|lm-[a-z0-9-]+)[^"]*"/ig;
let match;
const icons = new Set();
while ((match = regex.exec(html)) !== null) {
  icons.add(match[1]);
}
console.log(Array.from(icons).join('\n'));
