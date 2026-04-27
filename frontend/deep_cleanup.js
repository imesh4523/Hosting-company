const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function cleanupFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the "Client Area" / login links to point to local login page on port 3000
    content = content.replace(/href="[^"]*login[^"]*"/ig, 'href="http://localhost:3000/login"');
    content = content.replace(/href="[^"]*clientarea\.php[^"]*"/ig, 'href="http://localhost:3000/login"');
    content = content.replace(/\/dashboard\/index\.php\/login\?language=english/ig, 'http://localhost:3000/login');
    content = content.replace(/https:\/\/bill\.ultahost\.com\/index\.php\/login\?language=english/ig, 'http://localhost:3000/login');
    
    // Convert relative dashboard links to absolute port 3000 links
    content = content.replace(/href="\/dashboard\//ig, 'href="http://localhost:3000/dashboard/');
    content = content.replace(/href="\/dashboard"/ig, 'href="http://localhost:3000/dashboard"');
    
    // For files that are NOT the dashboard itself, any link to the dashboard should go through login
    if (!filePath.includes('dashboard-static.html') && !filePath.includes('domains-static.html')) {
        content = content.replace(/href="http:\/\/localhost:3000\/dashboard"/ig, 'href="http://localhost:3000/login"');
    }
    
    // Replace URL encoded ones
    content = content.replace(/https%3A%2F%2Fbill\.ultahost\.com/g, 'http://localhost:3000');
    content = content.replace(/bill\.ultahost\.com/g, 'localhost:3000');
    
    // Replace remaining ultahost.com
    content = content.replace(/https:\/\/ultahost\.com/g, 'http://localhost:3001');
    content = content.replace(/ultahost\.com/gi, 'localhost:3001');
    
    fs.writeFileSync(filePath, content);
    console.log(`Deep cleaned up ${filePath}`);
}

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
files.forEach(f => cleanupFile(path.join(publicDir, f)));
