const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<a[^>]+>([^<]*Account Details[^<]*)<\/a>/i;
const match = html.match(regex);
console.log(match ? match[0] : 'Not found');
