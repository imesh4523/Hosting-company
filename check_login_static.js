const fs = require('fs');
const html = fs.readFileSync('frontend/public/server-status-static.html', 'utf8');
const m = html.match(/<a[^>]*href="([^"]*)"[^>]*>Login/i);
console.log('Login points to:', m ? m[1] : 'not found');
const m2 = html.match(/<a[^>]*href="([^"]*)"[^>]*>Register/i);
console.log('Register points to:', m2 ? m2[1] : 'not found');
