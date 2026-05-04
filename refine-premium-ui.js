const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

const files = fs.readdirSync(FRAGMENTS_DIR)
  .filter(f => f.startsWith('cart-configure-') && f.endsWith('.html'));

console.log(`Deep-Refining UI for ${files.length} files...`);

for (const file of files) {
  const filePath = path.join(FRAGMENTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Convert all billing cycle panels to our premium style
  // Look for panels that contain billingcycle radio buttons
  html = html.replace(/<div class="panel panel-default panel-check[^"]*"/g, '<div class="panel panel-default panel-check"'); // cleanup
  
  // Find standard WHMCS panels and add our class
  html = html.replace(/<div class="panel panel-default([^"]*)"/g, (match, p1) => {
    if (p1.includes('panel-check')) return match;
    return `<div class="panel panel-default panel-check ${p1.trim()}"`;
  });

  // 2. Fix the Billing Cycle cards specifically (layout fix)
  // WHMCS often has very messy internal divs. Let's make them clean.
  html = html.replace(/<div class="check-title">([^<]+)<\/div>/g, '<div class="check-title" style="font-weight:700; color:#1a1a2e; margin-bottom:4px;">$1</div>');
  html = html.replace(/<div class="price">([^<]+)<\/div>/g, '<div class="price" style="font-size:18px; font-weight:700; color:#4f5bff;">$1</div>');

  // 3. Fix the "Operating System" cards
  // These are often .panel-item or similar
  html = html.replace(/class="panel-item/g, 'class="panel-item panel-check');

  // 4. Inject a CSS fix to make sure the "Selected" state is visible even without JS
  const cssFix = `
<style>
/* FORCE PREMIUM UI */
.panel-check { 
    border: 1px solid #e0e0e0 !important; 
    border-radius: 12px !important; 
    padding: 20px !important; 
    margin-bottom: 15px !important;
    transition: all 0.2s !important;
    cursor: pointer !important;
    background: #fff !important;
}
.panel-check:hover { border-color: #4f5bff !important; background: #f9faff !important; }
.panel-check input[type="radio"]:checked + .panel-body,
.panel-check.active { 
    border: 2px solid #4f5bff !important; 
    background: #f0f2ff !important; 
}
.panel-check .check { display: none !important; } /* hide old radio dots */

/* Layout for sections */
.section-title { font-size: 22px; font-weight: 600; margin: 30px 0 20px; color: #1a1a2e; }
.row-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
</style>
`;

  if (!html.includes('FORCE PREMIUM UI')) {
    html = html.replace('</head>', cssFix + '</head>');
    fs.writeFileSync(filePath, html);
  }
}

console.log('UI Deep-Refining complete! Now all cards should have the premium look.');
