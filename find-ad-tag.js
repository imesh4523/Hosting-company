const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<a[^>]*>[^<]*Account Details[^<]*<\/a>/ig;
const matches = html.match(regex);
console.log(matches || 'No matches found');
