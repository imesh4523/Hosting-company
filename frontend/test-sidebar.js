const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/nav.html', 'utf8');
const idxAppMain = content.indexOf('<div class="app-main');
const beforeAppMain = content.substring(0, idxAppMain);
console.log('Sidebar before app-main:', beforeAppMain.includes('app-nav'));
console.log('Menu text before app-main:', beforeAppMain.includes('My Invoices'));
