'use client';
import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import FragmentPage from '@/components/FragmentPage';

export default function StoreDynamicPage() {
  const pathname = usePathname();
  const slugArray = pathname.replace('/store/', '').split('/').filter(Boolean);
  const slug = slugArray.length > 0 ? slugArray[0] : '';
  const subSlug = slugArray.length > 1 ? slugArray[1] : '';

  const fragmentMapping: Record<string, string> = {
    'ultasecurity':                       'ssl_certificates',
    'vps-hosting':                        'services',
    'vps-basic':                          'cart_configure',
    'checkout':                           'cart_checkout',
  };

  const fragmentName = slugArray.length > 1 ? 'cart_configure' : (fragmentMapping[slug] || 'services');

  React.useEffect(() => {
    let styleEl = document.getElementById('premium-store-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'premium-store-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
        .react-selection-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
            gap: 12px; 
            margin-top: 20px;
            width: 100%;
        }
        .premium-card {
            background: #fff;
            border: 1px solid #DEE0E3;
            border-radius: 10px;
            padding: 12px 12px 12px 42px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            min-height: 68px;
            max-width: 240px;
            text-align: left;
        }
        .premium-card:hover { border-color: #1062FE; background: #f9fbff; }
        .premium-card.active { border: 2px solid #1062FE; background: #f0f5ff; }
        
        .premium-card h6 { margin: 0; font-size: 14px; font-weight: 600; color: #232323; line-height: 1.2; width: 100%; }
        .premium-card .card-info { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; flex: 1; }
        .premium-card .price-container { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
        .premium-card .price { font-size: 14px; color: #1062FE; font-weight: 700; line-height: 1; }
        .premium-card .original-price-strike { font-size: 11px; color: #8e8e8e; text-decoration: line-through; line-height: 1; }
        .premium-card img { width: 24px; height: 24px; object-fit: cover; flex-shrink: 0; border-radius: 50%; margin-left: 8px; }
        
        .save-badge {
            position: absolute;
            top: -8px;
            right: 8px;
            background: #1062FE;
            color: #fff;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 20px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(16,98,254,0.3);
            z-index: 10;
        }

        .radio-dot {
            position: absolute;
            left: 12px;
            width: 18px;
            height: 18px;
            border: 2px solid #e0e0e0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .premium-card.active .radio-dot { border-color: #1062FE; }
        .premium-card.active .radio-dot::after {
            content: '';
            width: 10px;
            height: 10px;
            background: #1062FE;
            border-radius: 50%;
        }

        .premium-tabs {
            display: inline-flex;
            gap: 5px;
            background: #f0f2f5;
            padding: 5px;
            border-radius: 50px;
            margin: 20px 0 25px 0;
        }
        .premium-tab {
            padding: 8px 20px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            color: #666;
            transition: all 0.2s;
            font-size: 13px;
        }
        .premium-tab.active { background: #fff; color: #1062FE; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .hidden-original { 
            opacity: 0 !important; 
            position: absolute !important; 
            pointer-events: none !important; 
            height: 0 !important; 
            overflow: hidden !important; 
            z-index: -1 !important;
        }
    `;

    const getCountryCode = (name: string) => {
        const mapping: Record<string, string> = {
            'germany': 'de', 'uk': 'gb', 'sweden': 'se', 'nl': 'nl', 'spain': 'es',
            'poland': 'pl', 'switzerland': 'ch', 'france': 'fr', 'norway': 'no',
            'italy': 'it', 'usa': 'us', 'canada': 'ca', 'india': 'in', 'asia': 'sg',
            'japan': 'jp', 'china': 'hk', 'south korea': 'kr', 'turkey': 'tr',
            'uae': 'ae', 'africa': 'za', 'brazil': 'br', 'australia': 'au', 'malaysia': 'my'
        };
        const lower = name.toLowerCase();
        const key = Object.keys(mapping).find(k => lower.includes(k));
        return mapping[key || 'us'];
    };

    const scrapeSection = (titleText: string) => {
        const titles = Array.from(document.querySelectorAll('h2, .section-title, h3, .section-main-title'));
        const title = titles.find(t => t.textContent?.includes(titleText));
        if (!title) return [];

        const section = title.closest('.section');
        if (!section) return [];

        const inputs = Array.from(section.querySelectorAll('input[type="radio"]'));
        return inputs.map(input => {
            const label = input.closest('label') || input.parentElement;
            const fullText = label?.textContent?.trim() || '';
            
            // Smarter split: Name is usually before the first $
            const dollarIndex = fullText.indexOf('$');
            let name = fullText;
            let priceSection = '';
            
            if (dollarIndex !== -1) {
                name = fullText.substring(0, dollarIndex).trim();
                priceSection = fullText.substring(dollarIndex).trim();
            }

            // Extract all prices like $10.50
            const prices = priceSection.match(/\$\d+\.\d{2}/g) || [];
            const mainPrice = prices[0] || '';
            const oldPrice = prices.length > 1 ? prices[1] : '';

            const saveText = label?.querySelector('.discount-price:not(.original-price)')?.textContent?.trim() || '';
            
            return {
                name: name,
                price: mainPrice,
                oldPrice: oldPrice,
                save: saveText,
                value: (input as HTMLInputElement).value,
                inputName: (input as HTMLInputElement).name,
                originalInput: input as HTMLInputElement
            };
        });
    };

    const updateSummaryManually = (item: any) => {
        if (!item) return;
        
        let priceStr = item.price;
        if ((!priceStr || priceStr === '$0.00' || priceStr === '') && item.originalInput) {
            const panel = item.originalInput.closest('.panel, .panel-check, .panel-item');
            priceStr = panel?.querySelector('.price, .check-subtitle, .check-title')?.textContent?.trim() || "";
        }

        if (!priceStr) return;
        
        const priceMatch = priceStr.match(/\$(\d+\.\d{2})/);
        if (!priceMatch) return;
        
        const cleanPrice = priceMatch[1];
        const formattedPrice = `$${cleanPrice} USD`;
        
        const updateElements = () => {
            const summaryPanel = document.querySelector('.order-summary, #orderSummary, .summary-panel, #producttotal');
            if (!summaryPanel || (window as any)._isUpdatingSummary) return;

            (window as any)._isUpdatingSummary = true;
            
            // Temporarily stop observer to avoid recursion
            const obs = (window as any)._summaryObserver;
            if (obs) obs.disconnect();

            try {
                // 1. Direct ID Updates
                const targets = {
                    'os-base-price': formattedPrice,
                    'os-recurring-price': formattedPrice,
                    'os-total': formattedPrice + ' <span style="font-size: 16px; font-weight: 500;">USD</span>'
                };

                Object.entries(targets).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el && el.innerHTML !== val) el.innerHTML = val;
                });

                // 2. Aggressive Text Search & Replace
                const walkers = document.createTreeWalker(summaryPanel, NodeFilter.SHOW_TEXT, null);
                let node;
                while(node = walkers.nextNode()) {
                    const text = node.nodeValue || "";
                    if (text.includes('$') && !text.includes(cleanPrice)) {
                        const newText = text.replace(/\$\d+\.\d{2}/g, `$${cleanPrice}`);
                        if (node.nodeValue !== newText) node.nodeValue = newText;
                    }
                }

                // 3. Continue Button Force
                const continueBtn = document.getElementById('btnCompleteProductConfig') as HTMLAnchorElement;
                if (continueBtn) {
                    try {
                        const url = new URL(continueBtn.href, window.location.origin);
                        if (url.searchParams.get('price') !== cleanPrice) {
                            url.searchParams.set('price', cleanPrice);
                            if (item.name) {
                                const cycleName = item.name.split('$')[0].trim().toLowerCase();
                                url.searchParams.set('cycle', cycleName);
                            }
                            continueBtn.href = url.pathname + url.search;
                        }
                    } catch (e) {}
                }
            } finally {
                // Restart observer
                if (obs && summaryPanel) {
                    obs.observe(summaryPanel, { childList: true, subtree: true, characterData: true });
                }
                (window as any)._isUpdatingSummary = false;
            }
        };

        updateElements();
        
        // Initialize observer if not present
        const summaryPanel = document.querySelector('.order-summary, #orderSummary, .summary-panel, #producttotal');
        if (summaryPanel && !(window as any)._summaryObserver) {
            (window as any)._summaryObserver = new MutationObserver(() => updateElements());
            (window as any)._summaryObserver.observe(summaryPanel, { childList: true, subtree: true, characterData: true });
        }
    };

    const triggerOriginal = (item: any) => {
        if (item.originalInput) {
            console.log('Antigravity: Native Sync', item.name, item.price);
            
            updateSummaryManually(item);
            (window as any)._lastSelectedItem = item;

            const win = window as any;
            if (typeof win.jQuery !== 'undefined') {
                const $ = win.jQuery;
                const $input = $(item.originalInput);
                const $panel = $input.closest('.panel, .panel-check, .panel-item');
                
                const groupName = item.originalInput.name;
                $(`input[name="${groupName}"]`).closest('.panel, .panel-check, .panel-item').removeClass('active active-card');
                
                item.originalInput.checked = true;
                if ($panel.length) $panel.addClass('active active-card');
                
                if (typeof $input.iCheck === 'function') $input.iCheck('check');
                $input.trigger('change');
                
                if (typeof win.updateOrderSummary === 'function') {
                    win.updateOrderSummary();
                }
            } else {
                const name = item.originalInput.name;
                document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
                    input.closest('.panel, .panel-check, .panel-item')?.classList.remove('active', 'active-card');
                });

                item.originalInput.checked = true;
                item.originalInput.closest('.panel, .panel-check, .panel-item')?.classList.add('active', 'active-card');
                item.originalInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };

    const renderGrid = (items: any[], container: HTMLElement, type: 'os' | 'loc' | 'billing') => {
        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'react-selection-grid';
        
        items.forEach((item) => {
            const card = document.createElement('div');
            card.className = `premium-card ${item.originalInput.checked ? 'active' : ''}`;
            
            let content = `<div class="radio-dot"></div>`;
            if (type === 'os') {
                const iconUrl = `/api/icon?name=${encodeURIComponent(item.name.toLowerCase().replace(/\+/g, '').replace(/\s+/g, '-'))}`;
                content += `<h6>${item.name}</h6><img src="${iconUrl}" onerror="this.src='/api/icon?name=none'">`;
            } else if (type === 'loc') {
                const code = getCountryCode(item.name);
                const iconUrl = code === 'my' 
                    ? 'https://bill.youuhost.com/templates/flags-new/flag-for-malaysia.svg'
                    : `https://flagcdn.com/32x24/${code}.png`;
                content += `<h6>${item.name}</h6><img src="${iconUrl}">`;
            } else if (type === 'billing') {
                const oldPriceHtml = item.oldPrice ? `<span class="original-price-strike" style="font-size: 11px; color: #8e8e8e; text-decoration: line-through; margin-left: 5px;">${item.oldPrice}</span>` : '';
                content += `
                    <div class="card-info">
                        <h6>${item.name}</h6>
                        <div class="price-container" style="display: flex; align-items: center; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
                            <span class="price" style="font-size: 13px; color: #1062FE; font-weight: 700;">${item.price}</span>
                            ${oldPriceHtml}
                        </div>
                    </div>
                    ${item.save ? `<div class="save-badge">${item.save}</div>` : ''}
                `;
            }

            card.innerHTML = content;
            card.onclick = () => {
                grid.querySelectorAll('.premium-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                triggerOriginal(item);
            };
            grid.appendChild(card);
        });
        container.appendChild(grid);
    };

    const injectUI = () => {
        if (document.getElementById('react-store-injected')) return;

        const win = window as any;
        if (win.WHMCS && win.WHMCS.http) {
            const originalPost = win.WHMCS.http.post;
            win.WHMCS.http.post = function(url: string, data: any, callback: any, dataType: any) {
                if (url.includes('cart.php')) url = '/api/fragment?path=' + encodeURIComponent(url);
                return originalPost.call(this, url, data, callback, dataType);
            };
        }

        if (win.jQuery) {
            const $ = win.jQuery;
            const originalAjax = $.ajax;
            $.ajax = function(urlOrSettings: any, settings: any) {
                let url = typeof urlOrSettings === 'string' ? urlOrSettings : urlOrSettings.url;
                if (url && url.includes('cart.php')) {
                    const proxyUrl = '/api/fragment?path=' + encodeURIComponent(url);
                    if (typeof urlOrSettings === 'string') urlOrSettings = proxyUrl;
                    else urlOrSettings.url = proxyUrl;
                }
                return originalAjax.call(this, urlOrSettings, settings);
            };
        }
        
        const billingData = scrapeSection('Choose Billing Cycle');
        const osData = scrapeSection('Operating System');
        const locData = scrapeSection('Server Location');
        const cpData = scrapeSection('Control Panel');

        if (osData.length === 0 && locData.length === 0) return;

        const titles = Array.from(document.querySelectorAll('h2, .section-title, h3, .section-main-title'));

        // 2. INJECT BILLING
        const billingTitle = titles.find(t => t.textContent?.includes('Choose Billing Cycle'));
        if (billingTitle && !document.getElementById('react-billing-ui')) {
            const section = billingTitle.closest('.section');
            if (section) section.querySelector('.section-body')?.classList.add('hidden-original');
            const wrapper = document.createElement('div');
            wrapper.id = 'react-billing-ui';
            renderGrid(billingData, wrapper, 'billing');
            billingTitle.after(wrapper);
        }

        // 3. INJECT OS & TABS
        const osTitle = titles.find(t => t.textContent?.includes('Operating System'));
        if (osTitle && !document.getElementById('react-os-ui')) {
            const section = osTitle.closest('.section');
            if (section) section.querySelector('.section-body')?.classList.add('hidden-original');
            const wrapper = document.createElement('div');
            wrapper.id = 'react-os-ui';
            
            const tabs = document.createElement('div');
            tabs.className = 'premium-tabs';
            tabs.innerHTML = `
                <div class="premium-tab active" data-tab="plain">Plain OS</div>
                <div class="premium-tab" data-tab="cp">Control Panel</div>
                <div class="premium-tab" data-tab="apps">Applications</div>
            `;
            const gridContainer = document.createElement('div');
            renderGrid(osData, gridContainer, 'os');

            tabs.querySelectorAll('.premium-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.querySelectorAll('.premium-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const type = tab.getAttribute('data-tab');
                    if (type === 'plain') renderGrid(osData, gridContainer, 'os');
                    else if (type === 'cp') renderGrid(cpData.filter(i => !i.save), gridContainer, 'os');
                    else renderGrid(cpData.filter(i => i.save || i.name.length < 15), gridContainer, 'os');
                });
            });

            wrapper.appendChild(tabs);
            wrapper.appendChild(gridContainer);
            osTitle.after(wrapper);
        }

        // 4. INJECT LOCATION
        const locTitle = titles.find(t => t.textContent?.includes('Server Location'));
        if (locTitle && !document.getElementById('react-loc-ui')) {
            const section = locTitle.closest('.section');
            if (section) section.querySelector('.section-body')?.classList.add('hidden-original');
            const wrapper = document.createElement('div');
            wrapper.id = 'react-loc-ui';
            renderGrid(locData, wrapper, 'loc');
            locTitle.after(wrapper);
        }
        // 5. HIDE REDUNDANT
        document.querySelectorAll('input[name="billingcycle"], input[name^="configoption["], input[name^="addons["]').forEach(input => {
            const section = input.closest('.section, .panel-check-group, .panel-check');
            if (section && !section.id.includes('react-')) {
                section.classList.add('hidden-original');
            }
        });

        const hideTitles = ['Control Panel', 'cPanel Licenses', 'ispmanager licenses', 'Plesk Licenses', 'No Control Panel'];
        hideTitles.forEach(text => {
            titles.find(t => t.textContent?.trim().toLowerCase() === text.toLowerCase())?.closest('.section')?.classList.add('hidden-original');
        });

        document.body.insertAdjacentHTML('beforeend', '<div id="react-store-injected" style="display:none"></div>');
    };

    const observer = new MutationObserver(() => injectUI());
    observer.observe(document.body, { childList: true, subtree: true });
    injectUI();

    // Global fail-safe for summary updates
    const summaryInterval = setInterval(() => {
        const lastItem = (window as any)._lastSelectedItem;
        if (lastItem) updateSummaryManually(lastItem);
    }, 1000);

    return () => {
        observer.disconnect();
        clearInterval(summaryInterval);
        if ((window as any)._summaryObserver) (window as any)._summaryObserver.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <FragmentPage key={`${fragmentName}-${slug}`} fragmentName={fragmentName} slug={slug} subSlug={subSlug} />
    </>
  );
}
