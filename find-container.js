const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<div class="main-content[^>]*>/i;
const match = html.match(regex);
console.log(match ? match[0] : 'No main-content found');

const regex2 = /<div id="main-body"[^>]*>/i;
const match2 = html.match(regex2);
console.log(match2 ? match2[0] : 'No main-body found');

const regex3 = /<section id="main-body"[^>]*>/i;
const match3 = html.match(regex3);
console.log(match3 ? match3[0] : 'No section main-body found');
