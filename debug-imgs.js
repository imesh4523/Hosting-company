const fs = require('fs');
const html = fs.readFileSync('c:/Users/azureuser/Desktop/Hosting site/frontend/public/ecommerce-hosting.html', 'utf8');
const regex = /(src|data-src)="([^"]+)"/g;
let match;
const urls = [];
while ((match = regex.exec(html)) !== null) {
    if (match[2].includes('.png') || match[2].includes('.jpg') || match[2].includes('.svg') || match[2].includes('.webp')) {
        urls.push(match[0]);
    }
}
console.log(urls.slice(0, 30).join('\n'));
