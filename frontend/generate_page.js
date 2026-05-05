const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'public', 'dashboard-static.html');
let template = fs.readFileSync(templatePath, 'utf8');

function generatePage(pageName, title, breadcrumb, contentHtml) {
    let page = template;

    // Replace Title
    page = page.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, `<h1>${title}</h1>`);

    // Replace Breadcrumb
    page = page.replace(/<ol class="breadcrumb">[\s\S]*?<\/ol>/, `
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/dashboard">Portal Home</a></li>
            <li class="breadcrumb-item"><a href="/dashboard">Client Area</a></li>
            <li class="breadcrumb-item active">${breadcrumb}</li>
        </ol>
    `);

    // Replace Main Content Area
    // The main content area in the Lagom theme is usually inside .main-content .main-body or .main-grid
    // We'll replace the entire .main-grid content for simplicity
    const mainGridStart = page.indexOf('<div class="main-grid');
    if (mainGridStart !== -1) {
        const nextDiv = page.indexOf('<div', mainGridStart + 1); // Start of content
        // This is a bit tricky with raw string replacement, 
        // so we'll look for the end of the main-grid or just replace the inner part

        // Let's try a simpler approach: Replace the specific dashboard cards
        // Searching for the first card-row
        page = page.replace(/<div class="row row-cards">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, `
            <div class="row row-cards">
                <div class="col-md-12">
                    <div class="card card-lagom">
                        <div class="card-body">
                            ${contentHtml}
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    const outputPath = path.join(__dirname, 'public', `${pageName}-static.html`);

    // Final cleanup of any leftover links
    page = page.replace(/https:\/\/bill\.youuhost\.com\/clientarea\.php/g, '/dashboard');
    page = page.replace(/https:\/\/youuhost\.com/g, 'http://localhost:3001');

    fs.writeFileSync(outputPath, page);
    console.log(`Generated ${outputPath}`);
}

// Data for Domains Page
const domainsContent = `
<div class="message message-no-data">
    <div class="message-image">
        <svg class="svg-icon " xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
            <path class="svg-icon-outline-s" d="M52.5,52.5C46.8,58.2,39.4,61,32,61c-7.4,0-14.8-2.8-20.5-8.5C5.8,46.8,3,39.4,3,32c0-7.4,2.8-14.8,8.5-20.5 C17.2,5.8,24.6,3,32,3c7.4,0,14.8,2.8,20.5,8.5C58.2,17.2,61,24.6,61,32C61,39.4,58.2,46.8,52.5,52.5z"></path>
            <path class="svg-icon-outline-s" d="M53.4,20.7c1.2,0.8,2.3,1.6,3.2,2.5"></path>
            <path class="svg-icon-outline-s" d="M42.1,16.3c1.4,0.3,2.7,0.6,3.9,1"></path>
            <path class="svg-icon-outline-s" d="M30,15.3c0.7,0,1.4,0,2,0c0.7,0,1.4,0,2,0"></path>
            <path class="svg-icon-outline-s" d="M18,17.3c1.3-0.4,2.6-0.8,3.9-1"></path>
            <path class="svg-icon-outline-s" d="M7.4,23.2c0.9-0.9,2-1.7,3.2-2.5"></path>
            <path class="svg-icon-outline-s" d="M61,32c0,4.6-3.2,8.8-8.5,11.8c-5.2,3-12.5,4.9-20.5,4.9c-8,0-15.3-1.9-20.5-4.9C6.2,40.8,3,36.6,3,32"></path>
            <circle class="svg-icon-prime" cx="32" cy="32" r="7"></circle>
        </svg>             
    </div>
    <h6 class="message-title">No Domains Registered With Us</h6>
    <div class="message-action">
        <a class="btn btn-primary" href="https://youuhost.com/domains">
            Register a New Domain
        </a>
    </div>
</div>
`;

generatePage('domains', 'My Domains', 'My Domains', domainsContent);
