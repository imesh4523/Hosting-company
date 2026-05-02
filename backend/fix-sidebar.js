import fs from 'fs';
import path from 'path';

const fragmentsPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let content = fs.readFileSync(fragmentsPath, 'utf8');

// 1. Inject App Deploy link in the sidebar
const appDeployLink = `
            <li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy">
                            <a href="/dashboard/app-deploy">
                                            <i class="fab fa-test fas fa-cloud-upload-alt"></i>
                                                                <span class="item-text">App Deploy</span>
                                                                            </a>
                                            </li>
`;

// Insert after Dashboard link
content = content.replace(/(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/, `$1${appDeployLink}`);

// 2. Fix PHP links to Next.js routes
const linkMap = {
    'clientarea.php\\?action=invoices': '/dashboard/billing/invoices',
    'clientarea.php\\?action=quotes': '/dashboard/billing/quotes',
    'clientarea.php\\?action=services': '/dashboard/services',
    'clientarea.php\\?action=domains': '/dashboard/domains',
    'clientarea.php': '/dashboard',
};

for (const [php, next] of Object.entries(linkMap)) {
    const regex = new RegExp(php, 'g');
    content = content.replace(regex, next);
}

// 3. Fix Romania Srilanka -> {userName}
content = content.replace(/Romania Srilanka/g, '{userName}');

fs.writeFileSync(fragmentsPath, content);
console.log('Sidebar links fixed and App Deploy injected.');
