import fs from 'fs';
import path from 'path';
import https from 'https';

const assets = JSON.parse(fs.readFileSync('assets-list.json', 'utf8'));

const publicDir = path.join('C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\public', 'ultahost-assets');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

(async () => {
    try {
        const allUrls = [...assets.links, ...assets.scripts];
        const ultahostUrls = allUrls.filter(u => u.startsWith('https://bill.ultahost.com'));
        
        console.log(`Found ${ultahostUrls.length} ultahost assets.`);
        
        for (const u of ultahostUrls) {
            const parsedUrl = new URL(u);
            const relativePath = parsedUrl.pathname.replace(/^\/+/, ''); // Remove leading slash
            const localDest = path.join(publicDir, relativePath);
            
            ensureDir(path.dirname(localDest));
            
            console.log(`Downloading ${u} -> ${localDest}`);
            await download(u, localDest);
        }
        
        console.log('Finished downloading assets.');
    } catch (err) {
        console.error(err);
    }
})();
