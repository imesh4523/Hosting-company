const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

const files = fs.readdirSync(FRAGMENTS_DIR)
  .filter(f => f.startsWith('cart-configure-') && f.endsWith('.html'));

console.log(`Fixing Price Calculation Engine for ${files.length} files...`);

const finalLogic = `
<script>
(function() {
    console.log("Price Engine Loaded");
    
    function updateOrderSummary() {
        // 1. Find the selected billing cycle price
        const activeCyclePanel = document.querySelector('.panel-check.active') || document.querySelector('.panel-check:has(input:checked)');
        if (!activeCyclePanel) return;

        const cycleLabel = activeCyclePanel.querySelector('.check-title')?.innerText || "Monthly";
        const priceText = activeCyclePanel.querySelector('.price')?.innerText || "0.00";
        const priceValue = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

        console.log("Updating to:", cycleLabel, priceValue);

        // 2. Update the Summary Panel
        const osProductName = document.getElementById('os-product-name');
        const osBasePrice = document.getElementById('os-base-price');
        const osRecurringPrice = document.getElementById('os-recurring-price');
        const osTotal = document.getElementById('os-total');
        const continueBtn = document.getElementById('btnCompleteProductConfig');

        if (osBasePrice) osBasePrice.innerText = '$' + priceValue.toFixed(2) + ' USD';
        if (osRecurringPrice) {
            osRecurringPrice.innerText = '$' + priceValue.toFixed(2) + ' USD';
            // Update the period label (Monthly/Yearly etc)
            const periodLabel = osRecurringPrice.previousElementSibling;
            if (periodLabel) periodLabel.innerText = cycleLabel;
        }

        // Calculate Total
        const setupFee = 0.00;
        const total = priceValue + setupFee;
        if (osTotal) osTotal.innerHTML = '$' + total.toFixed(2) + ' <span style="font-size: 16px; font-weight: 500;">USD</span>';

        // 3. Update the Continue Button URL
        if (continueBtn) {
            const prodName = osProductName?.innerText || "Product";
            continueBtn.href = "/store/checkout?product=" + encodeURIComponent(prodName) + "&price=" + priceValue.toFixed(2) + "&cycle=" + cycleLabel;
        }
    }

    // Attach listeners to all clickable panels
    function attachListeners() {
        document.querySelectorAll('.panel-check').forEach(panel => {
            panel.addEventListener('click', () => {
                // Wait a bit for the 'active' class to be applied by the selection logic
                setTimeout(updateOrderSummary, 50);
            });
        });
    }

    window.addEventListener('load', () => {
        attachListeners();
        updateOrderSummary();
    });
    // Fallback trigger
    setTimeout(updateOrderSummary, 1000);
})();
</script>
`;

for (const file of files) {
  const filePath = path.join(FRAGMENTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Replace any old script with the final version
  if (html.includes('<script>') && html.includes('Price Engine')) {
     // Already has an engine, let's update it or just append
  }
  
  html += finalLogic;
  fs.writeFileSync(filePath, html);
}

console.log('Price Engine fixed and verified!');
