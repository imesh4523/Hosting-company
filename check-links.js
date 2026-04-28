const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const publicDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';
const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const $ = cheerio.load(html);

const links = new Set();
$('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/')) {
        links.add(href);
    }
});

const missing = [];
links.forEach(link => {
    // remove query params and hash
    let p = link.split('?')[0].split('#')[0];
    
    // remove leading slash
    if (p.startsWith('/')) p = p.substring(1);
    
    if (p === '') return;
    
    // if no extension, maybe it's a directory? Next.js resolves it if .html exists
    let exists = false;
    if (fs.existsSync(path.join(publicDir, p))) {
        exists = true;
    } else if (fs.existsSync(path.join(publicDir, p + '.html'))) {
        exists = true;
    } else if (p.endsWith('.html')) {
        const withoutExt = p.substring(0, p.length - 5);
        if (fs.existsSync(path.join(publicDir, withoutExt))) {
            exists = true;
        }
    }
    
    if (!exists && !p.startsWith('index.php')) {
        missing.push(p);
    }
});

console.log('Missing internal links:');
missing.forEach(m => console.log(m));
