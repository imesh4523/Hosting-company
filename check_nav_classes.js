const fs = require('fs');
const html = fs.readFileSync('frontend/public/server-status-static.html', 'utf8');
const h = html.substring(html.indexOf('<div class="app-nav "'), html.indexOf('</nav>') + 6);
const match = h.match(/class="[^"]*"/g);
console.log(match ? match.slice(0, 5) : 'none');
