const fs = require('fs');
const path = require('path');
const publicDir = 'frontend/public';
const missing = new Set();

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.html')) {
            let html = fs.readFileSync(fullPath, 'utf8');
            let m;
            const regex = /(?:src|data-src|href)="(\/[^"]+\.(?:png|jpg|jpeg|svg|webp|gif))"/g;
            while ((m = regex.exec(html)) !== null) {
                const urlPath = m[1].split('?')[0];
                const localPath = path.join(publicDir, urlPath);
                if (!fs.existsSync(localPath)) {
                    missing.add(urlPath);
                }
            }
        }
    });
}
walk(publicDir);
console.log(Array.from(missing).slice(0, 30));
