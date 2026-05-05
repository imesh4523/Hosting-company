const fs = require('fs');
const path = require('path');

const publicDir = './frontend/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Replace all bill.youuhost.com asset paths with local proxy paths
    html = html.replace(/https:\/\/bill\.youuhost\.com\/templates\//g, '/templates/');
    html = html.replace(/https:\/\/bill\.youuhost\.com\/assets\//g, '/assets/');

    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Reverted absolute URLs to proxy URLs in:', file);
});
