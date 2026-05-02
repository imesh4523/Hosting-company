import fs from 'fs';

const p = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let c = fs.readFileSync(p, 'utf8');

// These are theme switcher links like //dashboard?rsstyle=futuristic
// They appear in the header style switcher - just remove them or point to #
// Replace //dashboard?rsstyle=... with #
c = c.replace(/href=\\"\/\/dashboard\?rsstyle=[^"\\]+\\"/g, 'href=\\"#\\"');
// Also replace //dashboard?language=... with #
c = c.replace(/href=\\"\/\/dashboard\?language=[^"\\]+\\"/g, 'href=\\"#\\"');
// Replace any remaining //dashboard with /dashboard
c = c.replace(/href=\\"\/\/dashboard/g, 'href=\\"/dashboard');

// Verify count after
const remaining = (c.match(/\/\/dashboard/g) || []).length;
console.log(`Remaining //dashboard occurrences: ${remaining}`);

fs.writeFileSync(p, c);
console.log('Fixed all //dashboard protocol-relative URLs.');
