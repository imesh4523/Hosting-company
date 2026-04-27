const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /.{0,100}Support PIN.{0,100}/;
const match = html.match(regex);
console.log(match ? match[0] : 'Not found');
