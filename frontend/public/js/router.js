document.addEventListener('DOMContentLoaded', function() {
    const routeMap = {
        'action=details': '/dashboard/account/details',
        'account/users': '/dashboard/account/users',
        'account/paymentmethods': '/dashboard/billing',
        'action=contacts': '/dashboard/account/contacts',
        'account/contacts': '/dashboard/account/contacts',
        'action=security': '/dashboard/account/security',
        'action=emails': '/dashboard/account/emails',
        'user/profile': '/dashboard/account/details',
        'user/accounts': '/dashboard/account/details',
        'user/password': '/dashboard/account/security',
        'user/security': '/dashboard/account/security',
        
        'action=masspay': '/dashboard/billing',
        'action=addfunds': '/dashboard/billing',
        'action=invoices': '/dashboard/billing',
        'action=quotes': '/dashboard/billing',
        'billing': '/dashboard/billing',
        
        'services': '/dashboard/services',
        'domains': '/dashboard/domains',
        
        'submitticket.php': '/dashboard/support',
        'supporttickets.php': '/dashboard/support',
        'announcements': '/dashboard/support',
        'serverstatus.php': '/dashboard/support',
        'download': '/dashboard/support',
        
        'cart.php': '/dashboard/cart',
        'store': '/dashboard/services',
        
        'logout.php': '/login',
        'login': '/login',
        
        'clientarea.php': '/dashboard',
        '/dashboard': '/dashboard'
    };

    document.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.startsWith('javascript:')) return;
            
            // Check if it matches our route map
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
            
            // If it's an ultahost link that we didn't explicitly map, catch it and send to dashboard
            // so we don't accidentally navigate to the real site
            if (href.includes('bill.ultahost.com')) {
                e.preventDefault();
                console.log('Intercepted ultahost link:', href);
                if (window.parent && window.parent !== window) {
                    window.parent.location.href = '/dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            }
        });
    });
});
