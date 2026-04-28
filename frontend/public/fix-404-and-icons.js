const fs = require('fs');
const path = require('path');

const publicDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

// Get all valid HTML files we have
const validHtmlFiles = new Set(files.map(f => f.replace('.html', '')));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let original = html;
    
    // 1. Fix icons and images missing (replace hardcoded localhost paths)
    html = html.replace(/http:\/\/localhost:3001/g, '');
    html = html.replace(/http:\/\/localhost:3000/g, '');
    
    // 2. Fix relative asset paths (like /themes/..., /img/..., /assets/...)
    html = html.replace(/(src|href)="(\/themes\/[^"]+)"/g, '$1="$2"');
    html = html.replace(/(src|href)="(\/img\/[^"]+)"/g, '$1="$2"');
    html = html.replace(/(src|href)="(\/assets\/[^"]+)"/g, '$1="$2"');
    html = html.replace(/(src|href)="(\/templates\/[^"]+)"/g, '$1="$2"');

    // 3. Fix missing .html extensions and 404 links
    // Find all href="/something" or href="something"
    html = html.replace(/href="([^"#]+)"/g, (match, url) => {
        // Skip external links, mailto, javascript, etc
        if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('javascript:')) {
            return match;
        }

        // Clean URL
        let cleanUrl = url.split('?')[0]; // Remove query params for checking
        if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.substring(1);
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
        
        // Remove .html for checking
        const baseName = cleanUrl.replace('.html', '');
        
        // Skip empty or anchor
        if (!baseName) return match;

        // If we HAVE the file locally, ensure it ends with .html
        if (validHtmlFiles.has(baseName)) {
            // Reconstruct the URL with .html
            const newUrl = url.replace(new RegExp(`${baseName}(\\.html|/|)$`), `${baseName}.html`);
            return `href="/${newUrl.startsWith('/') ? newUrl.substring(1) : newUrl}"`;
        } else {
            // We DO NOT have the file locally. Point to real hostingcompany to avoid 404.
            // Exclude some known dashboard routes
            if (baseName.includes('dashboard') || baseName.includes('login') || baseName.includes('register') || baseName.includes('submitticket')) {
                return match; // Let router.js handle it
            }
            return `href="/${url.startsWith('/') ? url.substring(1) : url}"`;
        }
    });

    if (html !== original) {
        fs.writeFileSync(filePath, html);
        console.log(`Fixed ${file}`);
    }
});
