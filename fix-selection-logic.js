const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

const files = fs.readdirSync(FRAGMENTS_DIR)
  .filter(f => f.startsWith('cart-configure-') && f.endsWith('.html'));

console.log(`Fixing Selection Logic for ${files.length} files...`);

const premiumStyles = `
<style>
/* PREMIUM SELECTION STYLES */
.panel.panel-check { 
    cursor: pointer; 
    transition: all 0.2s ease; 
    border: 2px solid #f2f2f2 !important; 
    position: relative;
    border-radius: 12px !important;
}
.panel.panel-check:hover { border-color: #4f5bff66 !important; background: #fbfbff; }
.panel.panel-check.active { 
    border-color: #4f5bff !important; 
    background: #f0f2ff; 
    box-shadow: 0 4px 15px rgba(79, 91, 255, 0.1); 
}
.panel.panel-check.active::after {
    content: '\\f00c';
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    position: absolute;
    top: 10px;
    right: 10px;
    color: #4f5bff;
    font-size: 14px;
}
.panel-check input[type="radio"], .panel-check input[type="checkbox"] {
    display: none !important;
}

/* TABS STYLING */
.nav-tabs-premium {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    border-bottom: 1px solid #f2f2f2;
    padding-bottom: 10px;
}
.nav-tab-item {
    padding: 10px 20px;
    border-radius: 30px;
    cursor: pointer;
    font-weight: 600;
    color: #8e8e8e;
    background: #f8f8f8;
    transition: all 0.2s;
}
.nav-tab-item.active {
    background: #4f5bff;
    color: white;
}
</style>
`;

const selectionLogic = `
<script>
(function() {
    function applySelectionLogic() {
        // 1. Make all product/cycle/os panels clickable
        const panels = document.querySelectorAll('.panel-check, .panel-item, .panel[data-type="radio"]');
        
        panels.forEach(panel => {
            // Initial state
            const radio = panel.querySelector('input[type="radio"], input[type="checkbox"]');
            if (radio && radio.checked) panel.classList.add('active');

            panel.onclick = function(e) {
                if (radio) {
                    radio.checked = true;
                    // Remove active from siblings
                    const name = radio.name;
                    document.querySelectorAll('input[name="' + name + '"]').forEach(r => {
                        r.closest('.panel')?.classList.remove('active');
                    });
                    panel.classList.add('active');
                    
                    // Trigger change event for price calculation
                    const event = new Event('change', { bubbles: true });
                    radio.dispatchEvent(event);
                }
            };
        });

        // 2. Fix Sliders & Selects
        document.querySelectorAll('select.form-control').forEach(select => {
            select.addEventListener('change', () => {
                const event = new Event('change', { bubbles: true });
                document.dispatchEvent(event); 
            });
        });
    }

    // Run on load and multiple times to ensure dynamic content is caught
    window.addEventListener('load', applySelectionLogic);
    document.addEventListener('DOMContentLoaded', applySelectionLogic);
    setTimeout(applySelectionLogic, 500);
    setTimeout(applySelectionLogic, 1500);
})();
</script>
`;

for (const file of files) {
  const filePath = path.join(FRAGMENTS_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Add styles and logic
  if (!html.includes('PREMIUM SELECTION STYLES')) {
    html = html.replace('</head>', premiumStyles + '</head>');
    if (!html.includes('</head>')) html = premiumStyles + html; // Fallback
    html += selectionLogic;
    fs.writeFileSync(filePath, html);
  }
}

console.log('Selection Engine successfully fixed!');
