const fs = require('fs');
const path = require('path');

const publicDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let original = html;

    // Fix hardcoded HTTrack server
    html = html.replace(/http:\/\/localhost:3001/g, 'https://youuhost.com');

    // Fix hardcoded local server
    html = html.replace(/http:\/\/localhost:3000/g, '');

    // Fix any broken paths from original domain (if needed)
    // HTML might have `href="privacy-policy"` instead of `privacy-policy.html`
    // Let's replace some known common ones that might be missing .html
    const missingHtmlFiles = [
        'privacy-policy', 'cookie-policy', 'terms', 'contact', 'affiliates', 'about', 'refund', 'legal'
    ];

    missingHtmlFiles.forEach(name => {
        // Find href="name" or href="/name" and change to href="/name.html"
        // Be careful not to replace href="name.html"
        const regex = new RegExp(`href="\\/?${name}(?!\\.html|\\/)([^"]*)"`, 'g');
        html = html.replace(regex, `href="/${name}.html$1"`);
    });

    if (html !== original) {
        fs.writeFileSync(filePath, html);
        console.log(`Fixed ${file}`);
    }
});
