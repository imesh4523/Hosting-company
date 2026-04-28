const fs = require('fs');
const html = fs.readFileSync('frontend/public/login.html', 'utf8');

// Find the social buttons section
const loginDivIdx = html.indexOf('col-centered') !== -1 ? html.indexOf('col-centered') : html.indexOf('row-centered');
console.log('row/col-centered idx:', loginDivIdx);
if (loginDivIdx !== -1) {
    console.log(html.substring(loginDivIdx - 100, loginDivIdx + 800));
}
