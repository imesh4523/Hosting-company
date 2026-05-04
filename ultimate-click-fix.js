const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

const files = fs.readdirSync(FRAGMENTS_DIR)
  .filter(f => f.startsWith('cart-configure-') && f.endsWith('.html'));

console.log(`Applying ULTIMATE CLICK FIX to ${files.length} files...`);

const ultimateScript = `
<script id="ultimate-click-fix">
(function() {
    console.log("Ultimate Click Fix Active");

    // 1. Force the active class styling via JS injection (so it's real-time)
    const style = document.createElement('style');
    style.innerHTML = \`
        .panel-check { border: 2px solid #f2f2f2 !important; cursor: pointer !important; transition: 0.2s !important; position: relative !important; }
        .panel-check:hover { border-color: #4f5bff88 !important; }
        .panel-check.active-card { 
            border: 2px solid #4f5bff !important; 
            background-color: #f0f2ff !important; 
            box-shadow: 0 4px 20px rgba(79, 91, 255, 0.15) !important;
        }
        .panel-check.active-card::after {
            content: '✓';
            position: absolute; top: 10px; right: 10px;
            background: #4f5bff; color: white; border-radius: 50%;
            width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;
        }
    \`;
    document.head.appendChild(style);

    function handleGlobalClick(e) {
        // Find if they clicked a panel or inside a panel
        const card = e.target.closest('.panel, .panel-check, .panel-item');
        if (!card) return;

        console.log("Card Clicked:", card);

        // Find the radio button inside this card
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
            // Uncheck others in the same group
            const name = radio.name;
            document.querySelectorAll('input[name="' + name + '"]').forEach(r => {
                r.checked = false;
                r.closest('.panel, .panel-check, .panel-item')?.classList.remove('active-card');
            });

            // Check this one
            radio.checked = true;
            card.classList.add('active-card');

            // Trigger price update logic
            if (window.updateOrderSummary) {
                window.updateOrderSummary();
            } else {
                // Fallback: manually find and update prices
                const priceText = card.querySelector('.price')?.innerText || "0.00";
                const val = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                const cycle = card.querySelector('.check-title')?.innerText || "Monthly";
                
                document.getElementById('os-base-price') && (document.getElementById('os-base-price').innerText = '$' + val.toFixed(2) + ' USD');
                document.getElementById('os-recurring-price') && (document.getElementById('os-recurring-price').innerText = '$' + val.toFixed(2) + ' USD');
                const total = val + 0.62; // gateway
                document.getElementById('os-total') && (document.getElementById('os-total').innerHTML = '$' + total.toFixed(2) + ' <span style="font-size: 16px;">USD</span>');
            }
        }
    }

    // Use capturing phase to beat any other scripts
    document.addEventListener('click', handleGlobalClick, true);

    // Initial highlight for already checked radio
    window.addEventListener('load', () => {
        document.querySelectorAll('input[type="radio"]:checked').forEach(r => {
            r.closest('.panel, .panel-check, .panel-item')?.classList.add('active-card');
        });
    });
})();
</script>
`;

for (const file of files) {
  const filePath = path.join(FRAGMENTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Clean up any old broken scripts first to avoid conflicts
  html = html.replace(/<script id="ultimate-click-fix">[\s\S]*?<\/script>/g, '');
  
  // Inject the new one
  html += ultimateScript;
  fs.writeFileSync(filePath, html);
}

console.log('Ultimate Click Fix applied! This bypasses all other scripts.');
