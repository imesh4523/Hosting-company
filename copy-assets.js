const fs = require('fs');
const path = require('path');

const srcDir = 'C:/My Web Sites/host/youuhost.com';
const destDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        // If it's a file, copy it.
        // But do NOT overwrite .html files in the root of destDir
        if (dest.endsWith('.html') && path.dirname(dest) === path.normalize(destDir)) {
            if (fs.existsSync(dest)) {
                return; // Skip existing HTML files in root
            }
        }

        fs.copyFileSync(src, dest);
    }
}

copyRecursiveSync(srcDir, destDir);
console.log('Copy complete!');
