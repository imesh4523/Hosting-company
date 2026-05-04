const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/nav.html', 'utf8');
const links = content.match(/href="([^"]*clientarea\.php[^"]*)"/g);
console.log(links ? links.join('\n') : 'none');
