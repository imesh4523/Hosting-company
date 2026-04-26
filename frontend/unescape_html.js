const fs = require('fs');
const path = require('path');

const filename = process.argv[2] || 'html.txt';
const inputPath = filename.includes(':') ? filename : path.join('C:\\Users\\azureuser\\Desktop', filename);
const baseName = path.basename(filename, path.extname(filename));
const outputPath = `C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\public\\${baseName}-static.html`;

console.log(`Processing ${inputPath} -> ${outputPath}`);

let content = fs.readFileSync(inputPath, 'utf8');

// The file seems to be a string dump from a browser console or similar
// where newlines are literal \n and tabs are literal \t.
// We need to decode these.

function decodeString(str) {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\x3C/g, '<')
        .replace(/\\x3E/g, '>')
        .replace(/\\x26/g, '&')
        .replace(/\\\\/g, '\\');
}

content = decodeString(content);

// If the content is still wrapped in quotes or backticks, remove them
content = content.trim();
if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'")) || (content.startsWith('`') && content.endsWith('`'))) {
    content = content.slice(1, -1);
    // Decode again because it might have been double escaped
    content = decodeString(content);
}

// Fix paths to absolute UltaHost URLs for assets we don't have locally
const baseUrl = 'https://bill.ultahost.com';
content = content.replace(/(href|src|url)\s*=\s*["']\//g, (match) => {
    return match.slice(0, -1) + baseUrl + '/';
});

// Intercept dashboard links
content = content.replace(/https:\/\/bill\.ultahost\.com\/clientarea\.php\?action=domains/g, '/dashboard/domains');
content = content.replace(/https:\/\/bill\.ultahost\.com\/clientarea\.php\?action=services/g, '/dashboard/services');
content = content.replace(/https:\/\/bill\.ultahost\.com\/clientarea\.php/g, '/dashboard');
content = content.replace(/https:\/\/bill\.ultahost\.com/g, '/dashboard');
content = content.replace(/https:\/\/ultahost\.com/g, 'http://localhost:3001');
content = content.replace(/href="[^"]*clientarea\.php"/g, 'href="http://localhost:3000/dashboard"');
content = content.replace(/href="[^"]*index\.php"/g, 'href="/dashboard"');

// Add custom CSS overrides and local assets
const styleOverrides = `
    <!-- Local Assets -->
    <link rel="stylesheet" href="/css/dashboard/vars.css">
    <link rel="stylesheet" href="/css/dashboard/theme.css">
    <link rel="stylesheet" href="/css/dashboard/custom.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        body { 
            background-color: #fdfdfd !important; 
            margin: 0; 
            padding: 0; 
            font-family: 'Poppins', sans-serif !important; 
            overflow-x: hidden; 
        }
        .app-nav .logo img { height: 32px !important; display: block !important; }
        /* Force visibility and fix colors */
        .app-main, .main-body, .main-grid { 
            opacity: 1 !important; 
            visibility: visible !important; 
            display: flex !important; 
        }
        #Promotion, .promo-slider { display: none !important; }
        .app-nav-header, .app-header, #header { 
            background: #fff !important; 
            color: #444 !important;
            border-bottom: 1px solid #eee !important;
        }
        .top-nav li a { color: #444 !important; }
        .modal-backdrop { display: none !important; }
    </style>
    <script src="/js/dashboard/core.js"></script>
    <script src="/js/dashboard/scripts.js"></script>
`;

// Inject into head
if (content.includes('</head>')) {
    content = content.replace('</head>', `${styleOverrides}</head>`);
} else {
    content = `<html><head>${styleOverrides}</head><body>${content}</body></html>`;
}

fs.writeFileSync(outputPath, content);
console.log('Successfully processed dashboard HTML with deep unescaping.');
