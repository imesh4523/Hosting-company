const fs = require('fs');
const files = ['announcements.html', 'serverstatus.html', 'download.html', 'knowledgebase.html', 'contact.html'];

files.forEach(file => {
    const filePath = `c:/Users/azureuser/Desktop/Hosting site/frontend/public/${file}`;
    if (!fs.existsSync(filePath)) return;
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Fix relative paths for assets
    html = html.replace(/href="(\/(assets|templates|modules|css)\/)/g, 'href="$1');
    html = html.replace(/src="(\/(assets|templates|modules|js|img)\/)/g, 'src="$1');
    
    // Inject our router.js before </body>
    const routerScript = `
    <script src="/js/router.js"></script>
    <style>
        /* Fix for absolute positioned elements or overlaps if any */
        .app-nav { position: sticky !important; top: 0; z-index: 1000; }
        /* Hide real login/register buttons if needed, or keep them */
    </style>
    `;
    html = html.replace('</body>', `${routerScript}</body>`);
    
    fs.writeFileSync(filePath, html);
    console.log(`Fixed assets for ${file}`);
});
