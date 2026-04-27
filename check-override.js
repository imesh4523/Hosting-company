const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<style>([\s\S]{0,100}Override[\s\S]*?)<\/style>/i;
const match = html.match(regex);
console.log(match ? 'Found override: ' + match[0] : 'Override not found');
