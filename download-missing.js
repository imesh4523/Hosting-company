const fs = require('fs');
const path = require('path');
const https = require('https');

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
const missingAssets = new Set();

htmlFiles.forEach(filePath => {
    let html = fs.readFileSync(filePath, 'utf8');
    const regex = /(?:src|data-src|href)="(\/[^"]+\.(?:png|jpg|jpeg|svg|webp|gif|css|js))"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const urlPath = match[1].split('?')[0]; // Remove query params
        const localPath = path.join(publicDir, urlPath);
        if (!fs.existsSync(localPath)) {
            missingAssets.add(urlPath);
        }
    }
});

console.log(`Found ${missingAssets.size} missing assets.`);

function download(urlPath) {
    return new Promise((resolve) => {
        const fullUrl = 'https://youuhost.com' + urlPath;
        const localPath = path.join(publicDir, urlPath);

        // Ensure directory exists
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        https.get(fullUrl, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(localPath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Follow redirects
                https.get(res.headers.location.startsWith('http') ? res.headers.location : 'https://youuhost.com' + res.headers.location, (res2) => {
                    if (res2.statusCode === 200) {
                        const file = fs.createWriteStream(localPath);
                        res2.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            resolve(true);
                        });
                    } else {
                        resolve(false);
                    }
                }).on('error', () => resolve(false));
            } else {
                resolve(false);
            }
        }).on('error', (err) => {
            resolve(false);
        });
    });
}

async function downloadAll() {
    let success = 0;
    let fail = 0;
    const array = Array.from(missingAssets);

    // Process in batches of 10 to avoid socket errors
    for (let i = 0; i < array.length; i += 10) {
        const batch = array.slice(i, i + 10);
        const results = await Promise.all(batch.map(download));
        results.forEach(res => res ? success++ : fail++);
        console.log(`Progress: ${Math.min(i + 10, array.length)} / ${array.length}`);
    }

    console.log(`Downloaded ${success} assets. Failed ${fail}.`);
}

if (missingAssets.size > 0) {
    downloadAll();
}
