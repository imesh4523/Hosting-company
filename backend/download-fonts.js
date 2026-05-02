import fs from 'fs';
import path from 'path';
import https from 'https';

const publicDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\public\\ultahost-assets';

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
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

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

(async () => {
    try {
        const cssFiles = getAllFiles(publicDir).filter(f => f.endsWith('.css'));
        console.log(`Scanning ${cssFiles.length} CSS files for fonts...`);

        const fontUrls = new Set();

        for (const cssFile of cssFiles) {
            const content = fs.readFileSync(cssFile, 'utf8');
            const regex = /url\(['"]?([^'")]+\.(woff2?|ttf|eot|svg))['"]?\)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                let fontPath = match[1];
                if (fontPath.startsWith('data:')) continue;

                // Resolve relative path
                let absoluteUrl;
                if (fontPath.startsWith('http')) {
                    absoluteUrl = fontPath;
                } else {
                    // It's relative to the CSS file's location on the original server
                    // We need to know the original base URL of this CSS file.
                    // From assets-list.json, we know where they came from.
                    // But for simplicity, we can assume they are all from bill.ultahost.com
                    const cssRelativePath = path.relative(publicDir, cssFile).replace(/\\/g, '/');
                    const originalCssUrl = `https://bill.ultahost.com/${cssRelativePath}`;
                    absoluteUrl = new URL(fontPath, originalCssUrl).href;
                }
                fontUrls.add(absoluteUrl);
            }
        }

        console.log(`Found ${fontUrls.size} fonts to download.`);

        for (const url of fontUrls) {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname !== 'bill.ultahost.com') continue;

            const relativePath = parsedUrl.pathname.replace(/^\/+/, '');
            const localDest = path.join(publicDir, relativePath);
            
            ensureDir(path.dirname(localDest));
            console.log(`Downloading font: ${url} -> ${localDest}`);
            try {
                await download(url, localDest);
            } catch (e) {
                console.error(`Failed to download ${url}: ${e.message}`);
            }
        }

        console.log('Finished downloading fonts.');
    } catch (err) {
        console.error(err);
    }
})();
