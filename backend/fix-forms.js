import fs from 'fs';

const p = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let c = fs.readFileSync(p, 'utf8');

// Fix form action="//dashboard/..." -> action="/dashboard/..."
c = c.replace(/action=\\"\/\/dashboard/g, 'action=\\"/dashboard');
// Fix value="//dashboard/..." in hidden inputs
c = c.replace(/value=\\"\/\/dashboard/g, 'value=\\"/dashboard');
// Fix /youuhost-assets//dashboard -> /youuhost-assets removed, just #
c = c.replace(/href=\\"\/youuhost-assets\/\/dashboard[^"\\]*\\"/g, 'href=\\"#\\"');

const remaining = (c.match(/\/\/dashboard/g) || []).length;
console.log(`Remaining //dashboard: ${remaining}`);

fs.writeFileSync(p, c);
console.log('All fixed!');
