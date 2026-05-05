const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

const files = fs.readdirSync(FRAGMENTS_DIR)
  .filter(f => f.startsWith('cart-configure-') && f.endsWith('.html'));

console.log(`Updating UI for ${files.length} cart configure files...`);

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(FRAGMENTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Extract product name from existing summary or title
  let productName = 'Hosting Plan';
  const nameMatch = html.match(/id="os-product-name">([^<]+)</);
  if (nameMatch) {
    productName = nameMatch[1].trim();
  } else {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) productName = titleMatch[1].replace(' - youuhost', '').trim();
  }

  // Extract base price
  let basePrice = '0.00';
  const priceMatch = html.match(/id="os-monthly-price">\$(\d+\.\d{2})/);
  if (priceMatch) {
    basePrice = priceMatch[1];
  } else {
    const genericPrice = html.match(/\$(\d+\.\d{2})\s*USD/i);
    if (genericPrice) basePrice = genericPrice[1];
  }

  const newUiHtml = `
<div class="sidebar-sticky sidebar-sticky-summary" id="orderSummary">
    <div class="panel panel-summary panel-summary-default order-summary m-b-0x" style="border-radius:15px; border:1px solid #f2f2f2; overflow:hidden; background:#fff; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
        <h2 class="panel-title" style="font-size:24px; font-weight:500; color:#1a1a2e; margin-bottom:24px;">Order Summary</h2>
        
        <div id="producttotal" data-summary-style="default">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap: 10px;">
                <span style="font-weight:600; font-size:14px; color:#1a1a2e; line-height: 1.4;" id="os-product-name">${productName}</span>
                <span style="font-weight:600; font-size:14px; color:#1a1a2e; white-space: nowrap;" id="os-base-price">$${basePrice} USD</span>
            </div>
            
            <hr style="border:0; border-top:1px solid #f2f2f2; margin: 16px 0;">
            
            <div style="margin-bottom:16px;">
                <div style="font-size:11px; color:#8e8e8e; text-transform:uppercase; margin-bottom:8px; font-weight:700; letter-spacing: 0.5px;">Total Recurring</div>
                <div style="display:flex; justify-content:space-between; font-size:14px; color:#1a1a2e;">
                    <span>Monthly</span>
                    <span id="os-recurring-price" style="font-weight: 500;">$${basePrice} USD</span>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; font-size:14px; color:#1a1a2e; margin-bottom:24px;">
                <span>Setup Fees</span>
                <span style="color:#1a1a2e; font-weight: 500;">$0.00 USD</span>
            </div>
            
            <hr style="border:0; border-top:1px solid #f2f2f2; margin: 16px 0;">
            
            <div style="margin-bottom:24px;">
                <div style="font-size:11px; color:#8e8e8e; text-transform:uppercase; margin-bottom:4px; font-weight:700; letter-spacing: 0.5px;">Total Due Today</div>
                <div id="os-total" style="font-size:32px; font-weight:700; color:#1a1a2e;">$${basePrice} <span style="font-size: 16px; font-weight: 500;">USD</span></div>
            </div>

            <a href="/store/checkout?product=${encodeURIComponent(productName)}&price=${basePrice}" 
               class="btn btn-primary btn-block btn-lg" id="btnCompleteProductConfig"
               style="background:#4f5bff; border:none; border-radius:12px; padding:16px; font-weight:600; font-size:16px; display:flex; justify-content:center; align-items:center; text-decoration:none; color:white; gap:10px; transition:all 0.2s ease; box-shadow: 0 4px 12px rgba(79, 91, 255, 0.2);">
                Continue <i class="ls ls-arrow-right" style="font-size: 14px;"></i>
            </a>
        </div>
    </div>
</div>`;

  // Replace the entire sidebar content
  const sidebarStart = html.indexOf('<div class="main-sidebar main-sidebar-lg">');
  const sidebarEndMarker = html.indexOf('<div class="order-summary order-summary-mob');

  if (sidebarStart !== -1 && sidebarEndMarker !== -1) {
    const before = html.substring(0, sidebarStart);
    const after = html.substring(sidebarEndMarker);
    const finalHtml = before + `<div class="main-sidebar main-sidebar-lg">` + newUiHtml + `</div>\n            ` + after;
    fs.writeFileSync(filePath, finalHtml);
    updatedCount++;
  }
}

console.log(`Successfully updated ${updatedCount} files to the premium UI design!`);
