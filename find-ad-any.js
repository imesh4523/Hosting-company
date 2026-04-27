const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /.{0,50}Account Details.{0,50}/g;
const matches = html.match(regex);
console.log(matches ? matches.join('\n') : 'No matches found');
