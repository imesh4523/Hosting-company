const fs = require('fs');
const html = fs.readFileSync('frontend/public/index.html', 'utf8');
const match = html.match(/<a [^>]*>Login<\/a>/gi);
console.log(match);
