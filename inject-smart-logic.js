const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

const files = fs.readdirSync(FRAGMENTS_DIR)
  .filter(f => f.startsWith('cart-configure-') && f.endsWith('.html'));

console.log(`Injecting Smart Configurator into ${files.length} files...`);

for (const file of files) {
  const filePath = path.join(FRAGMENTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. First, ensure our Premium Order Summary is there (from previous step)
  // 2. Add the Logic Script at the end of the file
  const smartLogic = `
<script>
(function() {
    // --- SMART CONFIGURATOR LOGIC ---
    let state = {
        productName: document.getElementById('os-product-name')?.textContent || 'Hosting Plan',
        billingCycle: 'Monthly',
        basePrice: 0,
        addons: {},
        setupFee: 0,
        gatewayFee: 0
    };

    function init() {
        // Try to find the initial base price from the billing cycles
        const activeCycle = document.querySelector('input[name="billingcycle"]:checked') || document.querySelector('input[name="billingcycle"]');
        if (activeCycle) {
            const priceText = activeCycle.closest('.panel')?.querySelector('.price')?.textContent || '';
            state.basePrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
            state.billingCycle = activeCycle.value;
        }

        updateSummary();
        attachListeners();
    }

    function attachListeners() {
        // Listen for Billing Cycle changes
        document.querySelectorAll('input[name="billingcycle"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const label = e.target.closest('.panel')?.querySelector('.check-title')?.textContent || e.target.value;
                const priceText = e.target.closest('.panel')?.querySelector('.price')?.textContent || '';
                state.basePrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                state.billingCycle = label;
                updateSummary();
            });
        });

        // Listen for OS / Control Panel / Addon changes
        document.querySelectorAll('input[type="radio"], input[type="checkbox"], select').forEach(input => {
            if (input.name === 'billingcycle') return;
            input.addEventListener('change', () => {
                setTimeout(recalculateAddons, 50);
            });
        });

        // Tabs logic for OS / Control Panel / Applications
        document.querySelectorAll('.nav-tabs a').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = tab.getAttribute('href').replace('#', '');
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active', 'show'));
                const targetPane = document.getElementById(targetId);
                if (targetPane) targetPane.classList.add('active', 'show');
                
                document.querySelectorAll('.nav-tabs li').forEach(li => li.classList.remove('active'));
                tab.closest('li').classList.add('active');
            });
        });
    }

    function recalculateAddons() {
        state.addons = {};
        // Find all checked radios/checkboxes that have a price associated
        document.querySelectorAll('input:checked, select').forEach(el => {
            let text = '';
            if (el.tagName === 'SELECT') {
                text = el.options[el.selectedIndex]?.text || '';
            } else {
                text = el.closest('label')?.textContent || el.closest('.panel')?.textContent || '';
            }
            
            if (text.includes('$')) {
                const priceMatch = text.match(/\\$(\\d+\\.\\d{2})/);
                if (priceMatch) {
                    const name = text.split('$')[0].trim() || el.name;
                    state.addons[name] = parseFloat(priceMatch[1]);
                }
            }
        });
        updateSummary();
    }

    function updateSummary() {
        const productPriceEl = document.getElementById('os-base-price');
        const recurringPriceEl = document.getElementById('os-recurring-price');
        const totalEl = document.getElementById('os-total');
        const summaryContainer = document.getElementById('producttotal');

        if (!productPriceEl || !totalEl) return;

        // Update product line
        productPriceEl.textContent = '$' + state.basePrice.toFixed(2) + ' USD';
        
        // Update recurring line
        recurringPriceEl.textContent = '$' + state.basePrice.toFixed(2) + ' USD';
        document.querySelector('span:contains("Monthly")')?.replaceWith('<span>' + state.billingCycle + '</span>');

        // Calculate total
        let addonTotal = 0;
        Object.values(state.addons).forEach(p => addonTotal += p);
        
        const grandTotal = state.basePrice + addonTotal;
        totalEl.innerHTML = '$' + grandTotal.toFixed(2) + ' <span style="font-size: 16px; font-weight: 500;">USD</span>';

        // Update Continue link
        const btn = document.getElementById('btnCompleteProductConfig');
        if (btn) {
            const url = new URL(btn.href, window.location.origin);
            url.searchParams.set('product', state.productName);
            url.searchParams.set('cycle', state.billingCycle);
            url.searchParams.set('price', grandTotal.toFixed(2));
            btn.href = url.pathname + url.search;
        }
    }

    // Custom selector for text containing
    window.addEventListener('load', init);
    setTimeout(init, 500);
})();
</script>
<style>
/* Smooth transitions for panels */
.panel-summary { transition: all 0.3s ease; }
.panel.active { border-color: #4f5bff !important; box-shadow: 0 0 0 2px rgba(79, 91, 255, 0.1); }
.nav-tabs { border-bottom: 2px solid #f2f2f2; margin-bottom: 25px; }
.nav-tabs li a { padding: 12px 20px; font-weight: 600; color: #8e8e8e; text-decoration: none; display: block; }
.nav-tabs li.active a { color: #4f5bff; border-bottom: 2px solid #4f5bff; }
.tab-pane { display: none; }
.tab-pane.active { display: block; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
`;

  // Inject before body ends if exists, else at the end
  if (!html.includes('Smart Configurator')) {
    html += smartLogic;
    fs.writeFileSync(filePath, html);
  }
}

console.log('Smart Configurator successfully injected into all files!');
