import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

function getAllPages(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllPages(filePath, fileList);
        } else if (file === 'page.tsx' && filePath !== path.join(baseDir, 'page.tsx')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const pages = getAllPages(baseDir);
console.log(`Found ${pages.length} subpages to fix.`);

pages.forEach(p => {
    let content = fs.readFileSync(p, 'utf8');
    // Replace relative fragments import with alias
    content = content.replace(/from\s+['"]\.\.?\/[^'"]*fragments['"]/g, "from '@/app/dashboard/fragments'");
    fs.writeFileSync(p, content);
    console.log(`Fixed: ${p}`);
});
