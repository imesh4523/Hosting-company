import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const FRAGMENTS_DIR = path.join(process.cwd(), '..', 'backend', 'fragments');

const fragmentMap: Record<string, string> = {
  // Main dashboard
  'main': 'main.html',
  // Billing
  'invoices': 'invoices.html',
  'quotes': 'quotes.html',
  'addfunds': 'addfunds.html',
  'masspay': 'masspay.html',
  'manage_credit_card': 'invoices.html',
  // Services & Domains
  'services': 'services.html',
  'domains': 'domains.html',
  'vps': 'services.html',
  // Support
  'tickets': 'tickets.html',
  'support': 'tickets.html',
  'knowledgebase': 'knowledgebase.html',
  // Other main nav
  'affiliates': 'affiliates.html',
  'announcements': 'announcements.html',
  'serverstatus': 'network-status.html',
  'downloads': 'downloads.html',
  // Security sub-pages
  'security': 'security.html',
  'account_security': 'security.html',
  'ssl_certificates': 'ssl-certificates.html',
  'website_backup': 'website-backup.html',
  'seo_tools': 'seo-tools.html',
  'website_security': 'website-security.html',
  'manage_ssl': 'manage-ssl.html',
  // Account sub-pages
  'details': 'account-details.html',
  'contacts': 'account-contacts.html',
  'emails': 'account-emails.html',
  'paymentmethods': 'account-paymentmethods.html',
  'users': 'account-users.html',
  // User pages
  'user_profile': 'account-details.html',
  'user_password': 'user-password.html',
  // Support
  'support': 'support.html',
  'knowledgebase': 'knowledgebase.html',
  // Network status
  'serverstatus': 'network-status.html',
  'announcements': 'announcements.html',
  // Cart
  'cart_configure': 'cart-configure.html',
  'cart_checkout': 'cart-checkout.html',
  // Tools
  'dns_manager': 'dns-manager.html',
  'resolution_center': 'resolution-center.html',
  // Nav
  'nav': 'nav.html',
  // Store / affiliated / website-security → show announcements as placeholder
  'store': 'announcements.html',
  'affiliated': 'affiliates.html',
  'website_security_page': 'website-security.html',
};

// Country name → ISO2 code for flagcdn.com
const FLAG_MAP: Record<string, string> = {
  'germany':'de','France':'fr','france':'fr','united-kingdom':'gb','netherlands':'nl',
  'sweden':'se','poland':'pl','switzerland':'ch','spain':'es','norway':'no','italy':'it',
  'turkey':'tr','us':'us','canada':'ca','brazil':'br','australia':'au','india':'in',
  'japan':'jp','singapore':'sg','south-korea':'kr','hong-kong-sar-china':'hk',
  'united-arab-emirates':'ae','south-africa':'za','finland':'fi','denmark':'dk',
  'austria':'at','belgium':'be','portugal':'pt','czech':'cz','hungary':'hu','romania':'ro'
};

function fixLinks(html: string): string {
  // ── 0. Country flag URLs ────────────────────────────────────────────────────
  html = html.replace(/https?:\/\/bill\.youuhost\.com\/templates\/flags-new\/Country=([^"'.]+)\.svg/g, 
    (_, country) => {
      const iso = FLAG_MAP[country] || FLAG_MAP[country.toLowerCase()];
      const src = iso ? `https://flagcdn.com/48x36/${iso}.png` : '';
      if (!src) return '';
      // Return a circular flag — inline styles for reliable rendering
      return `${src}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;box-shadow:0 1px 4px rgba(0,0,0,0.18);display:inline-block;vertical-align:middle;border:none;background:#f0f0f0`;
    });

  // ── 1. Asset path rewrites (do this BEFORE stripping domain) ──────────────
  html = html.replace(/https:\/\/bill\.youuhost\.com\/templates\//g, '/ultahost-assets/templates/');
  html = html.replace(/https:\/\/bill\.youuhost\.com\/assets\//g, '/ultahost-assets/assets/');
  html = html.replace(/https:\/\/bill\.youuhost\.com\/modules\//g, '/ultahost-assets/modules/');

  html = html.replace(/https:\/\/bill\.youuhost\.com\//g, '/');
  html = html.replace(/https:\/\/bill\.youuhost\.com/g, '');
  html = html.replace(/https:\/\/youuhost\.com\//g, '/');
  html = html.replace(/https:\/\/youuhost\.com/g, '');

  // Fix bare relative asset paths
  html = html.replace(/href="\/templates\//g, 'href="/ultahost-assets/templates/');
  html = html.replace(/src="\/templates\//g, 'src="/ultahost-assets/templates/');
  html = html.replace(/href="\/assets\//g, 'href="/ultahost-assets/assets/');
  html = html.replace(/src="\/assets\//g, 'src="/ultahost-assets/assets/');
  html = html.replace(/href="\/modules\//g, 'href="/ultahost-assets/modules/');
  html = html.replace(/src="\/modules\//g, 'src="/ultahost-assets/modules/');
  html = html.replace(/href="templates\//g, 'href="/ultahost-assets/templates/');
  html = html.replace(/src="templates\//g, 'src="/ultahost-assets/templates/');
  html = html.replace(/href="assets\//g, 'href="/ultahost-assets/assets/');
  html = html.replace(/src="assets\//g, 'src="/ultahost-assets/assets/');
  
  // Clean up WHMCS variables
  html = html.replace(/{userName}/g, 'User');
  html = html.replace(/`n/g, ''); // Remove stray powershell/string artifacts
  html = html.replace(/\\n/g, '');

  // ── 2. Fix specific store links to be relative ─────────────────────────────
  html = html.replace(/href="\/store\//g, 'href="/store/');

  // ── 2. clientarea.php action rewrites ────────────────────────────────────
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

  // ── 3. PHP page rewrites ─────────────────────────────────────────────────
  html = html.replace(/href="affiliates\.php"/g, 'href="/dashboard/affiliates"');
  html = html.replace(/href="knowledgebase\.php[^"]*"/g, 'href="/dashboard/kb"');
  html = html.replace(/href="announcements\.php[^"]*"/g, 'href="/dashboard/announcements"');
  html = html.replace(/href="serverstatus\.php[^"]*"/g, 'href="/dashboard/serverstatus"');
  html = html.replace(/href="downloads\.php[^"]*"/g, 'href="/dashboard/downloads"');
  html = html.replace(/href="supporttickets\.php[^"]*"/g, 'href="/dashboard/tickets"');
  html = html.replace(/href="submitticket\.php[^"]*"/g, 'href="/dashboard/tickets/new"');
  html = html.replace(/href="domainchecker\.php[^"]*"/g, 'href="https://youuhost.com/domains"');

  // ── 4. index.php rewrites ────────────────────────────────────────────────
  html = html.replace(/href="index\.php\?m=DNSManager3"/g, 'href="/dashboard/tools/dns"');
  html = html.replace(/href="index\.php\?rp=\/store\/ssl-certificates"/g, 'href="/dashboard/security/ssl"');
  html = html.replace(/href="index\.php\?rp=\/store\/codeguard"/g, 'href="/dashboard/security/backup"');
  html = html.replace(/href="index\.php\?rp=\/store\/marketgoo"/g, 'href="/dashboard/security/seo"');
  html = html.replace(/href="index\.php\?rp=\/store\/sitelock"/g, 'href="/dashboard/security/malware"');
  html = html.replace(/href="index\.php\?rp=\/clientarea\/ssl-certificates\/manage"/g, 'href="/dashboard/security/manage-ssl"');
  html = html.replace(/href="index\.php\?rp=\/announcements"/g, 'href="/dashboard/tools/resolution"');
  html = html.replace(/href="index\.php[^"]*"/g, 'href="/dashboard"');

  // ── 5. /account/* → /dashboard/account/* ─────────────────────────────────
  html = html.replace(/href="\/account\/users"/g, 'href="/dashboard/account/users"');
  html = html.replace(/href="\/account\/paymentmethods"/g, 'href="/dashboard/account/paymentmethods"');
  html = html.replace(/href="\/account\/contacts"/g, 'href="/dashboard/account/contacts"');
  html = html.replace(/href="\/account\/security"/g, 'href="/dashboard/account/security"');
  html = html.replace(/href="\/account\/details"/g, 'href="/dashboard/account/details"');
  html = html.replace(/href="\/account\/emails"/g, 'href="/dashboard/account/emails"');
  html = html.replace(/href="\/account[^"]*"/g, 'href="/dashboard/account/details"');

  // ── 6. /user/* → /dashboard/user/* ───────────────────────────────────────
  html = html.replace(/href="\/user\/profile"/g, 'href="/dashboard/user/profile"');
  html = html.replace(/href="\/user\/accounts"/g, 'href="/dashboard"');
  html = html.replace(/href="\/user\/password"/g, 'href="/dashboard/user/password"');
  html = html.replace(/href="\/user\/security"/g, 'href="/dashboard/account/security"');
  html = html.replace(/href="\/user[^"]*"/g, 'href="/dashboard"');

  // ── 7. Logout ─────────────────────────────────────────────────────────────
  html = html.replace(/href="\/logout\.php"/g, 'href="/api/auth/logout"');

  // ── 8. Protocol-relative URLs (//) ───────────────────────────────────────
  html = html.replace(/action="\/\/dashboard/g, 'action="/dashboard');
  html = html.replace(/value="\/\/dashboard/g, 'value="/dashboard');
  html = html.replace(/href="\/\/dashboard\?rsstyle=[^"]+"/g, 'href="#"');
  html = html.replace(/href="\/\/dashboard\?language=[^"]+"/g, 'href="#"');

  // Replace bare //dashboard exactly, but leave //dashboard/services alone to be fixed later
  html = html.replace(/href="\/\/dashboard"/g, 'href="/dashboard"');
  html = html.replace(/href="\/\/dashboard\//g, 'href="/dashboard/');

  // ── 9. /dashboard# hash stripping ────────────────────────────────────────
  html = html.replace(/href="\/dashboard#[^"]*"/g, 'href="/dashboard"');

  // 10. Store
  html = html.replace(/href="\/store\/ssl-certificaties"/g, 'href="/dashboard/security/ssl"');
  html = html.replace(/href="\/store\/codeguard"/g, 'href="/dashboard/security/backup"');
  html = html.replace(/href="\/store\/marketgoo"/g, 'href="/dashboard/security/seo"');
  html = html.replace(/href="\/store\/sitelock"/g, 'href="/dashboard/security/malware"');
  html = html.replace(/href="\/clientarea\/ssl-certificates\/manage"/g, 'href="/dashboard/security/manage-ssl"');
  html = html.replace(/href="\/store\/([^"]+)"/g, 'href="/store/$1"');
  html = html.replace(/href="\/youuhost-assets\/index\.php[^"]*"/g, 'href="https://youuhost.com/store"');

  // ── 11. Masspay extra params ──────────────────────────────────────────────
  html = html.replace(/href="\/dashboard\/billing\/masspay&amp;all=true"/g, 'href="/dashboard/billing/masspay"');

  // ── 12. Cart PHP rewrites ─────────────────────────────────────────────────
  html = html.replace(/href="cart\.php\?a=checkout"/g, 'href="/dashboard/cart/checkout"');
  html = html.replace(/href="\/cart\.php\?a=checkout"/g, 'href="/dashboard/cart/checkout"');
  html = html.replace(/href="\/cart\.php\?a=confproduct&amp;i=\d+"/g, 'href="/dashboard/cart/configure"');
  html = html.replace(/href="cart\.php\?a=checkout"/g, 'href="/dashboard/cart/checkout"');
  html = html.replace(/href="cart\.php\?a=confproduct&amp;i=\d+"/g, 'href="/dashboard/cart/configure"');
  html = html.replace(/href="\/cart\.php[^"]*"/g, 'href="/dashboard/cart"');
  html = html.replace(/href="cart\.php[^"]*"/g, 'href="/dashboard/cart"');

  // ── 13. User display name ─────────────────────────────────────────────────
  html = html.replace(/Romania Srilanka/g, 'User');

  // ── 14. Sidebar injection: Resolution Center ─────────────────────────────
  if (html.includes('Primary_Navbar-Affiliates') && !html.includes('Primary_Navbar-Resolution_Center')) {
    html = html.replace(
      /(<li menuitemname="Affiliates"[^>]*>[\s\S]*?<\/li>)/,
      '$1<li menuitemname="Resolution Center" class="" id="Primary_Navbar-Resolution_Center"><a href="/dashboard/tools/resolution"><i class="fas fa-exclamation-triangle"></i><span class="item-text">Resolution Center</span></a></li>'
    );
  }

  // ── 15. Sidebar injection: App Deploy ────────────────────────────────────
  if (html.includes('Primary_Navbar-Dashboard') && !html.includes('Primary_Navbar-App_Deploy')) {
    html = html.replace(
      /(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/,
      `$1<li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy"><a href="/dashboard/app-deploy"><i><img src="data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' fill='%23a1a5b7' xmlns='http://www.w3.org/2000/svg'><path d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'/></svg>" style="width:22px; height:22px; opacity:0.8; vertical-align:-3px;" /></i><span class="item-text">App Deploy</span></a></li>`
    );
  }

  // ── 16. Strip hash from /dashboard# anchor tags ───────────────────────────
  html = html.replace(/(<a[^>]+href="\/dashboard#[^"]*"[^>]*>)/g,
    (match) => match.replace(/href="[^"]*"/, 'href="/dashboard"'));

  // ── 17. Fix relative modules/ paths ──────────────────────────────────────
  html = html.replace(/src="modules\//g, 'src="/ultahost-assets/modules/');
  html = html.replace(/href="modules\//g, 'href="/ultahost-assets/modules/');

  // ── 18. Catch-all: any remaining bare relative href (no leading /) ────────
  // These cause ERR_NAME_NOT_RESOLVED - treat as dashboard
  html = html.replace(/href="(?!http|https|\/|#|mailto|tel|javascript)([^"]+)"/g,
    (match, relPath) => {
      // Already handled PHP files above, but just in case
      if (relPath.endsWith('.php') || relPath.includes('.php?')) {
        return 'href="/dashboard"';
      }
      return match;
    });

  // ── 19. Hide Support PIN ─────────────────────────────────────────────────
  if (html.includes('menuitemname="Support PIN"')) {
    html += '<style>[menuitemname="Support PIN"] { display: none !important; }</style>';
  }

  // ── 20. Replace broken ls icons with fas icons ─────────────────────────────
  html = html.replace(/<i class="ls ls-document"><\/i>/g, '<i class="fas fa-file-invoice-dollar" style="font-size: 28px; opacity: 0.6; padding: 4px;"></i>');
  html = html.replace(/<i class="ls ls-hosting"><\/i>/g, '<i class="fas fa-server" style="font-size: 28px; opacity: 0.6; padding: 4px;"></i>');
  html = html.replace(/<i class="ls ls-dns"><\/i>/g, '<i class="fas fa-globe" style="font-size: 28px; opacity: 0.6; padding: 4px;"></i>');
  html = html.replace(/<i class="ls ls-ticket-tag"><\/i>/g, '<i class="fas fa-ticket-alt" style="font-size: 28px; opacity: 0.6; padding: 4px;"></i>');
  html = html.replace(/<i class="ls ls-text-cloud"><\/i>/g, '<i class="fas fa-comments" style="font-size: 28px; opacity: 0.6; padding: 4px;"></i>');
  html = html.replace(/<i class="ls ls-basket"><\/i>/g, '<i class="fas fa-shopping-basket"></i>');

  // ── 21. Empty Cart 'Start Shopping' link ──────────────────────────────────
  html = html.replace(/(<a[^>]+href=")[^"]*dashboard\/cart([^"]*"[^>]*>)\s*Start Shopping\s*<\/a>/gi, '$1http://localhost:3000/store/ultasecurity$2Start Shopping</a>');
  html = html.replace(/(<a[^>]+href=")[^"]*cart\.php([^"]*"[^>]*>)\s*Start Shopping\s*<\/a>/gi, '$1http://localhost:3000/store/ultasecurity$2Start Shopping</a>');

  // ── 22. Fix sidebar sub-items styling ──────────────────────────────────────
  const sidebarStyle = `
    <style>
      .hdcProSide {
        max-height: 70vh;
        overflow-y: auto;
        scrollbar-width: thin;
      }
      .hdcProSide::-webkit-scrollbar {
        width: 4px;
      }
      .hdcProSide::-webkit-scrollbar-thumb {
        background: #e0e0e0;
        border-radius: 4px;
      }
      /* Hide non-essential categories for a cleaner look */
      [id*="Categories-Radio_Hosting"],
      [id*="Categories-Android_Emulator_VPS"],
      [id*="Categories-ISPmanager_Panel_Licence"],
      [id*="Categories-Server_Optimization"],
      [id*="Categories-Internet_Radio_Reseller"],
      [id*="Categories-10Gps_Dedicated_Servers"],
      [id*="Categories-Cloud_Email"],
      [id*="Categories-symantec"] {
        display: none !important;
      }
      
      .hdcProSide .list-group-item {
        position: relative;
        display: block;
        padding: 12px 20px;
        background-color: #fff;
        border: none;
        font-weight: 500;
        color: #4e5d78;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .hdcProSide .list-group-item i {
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        background: #f0f2f5;
        color: #4a6cf7;
        border-radius: 50%;
        margin-right: 12px;
        font-size: 14px;
      }
      .hdcProSide .collapse {
        display: none !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      .hdcProSide .collapse.show,
      .hdcProSide .collapse.in {
        display: block !important;
        height: auto !important;
        max-height: 2000px !important;
        overflow: visible !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .hdcProSide ul.collapse {
        padding-left: 0;
        margin-bottom: 0;
        background: #f8f9fa;
      }
      .hdcProSide ul.collapse li {
        list-style: none;
      }
      .hdcProSide ul.collapse li a {
        display: flex;
        align-items: center;
        padding: 8px 10px 8px 40px;
        color: #6c757d;
        font-size: 13px;
        text-decoration: none;
        transition: all 0.2s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .hdcProSide ul.collapse li a:hover {
        color: #4a6cf7;
        background: #f0f2f5;
      }
      .hdcProSide ul.collapse li a i,
      .hdcProSide ul.collapse > li > a > i {
        background: transparent !important;
        background-color: transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        width: 16px !important;
        height: auto !important;
        min-width: 16px !important;
        line-height: normal !important;
        margin-right: 6px !important;
        padding: 0 !important;
        font-size: 13px !important;
        color: #6c757d !important;
        display: inline-block !important;
        text-align: center !important;
        flex-shrink: 0 !important;
      }
      /* Ensure chevrons are visible if present */
      .hdcProSide .list-group-item[data-toggle="collapse"]::after {
        content: "\\f078";
        font-family: "Font Awesome 5 Free";
        font-weight: 900;
        float: right;
        font-size: 12px;
        margin-top: 10px;
        transition: transform 0.3s;
      }
      .hdcProSide .list-group-item[aria-expanded="true"]::after {
        transform: rotate(180deg);
      }
      .hdcProSide .list-group-item.collapsed::after {
        transform: rotate(0deg);
      }
    </style>
  `;
  html += sidebarStyle;

  return html;
}

function buildFullPage(navHtml: string, pageHtml: string): string {
  const fixedNav = fixLinks(navHtml);
  const fixedPage = fixLinks(pageHtml);
  const splitPoint = fixedNav.indexOf('<div class="app-main');
  const sidebarOnly = splitPoint !== -1 ? fixedNav.substring(0, splitPoint) : fixedNav;
  return `<div class="lagom lagom-layout-left lagom-modern page-clientareahome page-user-logged">${sidebarOnly}<div class="app-main ">${fixedPage}</div></div>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'main';

  // ── nav: sidebar only ────────────────────────────────────────────────────
  if (name === 'nav') {
    const filePath = path.join(FRAGMENTS_DIR, 'nav.html');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'nav.html not found' }, { status: 404 });
    }
    let html = fs.readFileSync(filePath, 'utf8');
    html = fixLinks(html);
    const splitPoint = html.indexOf('<div class="app-main');
    const navOnly = splitPoint !== -1 ? html.substring(0, splitPoint) : html;
    return new NextResponse(navOnly, { headers: { 'Content-Type': 'text/html' } });
  }

  // ── header: top bar ──────────────────────────────────────────────────────
  if (name === 'header') {
    const filePath = path.join(FRAGMENTS_DIR, 'nav.html');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'nav.html not found' }, { status: 404 });
    }
    let html = fs.readFileSync(filePath, 'utf8');
    html = fixLinks(html);
    const appMainStart = html.indexOf('<div class="app-main');
    const mainContentStart = html.indexOf('<div class="main-content');
    if (appMainStart !== -1 && mainContentStart !== -1) {
      return new NextResponse(html.substring(appMainStart, mainContentStart), { headers: { 'Content-Type': 'text/html' } });
    }
    return new NextResponse('', { headers: { 'Content-Type': 'text/html' } });
  }

  // ── fullpage: sidebar + page content ─────────────────────────────────────
  if (name === 'fullpage') {
    const pageName = searchParams.get('page') || 'main';
    const slug = searchParams.get('slug');
    const navPath = path.join(FRAGMENTS_DIR, 'nav.html');
    const pageFile = fragmentMap[pageName];

    if (!pageFile) {
      return NextResponse.json({ error: `Fragment '${pageName}' not mapped` }, { status: 404 });
    }
    if (!fs.existsSync(navPath)) {
      return NextResponse.json({ error: 'nav.html not found' }, { status: 404 });
    }
    const pageFilePath = path.join(FRAGMENTS_DIR, pageFile);
    if (!fs.existsSync(pageFilePath)) {
      return NextResponse.json({ error: `Page file '${pageFile}' not found` }, { status: 404 });
    }
    const navHtml = fs.readFileSync(navPath, 'utf8');
    let pageHtml = fs.readFileSync(pageFilePath, 'utf8');

    // Look for a local store page
    if (slug && pageName === 'services' && pageFile === 'services.html') {
      // Try exact slug first, then fall back to linux variant for generic category slugs
      const fallbackMap: Record<string, string> = {
        'vps-hosting': 'linux-vps-hosting',
        'vds-hosting': 'linux-vds-hosting',
        'dedicated-hosting': 'dedicated-hosting',
        'reseller-hosting': 'linux-reseller-hosting',
        'game-servers': 'minecraft-game-server',
      };
      const lookupSlug = slug || '';
      const exactPath = path.join(FRAGMENTS_DIR, `store-${lookupSlug}.html`);
      const fallbackSlug = fallbackMap[lookupSlug];
      const fallbackPath = fallbackSlug ? path.join(FRAGMENTS_DIR, `store-${fallbackSlug}.html`) : null;

      if (fs.existsSync(exactPath)) {
        pageHtml = fs.readFileSync(exactPath, 'utf8');
      } else if (fallbackPath && fs.existsSync(fallbackPath)) {
        pageHtml = fs.readFileSync(fallbackPath, 'utf8');
      }
    }

    // Look for a local cart configuration page
    if (pageName === 'cart_configure' && slug && searchParams.get('subSlug')) {
      const subSlug = searchParams.get('subSlug');
      const cartHtmlPath = path.join(FRAGMENTS_DIR, `cart-configure-${subSlug}.html`);
      if (fs.existsSync(cartHtmlPath)) {
        pageHtml = fs.readFileSync(cartHtmlPath, 'utf8');
      }
    }

    if (pageName === 'cart_checkout') {
      let product = searchParams.get('product');
      let price = searchParams.get('price') || '20.50';
      const isEmpty = searchParams.get('empty') === '1' || !product;

      if (!product) product = 'MacOS VPS Hosting'; // Fallback name just in case it's used elsewhere

      if (isEmpty) price = '0.00';
      const gatewayCharge = isEmpty ? '0.00' : '0.62';
      const total = isEmpty ? '0.00' : (parseFloat(price) + 0.62).toFixed(2);

      pageHtml = `
      <div class="main-header">
          <div class="container">
              <h1 class="main-header-title" style="font-size:36px; font-weight:bold; margin-bottom:30px;">Review & Checkout</h1>
          </div>
      </div>
      <div class="main-body">
          <div class="container">
              <div class="main-content">
                  <div class="row">
                      <div class="col-md-8">
                          ${isEmpty ? `
                          <div class="panel panel-default text-center" style="border-radius:10px; border:1px solid #eee; padding:50px 20px; margin-bottom:30px;">
                              <i class="fas fa-shopping-cart" style="font-size:64px; color:#ddd; margin-bottom:20px;"></i>
                              <h2 style="font-size:24px; font-weight:bold; color:#333; margin-top:0; margin-bottom:10px;">Your Cart is Empty</h2>
                              <p style="color:#666; font-size:16px; margin-bottom:30px;">You have no items in your shopping cart.</p>
                              <a href="/store/vps-hosting" class="btn btn-primary btn-lg" style="background:#555bff; border:none; border-radius:25px; padding:12px 30px; font-weight:bold;">Return to Store</a>
                          </div>
                          ` : `
                          <div class="panel panel-default" style="border-radius:10px; border:1px solid #eee; padding:0; overflow:hidden; margin-bottom:30px;">
                              <table class="table" style="margin:0;">
                                  <thead style="background:#f8f9fa;">
                                      <tr>
                                          <th style="padding:15px 20px; font-weight:normal; color:#666; border-bottom:1px solid #eee;">Product/Options</th>
                                          <th style="padding:15px 20px; font-weight:normal; color:#666; border-bottom:1px solid #eee; text-align:right;">Price/Cycle</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      <tr>
                                          <td style="padding:25px 20px; border-bottom:1px solid #eee;">
                                              <strong style="font-size:16px; display:block; margin-bottom:5px;">${product}</strong>
                                              <a href="#" style="color:#555bff; font-size:14px; text-decoration:none;">srv560484038.host</a>
                                              
                                              <div style="margin-top:15px; font-size:13px; color:#666; line-height:1.8;">
                                                  Server Location: <strong style="color:#333;">Frankfurt, Germany</strong><br/>
                                                  Guest OS Version: <strong style="color:#333;">Ventura</strong><br/>
                                                  Additional Disk: <strong style="color:#333;">0 x $0.11USD</strong><br/>
                                                  Additional IPv4 Addresses: <strong style="color:#333;">0 x $5.00USD</strong><br/>
                                                  Additional CPU: <strong style="color:#333;">0 x $10.00USD</strong><br/>
                                                  Guest OS Family: <strong style="color:#333;">macOS</strong>
                                              </div>
                                          </td>
                                          <td style="padding:25px 20px; border-bottom:1px solid #eee; text-align:right;">
                                              <div style="display:inline-block; border:1px solid #ddd; border-radius:20px; padding:8px 15px; font-weight:bold;">$${price}USD/mo ▼</div>
                                              <div style="margin-top:15px; color:#999; font-size:18px;">
                                                  <a href="/store/vps-hosting" style="color:inherit; text-decoration:none;"><i class="fas fa-pencil-alt" style="margin-right:15px; cursor:pointer;"></i></a>
                                                  <a href="/store/checkout?empty=1" style="color:inherit; text-decoration:none;"><i class="fas fa-trash" style="cursor:pointer;"></i></a>
                                              </div>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                              <div style="padding:15px 20px; background:#fff; display:flex; justify-content:space-between; align-items:center;">
                                  <a href="/store/vps-hosting" class="btn btn-default" style="border-radius:20px; padding:8px 20px; border:1px solid #ddd; color:#333; text-decoration:none; font-weight:500;">← Continue Shopping</a>
                                  <a href="/store/checkout?empty=1" class="btn btn-default" style="border-radius:20px; padding:8px 20px; border:1px solid #ddd; color:#333; text-decoration:none; font-weight:500;"><i class="fas fa-trash"></i> Empty Cart</a>
                              </div>
                          </div>
                          
                          <h3 style="margin-top:30px; font-size:22px; font-weight:normal; margin-bottom:20px;">Promotion</h3>
                          <div style="background:#555bff; border-radius:10px; padding:25px; display:flex; gap:15px; align-items:center;">
                              <div style="flex:1; background:white; border-radius:5px; display:flex; align-items:center; padding:0 15px;">
                                  <i class="fas fa-tag" style="color:#555bff; margin-right:10px;"></i>
                                  <input type="text" placeholder="Enter promo code if you have one" style="border:none; outline:none; width:100%; padding:15px 0;">
                              </div>
                              <button style="background:rgba(255,255,255,0.2); color:white; border:none; border-radius:5px; padding:15px 25px; font-weight:bold; cursor:pointer;">Validate Code</button>
                          </div>
                          `}
                      </div>
                      
                      <div class="col-md-4">
                          <div class="panel panel-default" style="background:#fafbfc; border:1px solid #eee; border-radius:10px; padding:30px; position:sticky; top:20px;">
                              <h3 style="margin-top:0; font-size:24px; margin-bottom:30px; font-weight:normal;">Order Summary</h3>
                              <div style="display:flex; justify-content:space-between; margin-bottom:15px; color:#666; font-size:14px;">
                                  <span>Subtotal</span>
                                  <span>$${price}USD</span>
                              </div>
                              <hr style="border-top:1px solid #eaeaea; margin:15px 0;">
                              <div style="margin-bottom:15px; color:#666; font-size:14px;">Totals</div>
                              <div style="display:flex; justify-content:space-between; margin-bottom:15px; color:#666; font-size:14px;">
                                  <span>Monthly</span>
                                  <span>$${price}USD</span>
                              </div>
                              <hr style="border-top:1px solid #eaeaea; margin:15px 0;">
                              <div style="display:flex; justify-content:space-between; margin-bottom:30px; color:#666; font-size:14px;">
                                  <span>Gateway Charge</span>
                                  <span>$${gatewayCharge}USD</span>
                              </div>
                              <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:flex-end;">
                                  <span style="color:#666; font-size:14px; padding-bottom:5px;">Total Due Today</span>
                                  <strong style="font-size:32px; color:#111;">$${total} <span style="font-size:16px;">USD</span></strong>
                              </div>
                              ${isEmpty ? `
                              <button disabled class="btn btn-block" style="background:#ccc; border:none; border-radius:8px; padding:15px; font-weight:bold; font-size:16px; margin-top:20px; width:100%; color:white; cursor:not-allowed;">
                                  ➔ Checkout
                              </button>
                              ` : `
                              <a href="/login" class="btn btn-primary btn-block" style="background:#555bff; border:none; border-radius:8px; padding:15px; font-weight:bold; font-size:16px; margin-top:20px; display:flex; justify-content:center; align-items:center; text-decoration:none; color:white;">
                                  ➔ Checkout
                              </a>
                              `}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      `;
    }

    const combined = buildFullPage(navHtml, pageHtml);
    return new NextResponse(combined, { headers: { 'Content-Type': 'text/html' } });
  }

  // ── legacy: direct fragment name ─────────────────────────────────────────
  const fileName = fragmentMap[name];
  if (!fileName) {
    return NextResponse.json({ error: `Fragment '${name}' not found` }, { status: 404 });
  }
  const filePath = path.join(FRAGMENTS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  let html = fs.readFileSync(filePath, 'utf8');
  html = fixLinks(html);
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}








