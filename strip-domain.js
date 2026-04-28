const fs = require('fs');
const path = require('path');

const publicDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const htmlFiles = walk(publicDir);

htmlFiles.forEach(filePath => {
    let html = fs.readFileSync(filePath, 'utf8');
    let original = html;

    // 1. Strip the domain from absolute URLs
    html = html.replace(/https?:\/\/(www\.|bill\.)?ultahost\.com/gi, '');

    // 2. Fix links to ensure they point to .html or /index.html
    html = html.replace(/href="([^"#]+)"/g, (match, url) => {
        if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('javascript:')) {
            return match;
        }

        let cleanUrl = url.split('?')[0];
        if (cleanUrl === '/' || cleanUrl === '') return `href="/"`;

        // Check if the URL already has an extension
        if (cleanUrl.match(/\.[a-z0-9]+$/i)) {
            return match;
        }

        // It is a path without extension like /privacy-policy or /knowledge-base
        let localPath = cleanUrl;
        if (localPath.startsWith('/')) {
            localPath = path.join(publicDir, localPath);
        } else {
            localPath = path.join(path.dirname(filePath), localPath);
        }

        // Does localPath.html exist?
        if (fs.existsSync(localPath + '.html')) {
            return `href="${url.split('?')[0]}.html${url.includes('?') ? '?' + url.split('?')[1] : ''}"`;
        }

        // Does localPath/index.html exist?
        if (fs.existsSync(path.join(localPath, 'index.html'))) {
            let resUrl = url.split('?')[0];
            if (!resUrl.endsWith('/')) resUrl += '/';
            return `href="${resUrl}index.html${url.includes('?') ? '?' + url.split('?')[1] : ''}"`;
        }

        // Fallback: just return the match
        return match;
    });

    // 3. Replace any remaining text mentions of ultahost.com (not in URLs)
    // Actually, we can just replace 'ultahost.com' with 'localhost:3000' to be safe everywhere
    // Wait, replacing it everywhere might break some external things if they exist, but user said "kisima thenakaaape code eke mention venna ne" (should not be mentioned anywhere in our code)
    html = html.replace(/ultahost\.com/gi, 'localhost:3000');
    // Also replace UltaHost with HostingCompany
    html = html.replace(/UltaHost/g, 'Hosting Company');
    html = html.replace(/ultahost/gi, 'hostingcompany');

    if (html !== original) {
        fs.writeFileSync(filePath, html);
    }
});

console.log(`Processed ${htmlFiles.length} HTML files.`);
