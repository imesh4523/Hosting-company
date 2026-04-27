const fs = require('fs');
const path = require('path');

const publicDir = './frontend/public';
const templatePath = path.join(publicDir, 'dashboard-static.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

// The marker where we will inject content
const splitRegex = /(<div class="main-content[^>]*>)([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="main-footer">/i;
// Wait, a better way to replace main-content is using string splitting at a known point.
// Let's find exactly what's inside main-content in dashboard-static.html
const mainContentRegex = /(<div class="main-content\s*">\s*)[\s\S]*?(?=\s*<div class="main-footer">)/i;

// Actually, we can just split by `<div class="main-content  ">` and then `</div>` is too hard to find.
// Let's use a simpler regex based on my previous find-container.js:
const templateParts = templateHtml.split(/<div class="main-content\s*">/);
if (templateParts.length !== 2) {
    console.error('Failed to split template');
    process.exit(1);
}

const headerPart = templateParts[0] + '<div class="main-content  ">\n<div class="container-fluid" style="padding: 20px;">\n';
// Find the end of main-content. Let's split by main-footer
const footerParts = templateParts[1].split(/<div class="main-footer">/);
const footerPart = '\n</div>\n</div>\n<div class="main-footer">' + footerParts.slice(1).join('<div class="main-footer">');

const pagesToProcess = [
    'account-details-static.html',
    'account-security-static.html',
    'contacts-static.html',
    'user-management-static.html',
    'email-history-static.html',
    'change-password-static.html',
    'payment-methods-static.html'
];

pagesToProcess.forEach(file => {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) return;
    
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Extract everything inside <div class="content-area">
    const contentMatch = html.match(/<div class="content-area">([\s\S]*?)<\/div>\s*<\/div>\s*(<div class="chat-fab"|<script>|<\/body>)/i);
    let innerContent = '';
    
    if (contentMatch) {
        innerContent = contentMatch[1];
    } else {
        // Fallback: just take the body
        const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);
        innerContent = bodyMatch ? bodyMatch[1] : '';
    }
    
    // Also extract scripts specific to this page
    const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
    let scriptsToInject = '';
    scriptMatches.forEach(match => {
        if (!match[1].includes('const routeMap = {') && !match[1].includes('document.querySelectorAll')) {
            scriptsToInject += '\n<script>' + match[1] + '</script>\n';
        }
    });

    const newHtml = headerPart + innerContent + footerPart.replace('</body>', scriptsToInject + '\n</body>');
    fs.writeFileSync(filePath, newHtml, 'utf8');
    console.log('Rebuilt:', file);
});
