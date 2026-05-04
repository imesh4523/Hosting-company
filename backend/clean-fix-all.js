import fs from 'fs';
import path from 'path';

// Step 1: Regenerate fragments.ts fresh from the raw HTML files
const fragmentsDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';
const outputPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';

const files = fs.readdirSync(fragmentsDir).filter(f => f.endsWith('.html'));
let content = '';
files.forEach(f => {
    const name = f.split('.')[0].replace(/-/g, '_') + 'Fragment';
    const html = fs.readFileSync(path.join(fragmentsDir, f), 'utf8');
    content += `export const ${name} = ${JSON.stringify(html)};\n`;
});

fs.writeFileSync(outputPath, content);
console.log('Step 1: Fresh fragments.ts generated.');

// Step 2: Now apply clean link fixes (only using relative /dashboard/... paths)
let frag = fs.readFileSync(outputPath, 'utf8');

// Remove absolute URLs that were incorrectly added before
frag = frag.replace(/http:\/\/localhost:3000/g, '');
frag = frag.replace(/https:\/\/bill\.ultahost\.com/g, '');

// Fix protocol-relative URLs like //dashboard -> /dashboard
frag = frag.replace(/href="\/\/dashboard/g, 'href="/dashboard');

// Fix PHP action-based links -> Next.js routes
const actionMappings = [
    [/clientarea\.php\?action=invoices/g, '/dashboard/billing/invoices'],
    [/clientarea\.php\?action=quotes/g, '/dashboard/billing/quotes'],
    [/clientarea\.php\?action=addfunds/g, '/dashboard/billing/addfunds'],
    [/clientarea\.php\?action=masspay/g, '/dashboard/billing/masspay'],
    [/clientarea\.php\?action=services/g, '/dashboard/services'],
    [/clientarea\.php\?action=domains/g, '/dashboard/domains'],
    [/clientarea\.php\?action=details/g, '/dashboard/account/details'],
    [/clientarea\.php\?action=contacts/g, '/dashboard/account/contacts'],
    [/clientarea\.php\?action=emails/g, '/dashboard/account/emails'],
    [/clientarea\.php\?action=users/g, '/dashboard/account/users'],
    [/clientarea\.php\?action=paymentmethods/g, '/dashboard/account/paymentmethods'],
    [/clientarea\.php\?action=announcements/g, '/dashboard/announcements'],
    [/clientarea\.php/g, '/dashboard'],
];
actionMappings.forEach(([from, to]) => { frag = frag.replace(from, to); });

// Fix PHP file-based links
const phpMappings = [
    [/href="affiliates\.php"/g, 'href="/dashboard/affiliates"'],
    [/href="knowledgebase\.php"/g, 'href="/dashboard/kb"'],
    [/href="announcements\.php"/g, 'href="/dashboard/announcements"'],
    [/href="serverstatus\.php"/g, 'href="/dashboard/serverstatus"'],
    [/href="downloads\.php"/g, 'href="/dashboard/downloads"'],
    [/href="supporttickets\.php"/g, 'href="/dashboard/tickets"'],
    [/href="submitticket\.php"/g, 'href="/dashboard/tickets/new"'],
    [/href="download\.php"/g, 'href="/dashboard/downloads"'],
];
phpMappings.forEach(([from, to]) => { frag = frag.replace(from, to); });

// Fix store links -> redirect to ultahost.com store
const storeLinks = [
    'ssl-certificaties', 'codeguard', 'marketgoo', 'sitelock', 'ultasecurity',
    'shared-hosting', 'windows-shared-hosting', 'linux-vps-hosting', 'linux-vds-hosting',
    'windows-vps-hosting', 'windows-vds-hosting', 'macos-vps-hosting', 'macos-vds-hosting',
    'bluestacks-android-vps', 'dedicated-hosting', 'wordpress-hosting', 'email-hosting',
    'server-support-service', 'other-products'
];
storeLinks.forEach(slug => {
    const typoFixed = slug.replace('ssl-certificaties', 'ssl-certificates');
    frag = frag.replace(new RegExp(`href="/store/${slug}"`, 'g'), `href="https://ultahost.com/${typoFixed}"`);
});

// Fix cart.php links -> redirect to ultahost.com
frag = frag.replace(/href="cart\.php[^"]*"/g, 'href="https://ultahost.com/cart"');
frag = frag.replace(/href="\/cart[^"]*"/g, 'href="https://ultahost.com/cart"');

// Fix index.php module links
frag = frag.replace(/href="index\.php\?m=DNSManager3"/g, 'href="/dashboard/domains/dns"');
frag = frag.replace(/href="index\.php\?m=([^"]+)"/g, 'href="/dashboard/modules/$1"');

// Fix account paymentmethods
frag = frag.replace(/href="\/account\/paymentmethods"/g, 'href="/dashboard/account/paymentmethods"');

// Fix /clientarea/ssl-certificates/manage
frag = frag.replace(/href="\/clientarea\/ssl-certificates\/manage"/g, 'href="https://ultahost.com/ssl-certificates"');

// Fix logout
frag = frag.replace(/href="\/logout\.php"/g, 'href="/api/auth/logout"');

// App Deploy - ensure it's in nav (inject after Dashboard item)
const appDeployLink = `\\n            <li menuitemname=\\"App Deploy\\" class=\\"\\" id=\\"Primary_Navbar-App_Deploy\\">\\n                            <a href=\\"/dashboard/app-deploy\\">\\n                                            <i class=\\"fab fa-github\\"></i>\\n                                                                <span class=\\"item-text\\">App Deploy<\\/span>\\n                                                                            <\\/a>\\n                                            <\\/li>`;
if (!frag.includes('Primary_Navbar-App_Deploy')) {
    frag = frag.replace(/(Primary_Navbar-Dashboard[^}]*<\/li>)/, `$1${appDeployLink}`);
}

// Replace username placeholder
frag = frag.replace(/Romania Srilanka/g, '{userName}');

fs.writeFileSync(outputPath, frag);
console.log('Step 2: All links fixed cleanly. Done!');

