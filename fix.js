const fs = require('fs');
const path = './frontend/public/dashboard-static.html';

let html = fs.readFileSync(path, 'utf8');

// Fix localhost:3000 links
html = html.replace(/http:\/\/localhost:3000\/dashboard\//g, 'https://bill.youuhost.com/');

// Fix relative root links starting with /templates/
html = html.replace(/"\/templates\//g, '"https://bill.youuhost.com/templates/');

// Fix relative root links starting with /assets/
html = html.replace(/"\/assets\//g, '"https://bill.youuhost.com/assets/');

// Fix missing protocols
html = html.replace(/"\/\/bill\.youuhost\.com/g, '"https://bill.youuhost.com');

fs.writeFileSync(path, html, 'utf8');
console.log('Fixed URLs in dashboard-static.html');
