const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/nav.html', 'utf8');
const match = content.match(/href="([^"]*masspay[^"]*)"/g);
console.log(match ? match.join('\n') : 'none');
