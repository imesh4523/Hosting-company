const fs = require('fs');
const html = fs.readFileSync('c:/Users/azureuser/Desktop/Hosting site/frontend/public/ecommerce-hosting.html', 'utf8');

// Search for the 4.9 rating alt text
const regex = /<img[^>]+4\.9[^>]*>/i;
const matches = html.match(new RegExp('<img[^>]+4\\.9[^>]*>', 'ig'));
console.log(matches || "Not found");
