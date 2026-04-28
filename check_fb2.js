const fs = require('fs');
const html = fs.readFileSync('frontend/public/login.html', 'utf8');

// Find all occurrences of 'Facebook' to locate the button
let idx = 0;
let count = 0;
while (count < 10) {
    idx = html.indexOf('Facebook', idx + 1);
    if (idx === -1) break;
    // Check if this is inside a button/link
    const context = html.substring(idx - 100, idx + 100);
    if (context.includes('btn') || context.includes('href') || context.includes('<a ')) {
        console.log(`\n=== Match at ${idx} ===`);
        console.log(html.substring(idx - 200, idx + 200));
        count++;
    }
}
