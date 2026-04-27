const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function findLinks(fileName) {
    const filePath = path.join(publicDir, fileName);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /href="([^"]*)"/g;
    let match;
    console.log(`--- Links in ${fileName} ---`);
    while ((match = regex.exec(content)) !== null) {
        const link = match[1];
        if (link.includes('login') || link.includes('dashboard') || link.includes('clientarea')) {
            console.log(link);
        }
    }
}

findLinks('index.html');
findLinks('dashboard-static.html');
