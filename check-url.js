const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<link[^>]+href="([^">]+theme\.css[^">]*)"/i;
const match = html.match(regex);
console.log(match ? match[1] : 'Not found');
