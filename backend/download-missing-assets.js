import https from 'https';
import fs from 'fs';
import path from 'path';

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
            console.log(`Skipped (exists): ${dest}`);
            return resolve();
        }
        const file = fs.createWriteStream(dest);
        const req = https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                file.close();
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => { file.close(); console.log(`Downloaded: ${url}`); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
        req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

const base = 'https://bill.youuhost.com';
const localBase = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\public\\youuhost-assets';

const assets = [
    '/templates/lagom2/assets/fonts/lagom-medium-icons.woff',
    '/templates/lagom2/assets/fonts/lagom-small-icons.woff',
    '/templates/lagom2/assets/fonts/lagom-medium-icons.ttf',
    '/templates/lagom2/assets/fonts/lagom-small-icons.ttf',
    '/templates/lagom2/assets/fonts/lagom-medium-icons.eot',
    '/templates/lagom2/assets/fonts/lagom-small-icons.eot',
    '/templates/lagom2/assets/fonts/lagom-medium-icons.svg',
    '/templates/lagom2/assets/fonts/lagom-small-icons.svg',
    '/modules/addons/supportpin/assets/css/bootstrap-pincode-input.css',
];

(async () => {
    for (const a of assets) {
        try {
            await download(base + a, localBase + a.replace(/\?[^/]*$/, ''));
        } catch (e) {
            console.error(`Failed: ${a} — ${e.message}`);
        }
    }
    console.log('Done!');
})();
