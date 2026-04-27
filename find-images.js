const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const imgRegex = /<img[^>]+src="([^">]+)"/g;
let match;
let count = 0;
while ((match = imgRegex.exec(html)) !== null && count < 10) {
  console.log('Image src:', match[1]);
  count++;
}
