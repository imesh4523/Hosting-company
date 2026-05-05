const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function cleanupFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace all billing links with local dashboard
    content = content.replace(/https:\/\/bill\.youuhost\.com\/clientarea\.php\?action=domains/g, '/dashboard/domains');
    content = content.replace(/https:\/\/bill\.youuhost\.com\/clientarea\.php\?action=services/g, '/dashboard/services');
    content = content.replace(/https:\/\/bill\.youuhost\.com\/clientarea\.php/g, '/dashboard');
    content = content.replace(/https:\/\/bill\.youuhost\.com/g, '/dashboard');

    // Replace all main site links with local landing page
    content = content.replace(/https:\/\/youuhost\.com/g, 'http://localhost:3001');

    // Fix "Client Area" buttons specifically
    content = content.replace(/href="[^"]*clientarea\.php"/g, 'href="http://localhost:3000/dashboard"');

    fs.writeFileSync(filePath, content);
    console.log(`Cleaned up ${filePath}`);
}

// Get all HTML files
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
files.forEach(f => cleanupFile(path.join(publicDir, f)));
