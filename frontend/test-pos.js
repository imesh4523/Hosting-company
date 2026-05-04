const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/nav.html', 'utf8');
const idxAppMain = content.indexOf('<div class="app-main');
const idxDashboard = content.indexOf('My Dashboard');
console.log('app-main:', idxAppMain);
console.log('My Dashboard:', idxDashboard);
