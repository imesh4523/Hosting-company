'use client';
import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import FragmentPage from '@/components/FragmentPage';

export default function StoreDynamicPage() {
  const pathname = usePathname();
  // pathname is e.g. /store/macos-vds-hosting
  const slugArray = pathname.replace('/store/', '').split('/').filter(Boolean);
  const slug = slugArray.length > 0 ? slugArray[0] : '';

  // Map store slugs → fragment names
  const fragmentMapping: Record<string, string> = {
    // UltaSecurity (main store page)
    'ultasecurity':                       'ssl_certificates',
    'ssl-certificates':                   'ssl_certificates',
    'ssl-certificaties':                  'ssl_certificates',
    'codeguard':                          'website_backup',
    'website-backup':                     'website_backup',
    'marketgoo':                          'seo_tools',
    'sitelock':                           'website_security',
    'website-security':                   'website_security',
    'website-builder':                    'website_security',
    // Shared Hosting
    'shared-hosting':                     'services',
    'linux-shared-hosting':               'services',
    'windows-shared-hosting':             'services',
    // WordPress
    'wordpress-hosting':                  'services',
    // Tools
    'dns-manager':                        'dns_manager',
    'resolution-center':                  'resolution_center',
    
    // Cart Flow
    'checkout':                           'cart_checkout',
    // VPS Hosting
    'vps-hosting':                        'services',
    'linux-vps-hosting':                  'services',
    'macos-vps-hosting':                  'services',
    'windows-vps-hosting':                'services',
    // VDS Hosting
    'vds-hosting':                        'services',
    'linux-vds-hosting':                  'services',
    'macos-vds-hosting':                  'services',
    'windows-vds-hosting':                'services',
    // Dedicated Servers
    'dedicated-hosting':                  'services',
    'dedicated-servers':                  'services',
    'nested-dedicated-servers':           'services',
    'mac-dedicated-servers':              'services',
    'gaming-dedicated-servers':           'services',
    // Reseller Hosting
    'reseller-hosting':                   'services',
    'linux-reseller-hosting':             'services',
    'windows-reseller-hosting':           'services',
    'internet-radio-reseller-hosting':    'services',
    'shoutcast-radio-reseller-hosting':   'services',
    // Email / Radio
    'email-hosting':                      'services',
    'radio-hosting':                      'services',
    // Game Servers
    'game-servers':                       'services',
    'minecraft-game-server':              'services',
    '7-days-to-die-game-server':          'services',
    'rust-game-server':                   'services',
    'counter-strike-go-game-server':      'services',
    'valheim-game-server':                'services',
    // Popular Hosting
    'popular-hosting':                    'services',
    // Other
    'other-products':                     'services',
    'server-support-service':             'services',
  };

  const fragmentName = slugArray && slugArray.length > 1 
    ? 'cart_configure' 
    : (fragmentMapping[slug] || 'ssl_certificates');

  const subSlug = slugArray.length > 1 ? slugArray[1] : '';

  console.log('RENDERING StoreDynamicPage', { slugArray, slug, subSlug, fragmentName });

  React.useEffect(() => {
    // 1. Inject Premium Styles - Safe for Next.js HMR
    let styleEl = document.getElementById('premium-store-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'premium-store-styles';
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
        /* Premium Card Styling */
        body .panel-check, body .panel-item { 
            border: 1px solid #f0f0f0 !important; 
            cursor: pointer !important; 
            transition: all 0.3s ease !important; 
            border-radius: 16px !important; 
            background: #ffffff !important; 
            margin-bottom: 20px; 
            padding: 16px 20px !important;
            display: flex !important;
            align-items: center !important;
            min-height: 75px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.01) !important;
        }
        body .panel-check:hover, body .panel-item:hover { 
            border-color: #4f5bff44 !important; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
            background: #ffffff !important;
        }
        body .active-card { 
            border: 2px solid #4f5bff !important; 
            background-color: #ffffff !important; 
            box-shadow: 0 4px 25px rgba(79, 91, 255, 0.12) !important;
        }

        /* Bulletproof Custom Radio Buttons */
        body .panel-check input[type="radio"], body .panel-item input[type="radio"], 
        body .panel-check [class*="iradio"], body .panel-item [class*="iradio"] {
            display: none !important;
            opacity: 0 !important;
            position: absolute !important;
            left: -9999px !important;
        }

        body .panel-check label::before, body .panel-item label::before {
            content: '';
            display: inline-block;
            width: 22px;
            height: 22px;
            min-width: 22px;
            border: 2px solid #e0e0e0;
            border-radius: 50%;
            margin-right: 15px;
            background: #fff;
            transition: all 0.2s ease;
            box-sizing: border-box;
        }

        body .panel-check.active-card label::before, body .panel-item.active-card label::before {
            border-color: #4f5bff;
            background-color: #fff;
            background-image: radial-gradient(circle, #4f5bff 35%, transparent 40%);
        }

        /* Fix Inner Card Layout */
        body .panel-check .panel-body, body .panel-item .panel-body {
            width: 100% !important;
            padding: 0 !important;
        }
        body .panel-check label, body .panel-item label {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            margin: 0 !important;
            cursor: pointer !important;
        }
        body .panel-check .check-content, body .panel-item .check-content {
            flex-grow: 1;
            text-align: left !important;
        }
        body .panel-check h6, body .panel-item h6 {
            margin: 0 !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            color: #222 !important;
        }
        body .panel-check img, body .panel-item img {
            max-width: 35px !important;
            max-height: 35px !important;
            margin-left: 15px !important;
        }

        /* PILL TABS - Premium Design */
        .os-tabs-container { 
            display: inline-flex; 
            gap: 8px; 
            margin: 25px 0 30px 0; 
            background: #ffffff; 
            padding: 8px; 
            border-radius: 50px; 
            border: 1px solid #f0f0f0;
            box-shadow: 0 2px 15px rgba(0,0,0,0.03);
        }
        .os-tab { 
            padding: 10px 28px; 
            border-radius: 50px; 
            cursor: pointer; 
            font-weight: 500; 
            font-size: 15px; 
            color: #666; 
            transition: all 0.3s ease; 
        }
        .os-tab:hover {
            color: #4f5bff;
        }
        .os-tab.active { 
            background: #4f5bff; 
            color: white; 
            box-shadow: 0 4px 15px rgba(79, 91, 255, 0.3); 
        }
        .os-card-hidden { display: none !important; }
    `;

    const setupSmartTabs = () => {
        // Stop if tabs already exist
        if (document.querySelector('.os-tabs-container')) return;

        const headers = Array.from(document.querySelectorAll('h3, .section-title, h2'));
        const osHeader = headers.find(h => h.textContent?.includes('Operating System'));
        const cpHeader = headers.find(h => h.textContent?.includes('Control Panel'));
        
        if (!osHeader) return;
        if (cpHeader) (cpHeader as HTMLElement).style.display = 'none';

        // Tag all cards
        const allCards = Array.from(document.querySelectorAll('.panel, .panel-check, .panel-item, .package-config-item'));
        const groups: any = { plain: [], cp: [], apps: [] };

        allCards.forEach((card: any) => {
            const text = card.innerText.toLowerCase();
            // Basic heuristic for categorizing cards based on their text
            if (text.includes('cpanel') || text.includes('plesk') || text.includes('cyberpanel') || text.includes('panel') || text.includes('none') || text.includes('ispmanager') || text.includes('aapanel') || text.includes('hestia')) {
                groups.cp.push(card);
            } else if (text.includes('docker') || text.includes('wordpress') || text.includes('n8n') || text.includes('laravel') || text.includes('node') || text.includes('woocommerce') || text.includes('magento')) {
                groups.apps.push(card);
            } else if (text.includes('ubuntu') || text.includes('debian') || text.includes('alma') || text.includes('centos') || text.includes('windows') || text.includes('kali') || text.includes('rocky') || text.includes('fedora') || text.includes('alpinelinux')) {
                groups.plain.push(card);
            } else {
                // Default fallback to plain OS if we can't tell, or if it's just a cycle/location panel, ignore
                if (card.querySelector('h6') || text.includes('bit')) {
                   groups.plain.push(card);
                }
            }
        });

        if (groups.plain.length === 0 && groups.cp.length === 0) return; // Not an OS configuration section

        // Create the Tab Container
        const tabBar = document.createElement('div');
        tabBar.className = 'os-tabs-container';
        tabBar.innerHTML = `
            <div class="os-tab active" data-group="plain">Plain OS</div>
            <div class="os-tab" data-group="cp">Control Panel</div>
            <div class="os-tab" data-group="apps">Applications</div>
        `;
        osHeader.after(tabBar);

        const switchTab = (group: string) => {
            tabBar.querySelectorAll('.os-tab').forEach(t => t.classList.remove('active'));
            tabBar.querySelector(`[data-group="${group}"]`)?.classList.add('active');
            
            // Hide all categorized cards
            [...groups.plain, ...groups.cp, ...groups.apps].forEach((c: HTMLElement) => {
                c.classList.add('os-card-hidden');
                // Hide the parent column if it's in a grid
                const col = c.closest('.col-sm-4, .col-md-4, .col-lg-4, .col-xs-12') as HTMLElement;
                if (col) col.classList.add('os-card-hidden');
            });

            // Show selected cards
            groups[group].forEach((c: HTMLElement) => {
                c.classList.remove('os-card-hidden');
                const col = c.closest('.col-sm-4, .col-md-4, .col-lg-4, .col-xs-12') as HTMLElement;
                if (col) col.classList.remove('os-card-hidden');
            });
        };

        // Attach click listeners to the tabs
        tabBar.querySelectorAll('.os-tab').forEach(t => {
            t.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent global click handler from catching this
                switchTab(t.getAttribute('data-group')!);
            });
        });

        // Initialize with Plain OS
        switchTab('plain');
    };

    // Global Click Handler for Selection & Prices
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Prevent tab clicks from triggering selection logic
      if (target.classList.contains('os-tab')) return;

      const card = target.closest('.panel, .panel-check, .panel-item') as HTMLElement;
      if (!card) return;

      const radio = card.querySelector('input[type="radio"]') as HTMLInputElement;
      if (radio) {
        e.preventDefault(); 
        const name = radio.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach((r: any) => {
          r.checked = false;
          r.closest('.panel, .panel-check, .panel-item')?.classList.remove('active-card');
        });
        radio.checked = true;
        card.classList.add('active-card');

        // Update Summary
        const osProductName = document.getElementById('os-product-name');
        const osBasePrice = document.getElementById('os-base-price');
        const osRecurringPrice = document.getElementById('os-recurring-price');
        const osTotal = document.getElementById('os-total');
        const continueBtn = document.getElementById('btnCompleteProductConfig') as HTMLAnchorElement;

        const priceText = card.querySelector('.price')?.textContent || "0.00";
        const val = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        const cycle = card.querySelector('.check-title')?.textContent || "Monthly";

        if (osBasePrice) osBasePrice.innerText = '$' + val.toFixed(2) + ' USD';
        if (osRecurringPrice) {
            osRecurringPrice.innerText = '$' + val.toFixed(2) + ' USD';
            const periodLabel = osRecurringPrice.previousElementSibling as HTMLElement;
            if (periodLabel) periodLabel.innerText = cycle;
        }
        const total = val + 0.62;
        if (osTotal) osTotal.innerHTML = '$' + total.toFixed(2) + ' <span style="font-size: 16px;">USD</span>';
        if (continueBtn) {
            const prodName = osProductName?.innerText || "Product";
            continueBtn.href = `/store/checkout?product=${encodeURIComponent(prodName)}&price=${val.toFixed(2)}&cycle=${cycle}`;
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    
    // Initial highlight for pre-selected items
    setTimeout(() => {
        document.querySelectorAll('input[type="radio"]:checked').forEach(r => {
            r.closest('.panel, .panel-check, .panel-item')?.classList.add('active-card');
        });
    }, 500);

    const observer = new MutationObserver(() => {
        setupSmartTabs();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setupSmartTabs();

    return () => {
        document.removeEventListener('click', handleGlobalClick, true);
        observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <FragmentPage key={pathname} fragmentName={fragmentName} slug={slug} subSlug={subSlug} />
    </>
  );
}
