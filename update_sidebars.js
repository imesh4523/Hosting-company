import fs from 'fs';
import path from 'path';

const dir = 'frontend/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const menuItem = `
                    <li menuitemname="App Deploy" class="dropdown" id="Primary_Navbar-App_Deploy">
                        <a class="dropdown-toggle" href="#" data-toggle="dropdown">
                            <i class="fab fa-test fas fa-rocket"></i>
                            <span class="item-text">App Deploy</span>
                            <b class="fas fa-caret-down"></b> </a>
                        <ul class="dropdown-menu has-scroll">
                            <li class="dropdown-header">App Platform</li>
                            <li menuitemname="Deploy New App" id="Primary_Navbar-App_Deploy-Deploy_New">
                                <a href="/dashboard/app-deploy" target="_top">
                                    <i class="fas fa-plus-circle"></i>
                                    Deploy New App
                                </a>
                            </li>
                            <li menuitemname="My Apps" id="Primary_Navbar-App_Deploy-My_Apps">
                                <a href="/dashboard/apps" target="_top">
                                    <i class="fas fa-list"></i>
                                    My Apps
                                </a>
                            </li>
                        </ul>
                    </li>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // If it already has it, replace it to update links
    if (content.includes('id="Primary_Navbar-App_Deploy"')) {
        console.log(`Updating links in ${file}...`);
        content = content.replace(/<li menuitemname="App Deploy"[\s\S]*?<\/li>/, menuItem);
        fs.writeFileSync(filePath, content);
    } else if (content.includes('id="Primary_Navbar-Website_&amp;_Security"')) {
        console.log(`Adding to ${file}...`);
        content = content.replace(/<\/li>\s*<li menuitemname="Support"/, `</li>${menuItem}\n                    <li menuitemname="Support"`);
        if (!content.includes('id="Primary_Navbar-App_Deploy"')) {
             content = content.replace(/(id="Primary_Navbar-Website_&amp;_Security">[\s\S]*?<\/li>)/, `$1${menuItem}`);
        }
        fs.writeFileSync(filePath, content);
    }
});
