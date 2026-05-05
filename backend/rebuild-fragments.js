import fs from 'fs';
import path from 'path';

const fragmentsDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';
const outputPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';

// Step 1: Regenerate clean from raw HTML files
const files = fs.readdirSync(fragmentsDir).filter(f => f.endsWith('.html'));
let tsContent = '';
files.forEach(f => {
    const name = f.split('.')[0].replace(/-/g, '_') + 'Fragment';
    let html = fs.readFileSync(path.join(fragmentsDir, f), 'utf8');

    // Fix links AT THE HTML LEVEL before embedding in TS
    // Remove absolute domains
    html = html.replace(/https:\/\/bill\.youuhost\.com/g, '');

    // Fix PHP action links
    html = html.replace(/clientarea\.php\?action=invoices/g, '/dashboard/billing/invoices');
    html = html.replace(/clientarea\.php\?action=quotes/g, '/dashboard/billing/quotes');
    html = html.replace(/clientarea\.php\?action=addfunds/g, '/dashboard/billing/addfunds');
    html = html.replace(/clientarea\.php\?action=masspay/g, '/dashboard/billing/masspay');
    html = html.replace(/clientarea\.php\?action=services/g, '/dashboard/services');
    html = html.replace(/clientarea\.php\?action=domains/g, '/dashboard/domains');
    html = html.replace(/clientarea\.php\?action=details/g, '/dashboard/account/details');
    html = html.replace(/clientarea\.php\?action=contacts/g, '/dashboard/account/contacts');
    html = html.replace(/clientarea\.php\?action=emails/g, '/dashboard/account/emails');
    html = html.replace(/clientarea\.php\?action=paymentmethods/g, '/dashboard/account/paymentmethods');
    html = html.replace(/clientarea\.php\?action=users/g, '/dashboard/account/users');
    html = html.replace(/clientarea\.php/g, '/dashboard');

    // Fix PHP file links
    html = html.replace(/href="affiliates\.php"/g, 'href="/dashboard/affiliates"');
    html = html.replace(/href="knowledgebase\.php"/g, 'href="/dashboard/kb"');
    html = html.replace(/href="announcements\.php"/g, 'href="/dashboard/announcements"');
    html = html.replace(/href="serverstatus\.php"/g, 'href="/dashboard/serverstatus"');
    html = html.replace(/href="downloads\.php"/g, 'href="/dashboard/downloads"');
    html = html.replace(/href="supporttickets\.php"/g, 'href="/dashboard/tickets"');
    html = html.replace(/href="submitticket\.php"/g, 'href="/dashboard/tickets/new"');

    // Fix logout
    html = html.replace(/href="\/logout\.php"/g, 'href="/api/auth/logout"');

    // Fix Cart
    html = html.replace(/href="cart\.php[^"]*"/g, 'href="https://youuhost.com/cart"');

    // Username
    html = html.replace(/Romania Srilanka/g, '{userName}');

    tsContent += `export const ${name} = ${JSON.stringify(html)};\n`;
});

// Inject App Deploy into navFragment
const appDeployItem = '<li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy"><a href="/dashboard/app-deploy"><i class="fas fa-rocket"></i><span class="item-text">App Deploy</span></a></li>';
tsContent = tsContent.replace(/(Primary_Navbar-Dashboard[^<]*<\/li>)/, `$1${appDeployItem}`);

fs.writeFileSync(outputPath, tsContent);

// Verify: check if //dashboard exists in output
if (tsContent.includes('href=\\"//dashboard')) {
    console.log('WARNING: //dashboard protocol-relative URLs still found!');
} else {
    console.log('OK: No //dashboard protocol-relative URLs found.');
}

console.log(`Generated ${files.length} fragments to fragments.ts`);
console.log('Done!');
