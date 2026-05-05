const fs = require('fs');
const path = require('path');

const publicDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';

function renameRecursively(dir) {
    const list = fs.readdirSync(dir);

    // First rename children
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            renameRecursively(fullPath);
        }
    });

    // Then rename current level items
    const updatedList = fs.readdirSync(dir);
    updatedList.forEach(file => {
        if (file.toLowerCase().includes('youuhost')) {
            const oldPath = path.join(dir, file);
            // Replace case-insensitively, keeping the lowercase output since URLs are usually lowercase
            const newName = file.replace(/youuhost/gi, 'hostingcompany');
            const newPath = path.join(dir, newName);
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed: ${file} -> ${newName}`);
        }
    });
}

renameRecursively(publicDir);
console.log("Renaming complete.");
