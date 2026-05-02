import fs from 'fs';
import path from 'path';

const fragmentsPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let content = fs.readFileSync(fragmentsPath, 'utf8');

// 1. App Deploy Link
const appDeployLink = `
            <li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy">
                            <a href="/dashboard/app-deploy">
                                            <i class="fab fa-test fas fa-cloud-upload-alt"></i>
                                                                <span class="item-text">App Deploy</span>
                                                                            </a>
                                            </li>
`;
content = content.replace(/(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/, `$1${appDeployLink}`);

// 2. Link Mappings
content = content.replace(/https:\/\/bill\.ultahost\.com/g, '');

// Actions
content = content.replace(/href="clientarea\.php\?action=([^"]+)"/g, (match, action) => {
    const billingActions = ['addfunds', 'masspay', 'invoices', 'quotes', 'credits'];
    if (billingActions.includes(action)) return `href="/dashboard/billing/${action}"`;
    return `href="/dashboard/${action}"`;
});

// PHP files
const phpMap = {
    'affiliates.php': '/dashboard/affiliates',
    'knowledgebase.php': '/dashboard/kb',
    'announcements.php': '/dashboard/announcements',
    'serverstatus.php': '/dashboard/serverstatus',
    'downloads.php': '/dashboard/downloads',
    'supporttickets.php': '/dashboard/tickets',
    'clientarea.php': '/dashboard'
};

for (const [php, next] of Object.entries(phpMap)) {
    const regex = new RegExp(`href="${php}"`, 'g');
    content = content.replace(regex, `href="${next}"`);
}

// 3. Template Vars
content = content.replace(/Romania Srilanka/g, '{userName}');

fs.writeFileSync(fragmentsPath, content);
console.log('Hyper-fix applied to fragments.');
