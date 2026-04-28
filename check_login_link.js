const fs = require('fs');
const html = fs.readFileSync('frontend/public/about.html', 'utf8');
const match = html.match(/<a[^>]*href="([^"]*)"[^>]*>Login/i);
console.log('Login points to:', match ? match[1] : 'not found');
