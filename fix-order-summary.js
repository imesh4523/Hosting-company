const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

const files = fs.readdirSync(FRAGMENTS_DIR)
  .filter(f => f.startsWith('cart-configure-') && f.endsWith('.html'));

console.log(`Processing ${files.length} cart configure files...`);

let fixed = 0;

for (const file of files) {
  const filePath = path.join(FRAGMENTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Extract product name from title tag or h1
  let productName = 'Hosting Plan';
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    productName = titleMatch[1].replace(' - UltaHost', '').replace(' | UltaHost', '').trim();
  } else {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) productName = h1Match[1].trim();
  }

  // Extract base price from billing cycle options
  // WHMCS uses radio buttons like: value="monthly" data-price="5.99"
  // or plain text like: Monthly $5.99 USD
  let basePrice = '0.00';
  let currency = 'USD';

  // Try to find first billing price in the HTML
  const pricePatterns = [
    /\$(\d+\.\d{2})\s*USD\s*\/\s*mo/i,
    /Monthly\s+\$(\d+\.\d{2})/i,
    /data-price="(\d+\.\d+)"/i,
    /\$(\d+\.\d{2})\s*USD/i,
  ];
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      basePrice = parseFloat(match[1]).toFixed(2);
      break;
    }
  }

  // Build the replacement Order Summary HTML
  const orderSummaryHtml = `
<div class="sidebar-sticky sidebar-sticky-summary" id="orderSummary">
    <div class="panel panel-summary panel-summary-default order-summary m-b-0x" style="border-radius:14px; border:1px solid #eaeaea; overflow:hidden; background:#fff; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <div class="panel-heading" style="padding:20px 24px 12px; border-bottom:1px solid #f0f0f0;">
            <h2 class="panel-title" style="font-size:20px; font-weight:700; color:#1a1a2e; margin:0;">Order Summary</h2>
        </div>
        <div id="producttotal" data-summary-style="default" style="padding:20px 24px;">
            <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f5f5f5;">
                <div style="font-weight:600; font-size:15px; color:#222; margin-bottom:4px;" id="os-product-name">${productName}</div>
                <div style="font-size:13px; color:#888;">Monthly Billing</div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; color:#555; margin-bottom:10px;">
                <span>Setup Fee</span>
                <span style="color:#22c55e; font-weight:600;">FREE</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; color:#555; margin-bottom:10px;">
                <span>Monthly Price</span>
                <span id="os-monthly-price">$${basePrice} USD</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; color:#555; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f0f0f0;">
                <span>Gateway Charge</span>
                <span>$0.62 USD</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px;">
                <span style="font-size:13px; color:#888;">Total Due Today</span>
                <span id="os-total" style="font-size:26px; font-weight:800; color:#1a1a2e;">$${(parseFloat(basePrice)+0.62).toFixed(2)} <span style="font-size:14px;">USD</span></span>
            </div>
            <a href="/store/checkout?product=${encodeURIComponent(productName)}&price=${basePrice}" 
               class="btn btn-primary btn-block btn-lg" id="btnCompleteProductConfig"
               style="background:linear-gradient(135deg,#555bff,#7c3aed); border:none; border-radius:10px; padding:14px; font-weight:700; font-size:16px; display:flex; justify-content:center; align-items:center; text-decoration:none; color:white; gap:8px; transition:all 0.2s ease; box-shadow:0 4px 15px rgba(85,91,255,0.35);">
                <i class="ls ls-share"></i> Continue
            </a>
        </div>
    </div>
</div>
<script>
// Dynamic price updater — watches billing cycle & addon changes
(function() {
  var basePrice = ${basePrice};
  var gateway = 0.62;

  function updateSummary() {
    // Try to get selected billing cycle price
    var selected = document.querySelector('#sectionCycles .check-title');
    var cyclePrice = basePrice;

    // Try reading the active period selection
    var activePeriod = document.querySelector('input[name="billingcycle"]:checked');
    if (!activePeriod) activePeriod = document.querySelector('input[name="period"]:checked');

    document.getElementById('os-monthly-price').textContent = '$' + cyclePrice.toFixed(2) + ' USD';
    var total = cyclePrice + gateway;
    document.getElementById('os-total').innerHTML = '$' + total.toFixed(2) + ' <span style="font-size:14px;">USD</span>';

    // Update the continue button href
    var btn = document.getElementById('btnCompleteProductConfig');
    if (btn) {
      var url = btn.getAttribute('href').split('?')[0];
      btn.setAttribute('href', url + '?product=' + encodeURIComponent(document.getElementById('os-product-name').textContent) + '&price=' + cyclePrice.toFixed(2));
    }
  }

  // Listen for any form changes
  document.addEventListener('change', function(e) {
    setTimeout(updateSummary, 100);
  });

  // Also run on load
  document.addEventListener('DOMContentLoaded', updateSummary);
  setTimeout(updateSummary, 500);
})();
</script>`;

  // Replace the old sidebar div (main-sidebar) with our new one
  const oldSidebarPattern = /<div class="main-sidebar main-sidebar-lg"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="order-summary order-summary-mob/;
  
  // Simpler: replace just the content of the #orderSummary div
  const sidebarStart = html.indexOf('<div class="main-sidebar main-sidebar-lg">');
  const orderSummaryMobStart = html.indexOf('<div class="order-summary order-summary-mob');

  if (sidebarStart !== -1 && orderSummaryMobStart !== -1) {
    const before = html.substring(0, sidebarStart);
    const after = html.substring(orderSummaryMobStart);
    html = before + `<div class="main-sidebar main-sidebar-lg">` + orderSummaryHtml + `</div>` + '\n            ' + after;
    fs.writeFileSync(filePath, html);
    fixed++;
  } else {
    console.log(`  SKIP (structure not found): ${file}`);
  }
}

console.log(`\nDone! Fixed ${fixed}/${files.length} files.`);
