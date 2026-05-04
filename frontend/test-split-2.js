const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/nav.html', 'utf8');
const split = content.indexOf('<div class="app-main');
const sidebar = content.substring(0, split);
console.log('Sidebar has Active Products:', sidebar.includes('Your Active Products/Services'));
