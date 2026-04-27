const fs = require('fs');
const path = require('path');

const publicDir = './frontend/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

const routerScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
    const routeMap = {
        'action=details': '/dashboard/account/details',
        'action=contacts': '/dashboard/account/contacts',
        'action=emails': '/dashboard/account/emails',
        'action=security': '/dashboard/account/security',
        'action=masspay': '/dashboard/billing',
        'action=addfunds': '/dashboard/billing',
        'action=invoices': '/dashboard/billing',
        'submitticket.php': '/dashboard/support',
        'supporttickets.php': '/dashboard/support',
        'cart.php': '/dashboard/cart',
        'logout.php': '/login',
        'clientarea.php': '/dashboard'
    };

    document.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.startsWith('javascript:')) return;
            
            for (const [key, route] of Object.entries(routeMap)) {
                if (href.includes(key)) {
                    e.preventDefault();
                    if (window.parent && window.parent !== window) {
                        window.parent.location.href = route;
                    } else {
                        window.location.href = route;
                    }
                    return;
                }
            }
        });
    });
});
</script>
`;

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Inject if not already present
    if (!html.includes('const routeMap = {')) {
        html = html.replace('</body>', routerScript + '\n</body>');
        fs.writeFileSync(filePath, html, 'utf8');
        console.log('Injected router script into:', file);
    }
});
