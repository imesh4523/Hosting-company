const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = 'frontend/public';
let downloaded = 0;
let errors = 0;

function downloadAsset(urlPath) {
    const localPath = path.join(publicDir, urlPath);
    if (fs.existsSync(localPath)) return;

    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    console.log('Downloading', urlPath);
    const file = fs.createWriteStream(localPath);
    https.get('https://youuhost.com' + urlPath, (res) => {
        if (res.statusCode === 200) {
            res.pipe(file);
            downloaded++;
        } else {
            console.log('Failed:', urlPath, res.statusCode);
            errors++;
        }
    }).on('error', (e) => {
        console.error(e);
        errors++;
    });
}

function scanFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanFiles(fullPath);
        } else if (file.endsWith('.html')) {
            const html = fs.readFileSync(fullPath, 'utf8');
            let m;
            const regex = /(?:src|data-src|href)="(\/[^"]+\.(?:png|jpg|jpeg|svg|webp|gif))"/g;
            while ((m = regex.exec(html)) !== null) {
                downloadAsset(m[1].split('?')[0]);
            }
        }
    });
}

scanFiles(publicDir);
console.log('Finished scanning.');
