const fs = require('fs');
const content = fs.readFileSync('../backend/fragments/services.html', 'utf8');
const m1 = content.match(/href="([^"]*)"[^>]*>\s*<i[^>]*><\/i>\s*Place a New Order/i) || content.match(/href="([^"]*)"[^>]*>\s*Place a New Order/i);
const m2 = content.match(/href="([^"]*)"[^>]*>\s*<i[^>]*><\/i>\s*View Available Addons/i) || content.match(/href="([^"]*)"[^>]*>\s*View Available Addons/i);
console.log('Order:', m1 ? m1[1] : 'not found');
console.log('Addons:', m2 ? m2[1] : 'not found');
