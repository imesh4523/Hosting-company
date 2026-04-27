const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<head>([\s\S]*?)<\/head>/i;
const match = html.match(regex);
console.log(match ? match[1].includes('font-awesome') : 'No head');
