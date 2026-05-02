import fs from 'fs';
import path from 'path';

const fragmentsPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let content = fs.readFileSync(fragmentsPath, 'utf8');

// 1. Fix all links to be absolute and point to our dashboard routes
// Match clientarea.php with various actions
content = content.replace(/href="clientarea\.php\?action=([^"]+)"/g, (match, action) => {
    if (action === 'invoices' || action === 'quotes' || action === 'addfunds' || action === 'masspay') {
        return `href="/dashboard/billing/${action}"`;
    }
    return `href="/dashboard/${action}"`;
});

// Match index.php links
content = content.replace(/href="index\.php\?m=([^"]+)"/g, 'href="/dashboard/modules/$1"');

// Match base clientarea.php
content = content.replace(/href="clientarea\.php"/g, 'href="/dashboard"');

// Ensure all other relative links in the fragments start with /
// (This is tricky but we can target specific ones if needed)

// 2. Fix the specific "Add Funds" etc. in Billing
// The previous regex should have caught them, but let's be sure.

fs.writeFileSync(fragmentsPath, content);
console.log('Sidebar links fixed with absolute paths.');
