const fs = require('fs');
const path = require('path');

const publicDir = './frontend/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

const classMap = {
    'ls-caret': 'fa-caret-down',
    'lm-basket': 'fa-shopping-cart',
    'lm-bell': 'fa-bell',
    'lm-user': 'fa-user',
    'ls-info-circle': 'fa-info-circle',
    'ls-configure': 'fa-cog',
    'ls-wallet': 'fa-wallet',
    'ls-smartphone': 'fa-mobile-alt',
    'ls-shield': 'fa-shield-alt',
    'ls-envelope': 'fa-envelope',
    'ls-user': 'fa-user',
    'ls-padlock': 'fa-lock',
    'ls-security-code': 'fa-key',
    'ls-arrow-left-wall': 'fa-sign-out-alt',
    'lm-globe': 'fa-globe',
    'ls-dns': 'fa-network-wired',
    'ls-refresh': 'fa-sync',
    'ls-transfer': 'fa-exchange-alt',
    'ls-hosting': 'fa-server',
    'ls-box': 'fa-box',
    'ls-addon': 'fa-puzzle-piece',
    'ls-document': 'fa-file-alt',
    'ls-text-cloud': 'fa-comment',
    'ls-bank-note': 'fa-money-bill',
    'ls-credit-card': 'fa-credit-card',
    'ls-credit': 'fa-coins',
    'ls-search': 'fa-search',
    'ls-new-window': 'fa-external-link-alt',
    'ls-document-info': 'fa-file-signature',
    'ls-range': 'fa-sliders-h',
    'ls-download-square': 'fa-download',
    'ls-more': 'fa-ellipsis-h',
    'ls-basket': 'fa-shopping-cart',
    'ls-reply': 'fa-reply',
    'ls-close': 'fa-times',
    'ls-ticket-tag': 'fa-ticket-alt',
    'lm-search': 'fa-search',
    'lm-go-top': 'fa-arrow-up',
    'lm-close': 'fa-times',
    'ls-plus': 'fa-plus',
    'ls-copy': 'fa-copy'
};

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    html = html.replace(/class="([^"]*)"/g, (match, classes) => {
        let newClasses = classes;
        let changed = false;
        
        for (const [lagom, fa] of Object.entries(classMap)) {
            if (newClasses.includes(lagom)) {
                newClasses = newClasses.replace(new RegExp(lagom, 'g'), fa);
                changed = true;
            }
        }
        
        if (changed) {
            newClasses = newClasses.replace(/\bls\b/g, 'fas');
            newClasses = newClasses.replace(/\blm\b/g, 'fas');
            newClasses = newClasses.replace(/fab fa-test fas/g, 'fas');
        }
        
        return `class="${newClasses}"`;
    });
    
    fs.writeFileSync(filePath, html, 'utf8');
});
console.log('Fixed icon classes in all HTML files!');
