const fs = require('fs');
const path = require('path');

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
            if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.json')) results.push(file);
        }
    });
    return results;
}

const targetFiles = walk(publicDir);

targetFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/https?:\/\/(www\.|bill\.)?youuhost\.com/gi, '');
    content = content.replace(/youuhost\.com/gi, 'localhost:3000');
    content = content.replace(/youuhost/g, 'Hosting Company');
    content = content.replace(/youuhost/gi, 'hostingcompany');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
    }
});

console.log(`Processed ${targetFiles.length} JS/CSS/JSON files.`);
