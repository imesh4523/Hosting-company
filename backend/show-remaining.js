import fs from 'fs';

const p = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let c = fs.readFileSync(p, 'utf8');

// Show all remaining //dashboard occurrences with context
let idx = 0;
let count = 0;
while ((idx = c.indexOf('//dashboard', idx)) !== -1 && count < 20) {
    console.log(`[${++count}] ...${c.substring(Math.max(0, idx-40), idx+80)}...`);
    idx++;
}
