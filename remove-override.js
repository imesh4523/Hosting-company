const fs = require('fs');
const path = './frontend/public/dashboard-static.html';

let html = fs.readFileSync(path, 'utf8');

// Remove the injected style block
html = html.replace(/<style>\n \/\* Override custom icon fonts that fail CORS \*\/[\s\S]*?<\/style>\n/, '');

fs.writeFileSync(path, html, 'utf8');
console.log('Removed font-family override');
