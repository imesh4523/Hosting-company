import fs from 'fs';
import path from 'path';

const fragFile = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let content = fs.readFileSync(fragFile, 'utf8');

// Ensure all dashboard links are absolute with the full localhost URL
// This prevents relative URL issues in the browser
content = content.replace(/href="\/dashboard/g, 'href="http://localhost:3000/dashboard');

fs.writeFileSync(fragFile, content);
console.log('Links updated to absolute localhost URLs.');
