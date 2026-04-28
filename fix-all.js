const fs = require('fs');
const path = require('path');

const publicDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let original = html;
    
    // 1. Remove hardcoded localhost:3000
    html = html.replace(/http:\/\/localhost:3000/g, '');
    
    // 2. Fix cookie domain in scripts
    html = html.replace(/domain=localhost:3001/g, 'domain=' + (typeof window !== 'undefined' ? window.location.hostname : ''));
    html = html.replace(/domain=\.localhost:3001/g, ''); // Make it relative to current domain
    
    // 3. Ensure login/register links go to our routes
    html = html.replace(/href="\/dashboard\/login\.php/g, 'href="/login');
    html = html.replace(/href="\/login\.php/g, 'href="/login');
    html = html.replace(/href="\/dashboard\/register\.php/g, 'href="/register');
    html = html.replace(/href="\/register\.php/g, 'href="/register');
    
    // 4. Inject router.js into ALL public HTML files if they don't have it
    if (!html.includes('router.js') && !file.includes('static.html')) {
        const routerScript = '<script src="/js/router.js"></script>';
        html = html.replace('</body>', `${routerScript}</body>`);
    }

    if (html !== original) {
        fs.writeFileSync(filePath, html);
        console.log(`Fixed ${file}`);
    }
});
