const fs = require('fs');
const html = fs.readFileSync('frontend/public/login.html', 'utf8');

// Find the social login buttons section
const idx = html.search(/fa fa-facebook/);
console.log('fa fa-facebook idx:', idx);
if (idx !== -1) {
    console.log(html.substring(idx - 200, idx + 400));
}

// Check what FontAwesome CSS URL is referenced
const faIdx = html.indexOf('FontAwesome.css');
if (faIdx !== -1) {
    console.log('\nFontAwesome CSS line:', html.substring(faIdx - 100, faIdx + 100));
}
