const fs = require('fs');
const html = fs.readFileSync('frontend/public/login.html', 'utf8');

// Find the actual social login buttons (anchor tags with the social providers)
const facebookIdx = html.indexOf('Facebook');
console.log('First Facebook idx:', facebookIdx);
if (facebookIdx !== -1) {
    console.log(html.substring(facebookIdx - 300, facebookIdx + 200));
}
