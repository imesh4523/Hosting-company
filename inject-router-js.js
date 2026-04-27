const fs = require('fs');
const path = require('path');

const publicDir = './frontend/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Remove the old inline script
    const oldScriptRegex = /<script>\s*document\.addEventListener\('DOMContentLoaded', function\(\) \{\s*const routeMap[\s\S]*?<\/script>/i;
    html = html.replace(oldScriptRegex, '');
    
    // If not already injected, inject the new router.js script right before </body>
    if (!html.includes('<script src="/js/router.js"></script>')) {
        html = html.replace(/<\/body>/i, '<script src="/js/router.js"></script>\n</body>');
    }
    
    fs.writeFileSync(filePath, html, 'utf8');
});
console.log('Injected router.js into all HTML files.');
