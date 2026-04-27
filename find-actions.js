const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  if (match[1].includes('action=') || match[1].includes('details')) {
    console.log(match[1], '->', match[2].trim());
  }
}
