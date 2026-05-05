import fs from 'fs';
import path from 'path';

const fragmentsPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let content = fs.readFileSync(fragmentsPath, 'utf8');

// 1. Inject App Deploy link
const appDeployLink = `
            <li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy">
                            <a href="/dashboard/app-deploy">
                                            <i class="fab fa-test fas fa-cloud-upload-alt"></i>
                                                                <span class="item-text">App Deploy</span>
                                                                            </a>
                                            </li>
`;
content = content.replace(/(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/, `$1${appDeployLink}`);

// 2. Fix PHP links and absolute paths
content = content.replace(/https:\/\/bill\.youuhost\.com/g, '');
content = content.replace(/href="clientarea\.php\?action=([^"]+)"/g, (match, action) => {
    if (action === 'invoices' || action === 'quotes' || action === 'addfunds' || action === 'masspay') {
        return `href="/dashboard/billing/${action}"`;
    }
    return `href="/dashboard/${action}"`;
});
content = content.replace(/href="clientarea\.php"/g, 'href="/dashboard"');
content = content.replace(/href="index\.php\?m=([^"]+)"/g, 'href="/dashboard/modules/$1"');

// 3. User name template
content = content.replace(/Romania Srilanka/g, '{userName}');

fs.writeFileSync(fragmentsPath, content);
console.log('Final fixes applied to all fragments.');
