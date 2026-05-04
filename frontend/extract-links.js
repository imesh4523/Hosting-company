const fs = require('fs');
const html = fs.readFileSync('proxy-debug.html', 'utf8');
const regex = /href="([^"]+)"[^>]*>\s*(?:<i[^>]+>\s*<\/i>\s*)?Order Now/ig;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log('Found link:', match[1]);
}
