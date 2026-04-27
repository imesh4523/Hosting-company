const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function findLinksInAll() {
    const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
    
    files.forEach(fileName => {
        const filePath = path.join(publicDir, fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        const regex = /href="([^"]*)"/g;
        let match;
        let found = false;
        
        while ((match = regex.exec(content)) !== null) {
            const link = match[1];
            if (link === '/login' || link === 'login' || link === '/dashboard/index.php/login') {
                if (!found) {
                    console.log(`--- Bad Login Links in ${fileName} ---`);
                    found = true;
                }
                console.log(link);
            }
        }
    });
}

findLinksInAll();
