const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/main.html', 'utf8');
const match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
console.log(match ? match[1] : 'not found');
