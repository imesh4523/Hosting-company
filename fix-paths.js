const fs = require('fs');
const path = './frontend/public/dashboard-static.html';

let html = fs.readFileSync(path, 'utf8');

// Replace /dashboard/templates/ and /dashboard/assets/ with absolute URLs
html = html.replace(/\/dashboard\/templates\//g, 'https://bill.ultahost.com/templates/');
html = html.replace(/\/dashboard\/assets\//g, 'https://bill.ultahost.com/assets/');
html = html.replace(/http:\/\/localhost:3000\/dashboard\//g, 'https://bill.ultahost.com/');

fs.writeFileSync(path, html, 'utf8');
console.log('Fixed missing paths in dashboard-static.html');
