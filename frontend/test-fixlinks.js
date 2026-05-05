const fs = require('fs');

function fixLinks(html) {
  html = html.replace(/https:\/\/bill\.youuhost\.com\//g, '');
  html = html.replace(/https:\/\/bill\.youuhost\.com/g, '');

  html = html.replace(/clientarea\.php\?action=invoices/g, '/dashboard/billing/invoices');
  html = html.replace(/clientarea\.php\?action=quotes/g, '/dashboard/billing/quotes');
  html = html.replace(/clientarea\.php\?action=addfunds/g, '/dashboard/billing/addfunds');
  html = html.replace(/clientarea\.php\?action=masspay/g, '/dashboard/billing/masspay');
  html = html.replace(/clientarea\.php\?action=services/g, '/dashboard/services');
  html = html.replace(/clientarea\.php\?action=domains/g, '/dashboard/domains');
  html = html.replace(/clientarea\.php\?action=details/g, '/dashboard/account/details');
  html = html.replace(/clientarea\.php\?action=contacts/g, '/dashboard/account/contacts');
  html = html.replace(/clientarea\.php\?action=emails/g, '/dashboard/account/emails');
  html = html.replace(/clientarea\.php\?action=paymentmethods/g, '/dashboard/account/paymentmethods');
  html = html.replace(/clientarea\.php\?action=addcontact/g, '/dashboard/account/contacts');
  html = html.replace(/clientarea\.php\?action=security/g, '/dashboard/account/security');
  html = html.replace(/clientarea\.php/g, '/dashboard');

  html = html.replace(/href="affiliates\.php"/g, 'href="/dashboard/affiliates"');
  html = html.replace(/href="knowledgebase\.php[^"]*"/g, 'href="/dashboard/kb"');
  html = html.replace(/href="announcements\.php[^"]*"/g, 'href="/dashboard/announcements"');
  html = html.replace(/href="serverstatus\.php[^"]*"/g, 'href="/dashboard/serverstatus"');
  html = html.replace(/href="downloads\.php[^"]*"/g, 'href="/dashboard/downloads"');
  html = html.replace(/href="supporttickets\.php[^"]*"/g, 'href="/dashboard/tickets"');
  html = html.replace(/href="submitticket\.php[^"]*"/g, 'href="/dashboard/tickets/new"');
  html = html.replace(/href="cart\.php[^"]*"/g, 'href="https://youuhost.com/cart"');
  html = html.replace(/href="domainchecker\.php[^"]*"/g, 'href="https://youuhost.com/domains"');

  html = html.replace(/href="index\.php\?m=DNSManager3"/g, 'href="/dashboard/tools/dns"');
  html = html.replace(/href="index\.php\?rp=\/store\/ssl-certificates"/g, 'href="/dashboard/security/ssl"');
  html = html.replace(/href="index\.php\?rp=\/store\/codeguard"/g, 'href="/dashboard/security/backup"');
  html = html.replace(/href="index\.php\?rp=\/store\/marketgoo"/g, 'href="/dashboard/security/seo"');
  html = html.replace(/href="index\.php\?rp=\/store\/sitelock"/g, 'href="/dashboard/security/malware"');
  html = html.replace(/href="index\.php\?rp=\/clientarea\/ssl-certificates\/manage"/g, 'href="/dashboard/security/manage-ssl"');
  html = html.replace(/href="index\.php\?rp=\/announcements"/g, 'href="/dashboard/tools/resolution"');
  html = html.replace(/href="index\.php[^"]*"/g, 'href="/dashboard"');

  html = html.replace(/href="\/account\/users"/g, 'href="/dashboard/account/users"');
  html = html.replace(/href="\/account\/paymentmethods"/g, 'href="/dashboard/account/paymentmethods"');
  html = html.replace(/href="\/account\/contacts"/g, 'href="/dashboard/account/contacts"');
  html = html.replace(/href="\/account\/security"/g, 'href="/dashboard/account/security"');
  html = html.replace(/href="\/account\/details"/g, 'href="/dashboard/account/details"');
  html = html.replace(/href="\/account\/emails"/g, 'href="/dashboard/account/emails"');
  html = html.replace(/href="\/account[^"]*"/g, 'href="/dashboard/account/details"');

  html = html.replace(/href="\/user\/profile"/g, 'href="/dashboard/user/profile"');
  html = html.replace(/href="\/user\/accounts"/g, 'href="/dashboard"');
  html = html.replace(/href="\/user\/password"/g, 'href="/dashboard/user/password"');
  html = html.replace(/href="\/user\/security"/g, 'href="/dashboard/account/security"');
  html = html.replace(/href="\/user[^"]*"/g, 'href="/dashboard"');

  html = html.replace(/href="\/logout\.php"/g, 'href="/api/auth/logout"');

  html = html.replace(/action="\/\/dashboard/g, 'action="/dashboard');
  html = html.replace(/value="\/\/dashboard/g, 'value="/dashboard');
  html = html.replace(/href="\/\/dashboard\?rsstyle=[^"]+"/g, 'href="#"');
  html = html.replace(/href="\/\/dashboard\?language=[^"]+"/g, 'href="#"');

  html = html.replace(/href="\/\/dashboard"/g, 'href="/dashboard"');
  html = html.replace(/href="\/\/dashboard\//g, 'href="/dashboard/');

  html = html.replace(/href="\/dashboard#[^"]*"/g, 'href="/dashboard"');

  html = html.replace(/href="\/store\/ssl-certificaties"/g, 'href="https://youuhost.com/ssl-certificates"');
  html = html.replace(/href="\/store\/([^"]+)"/g, 'href="https://youuhost.com/$1"');
  html = html.replace(/href="\/cart\/domain\/renew"/g, 'href="https://youuhost.com/domains"');
  html = html.replace(/href="\/youuhost-assets\/index\.php[^"]*"/g, 'href="https://youuhost.com/store"');

  html = html.replace(/href="\/dashboard\/billing\/masspay&amp;all=true"/g, 'href="/dashboard/billing/masspay"');

  html = html.replace(/href="cart\.php\?a=checkout"/g, 'href="/dashboard/cart/checkout"');
  html = html.replace(/href="cart\.php\?a=confproduct&i=\d+"/g, 'href="/dashboard/cart/configure"');

  html = html.replace(/Romania Srilanka/g, 'User');

  if (html.includes('Primary_Navbar-Affiliates') && !html.includes('Primary_Navbar-Resolution_Center')) {
    html = html.replace(
      /(<li menuitemname="Affiliates"[^>]*>[\s\S]*?<\/li>)/,
      '$1<li menuitemname="Resolution Center" class="" id="Primary_Navbar-Resolution_Center"><a href="/dashboard/tools/resolution"><i class="fas fa-exclamation-triangle"></i><span class="item-text">Resolution Center</span></a></li>'
    );
  }

  if (html.includes('Primary_Navbar-Dashboard') && !html.includes('Primary_Navbar-App_Deploy')) {
    html = html.replace(
      /(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/,
      '$1<li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy"><a href="/dashboard/app-deploy"><i class="fas fa-rocket"></i><span class="item-text">App Deploy</span></a></li>'
    );
  }

  html = html.replace(/(<a[^>]+href="\/dashboard#[^"]*"[^>]*>)/g,
    (match) => match.replace(/href="[^"]*"/, 'href="/dashboard"'));

  html = html.replace(/src="modules\//g, 'src="/youuhost-assets/modules/');
  html = html.replace(/href="modules\//g, 'href="/youuhost-assets/modules/');

  html = html.replace(/href="(?!http|https|\/|#|mailto|tel|javascript)([^"]+)"/g,
    (match, relPath) => {
      if (relPath.endsWith('.php') || relPath.includes('.php?')) {
        return 'href="/dashboard"';
      }
      return match;
    });

  return html;
}

const content = fs.readFileSync('../backend/fragments/nav.html', 'utf8');
const fixed = fixLinks(content);
const links = fixed.match(/href="[^"]*"/g);
fs.writeFileSync('fixed-links.txt', links.join('\n'));
console.log('Wrote fixed links.');
