import fs from 'fs';
import path from 'path';

const fragmentsPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let content = fs.readFileSync(fragmentsPath, 'utf8');

// Normalize URLs in all fragments
// 1. Make all bill.ultahost.com links relative
content = content.replace(/https:\/\/bill\.ultahost\.com/g, '');

// 2. Fix Sidebar Links to point to our Next.js routes
// We use a map of PHP patterns to our Next.js routes
const mappings = [
    { from: /clientarea\.php\?action=invoices/g, to: '/dashboard/billing/invoices' },
    { from: /clientarea\.php\?action=quotes/g, to: '/dashboard/billing/quotes' },
    { from: /clientarea\.php\?action=addfunds/g, to: '/dashboard/billing/addfunds' },
    { from: /clientarea\.php\?action=masspay/g, to: '/dashboard/billing/masspay' },
    { from: /clientarea\.php\?action=services/g, to: '/dashboard/services' },
    { from: /clientarea\.php\?action=domains/g, to: '/dashboard/domains' },
    { from: /clientarea\.php\?action=details/g, to: '/dashboard/details' },
    { from: /affiliates\.php/g, to: '/dashboard/affiliates' },
    { from: /knowledgebase\.php/g, to: '/dashboard/kb' },
    { from: /announcements\.php/g, to: '/dashboard/announcements' },
    { from: /serverstatus\.php/g, to: '/dashboard/serverstatus' },
    { from: /downloads\.php/g, to: '/dashboard/downloads' },
    { from: /supporttickets\.php/g, to: '/dashboard/tickets' },
    { from: /clientarea\.php/g, to: '/dashboard' }
];

mappings.forEach(m => {
    content = content.replace(m.from, m.to);
});

// 3. Ensure App Deploy is present in the nav
const appDeployLink = `
            <li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy">
                            <a href="/dashboard/app-deploy">
                                            <i class="fab fa-test fas fa-cloud-upload-alt"></i>
                                                                <span class="item-text">App Deploy</span>
                                                                            </a>
                                            </li>
`;
if (!content.includes('Primary_Navbar-App_Deploy')) {
    content = content.replace(/(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/, `$1${appDeployLink}`);
}

// 4. Template variables
content = content.replace(/Romania Srilanka/g, '{userName}');

fs.writeFileSync(fragmentsPath, content);
console.log('Fragments re-fixed for all links.');
