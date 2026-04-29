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
    
    // 1. Clean up any existing broken App Deploy blocks
    content = content.replace(/<li menuitemname="App Deploy"[\s\S]*?<\/li>/g, '');
    // Also remove the stray list items that were accidentally injected
    content = content.replace(/<li menuitemname="Deploy New App" id="Primary_Navbar-App_Deploy-Deploy_New"[\s\S]*?<\/li>/g, '');
    content = content.replace(/<li menuitemname="My Apps" id="Primary_Navbar-App_Deploy-My_Apps"[\s\S]*?<\/li>/g, '');
    
    // 2. Inject fresh and neat App Deploy section after Website & Security
    const anchor = 'id="Primary_Navbar-Website_&amp;_Security"';
    if (content.includes(anchor)) {
        console.log(`Injecting neat sidebar to ${file}...`);
        
        // Find the end of the Website & Security </li>
        const parts = content.split(anchor);
        const secondPart = parts[1];
        const closingLiIndex = secondPart.indexOf('</li>') + 5;
        
        const before = parts[0] + anchor + secondPart.substring(0, closingLiIndex);
        const after = secondPart.substring(closingLiIndex);
        
        content = before + "\n" + menuItem + after;
        
        fs.writeFileSync(filePath, content);
    }
});

console.log("Sidebar cleanup and injection complete.");
