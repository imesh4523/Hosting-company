const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/nav.html', 'utf8');
const split = content.indexOf('<div class="app-main');
console.log('My Dashboard before split:', content.substring(0, split).includes('My Dashboard'));
