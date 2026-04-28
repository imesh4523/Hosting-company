const fs = require('fs');
const html = fs.readFileSync('frontend/public/ultaai.html', 'utf8');
const match = html.match(/class="[^"]*ai_chat_scroll[^"]*"[\s\S]*?(<div class="flex-1 position-relative">[\s\S]*?)<\/form>/);
console.log(match ? match[0] : 'no match');
