const fs = require('fs');
const html = fs.readFileSync('frontend/public/server-status-static.html', 'utf8');

// find where app-main starts
const idx = html.indexOf('<div class="app-main');
if (idx !== -1) {
    console.log(html.substring(idx, idx + 500));
} else {
    console.log("No app-main");
    // let's print body children
    console.log(html.substring(html.indexOf('<body'), html.indexOf('<body') + 500));
}
