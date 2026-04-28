const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = 'frontend/public';

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const newUrl = new URL(res.headers.location, url).href;
                downloadFile(newUrl, dest).then(resolve).catch(reject);
            } else {
                reject(new Error(`Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

function processFiles() {
    const missing = new Set();
    function walk(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.html')) {
                const html = fs.readFileSync(fullPath, 'utf8');
                let m;
                const regex = /(?:src|data-src|href)="(\/[^"]+\.(?:png|jpg|jpeg|svg|webp|gif))"/g;
                while ((m = regex.exec(html)) !== null) {
                    missing.add(m[1].split('?')[0]);
                }
            }
        });
    }
    walk(publicDir);

    const missingArr = Array.from(missing).filter(p => !fs.existsSync(path.join(publicDir, p)));
    console.log(`Found ${missingArr.length} missing files`);

    let current = 0;
    function next() {
        if (current >= missingArr.length) return;
        const p = missingArr[current++];
        const dest = path.join(publicDir, p);
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        const url = 'https://ultahost.com' + p;
        downloadFile(url, dest).then(() => {
            console.log(`Downloaded ${current}/${missingArr.length}: ${p}`);
            next();
        }).catch(err => {
            console.error(`Failed ${p}: ${err.message}`);
            next();
        });
    }
    
    // 5 concurrent downloads
    for (let i = 0; i < 5; i++) next();
}

processFiles();
