import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FRAGMENTS_DIR = path.join(process.cwd(), '..', 'backend', 'fragments');

const fragmentMap: Record<string, string> = {
  'main': 'main.html',
  'invoices': 'invoices.html',
  'quotes': 'quotes.html',
  'addfunds': 'addfunds.html',
  'masspay': 'masspay.html',
  'services': 'services.html',
  'domains': 'domains.html',
  'affiliates': 'affiliates.html',
  'announcements': 'announcements.html',
  'serverstatus': 'network-status.html',
  'downloads': 'downloads.html',
  'tickets': 'tickets.html',
  'knowledgebase': 'knowledgebase.html',
  'security': 'security.html',
  'nav': 'nav.html',
  'ssl_certificates': 'ssl-certificates.html',
  'website_backup': 'website-backup.html',
  'seo_tools': 'seo-tools.html',
  'website_security': 'website-security.html',
  'manage_ssl': 'manage-ssl.html',
  'cart_configure': 'cart-configure.html',
  'cart_checkout': 'cart-checkout.html',
  'dns_manager': 'dns-manager.html',
  'resolution_center': 'resolution-center.html',
};

function fixLinks(html: string): string {
  html = html.replace(/https:\/\/bill\.ultahost\.com/g, '');
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
  html = html.replace(/clientarea\.php/g, '/dashboard');
  html = html.replace(/href="affiliates\.php"/g, 'href="/dashboard/affiliates"');
  html = html.replace(/href="knowledgebase\.php"/g, 'href="/dashboard/kb"');
  html = html.replace(/href="announcements\.php"/g, 'href="/dashboard/announcements"');
  html = html.replace(/href="serverstatus\.php"/g, 'href="/dashboard/serverstatus"');
  html = html.replace(/href="downloads\.php"/g, 'href="/dashboard/downloads"');
  html = html.replace(/href="supporttickets\.php"/g, 'href="/dashboard/tickets"');
  html = html.replace(/href="submitticket\.php"/g, 'href="/dashboard/tickets/new"');
  html = html.replace(/href="\/logout\.php"/g, 'href="/api/auth/logout"');
  html = html.replace(/action="\/\/dashboard/g, 'action="/dashboard');
  html = html.replace(/value="\/\/dashboard/g, 'value="/dashboard');
  html = html.replace(/href="\/\/dashboard\?rsstyle=[^"]+"/g, 'href="#"');
  html = html.replace(/href="\/\/dashboard\?language=[^"]+"/g, 'href="#"');
  html = html.replace(/href="\/\/dashboard/g, 'href="/dashboard');
  html = html.replace(/Romania Srilanka/g, 'User');
  // Fix ssl-certificaties typo & store links → ultahost.com
  html = html.replace(/href="\/store\/ssl-certificaties"/g, 'href="https://ultahost.com/ssl-certificates"');
  html = html.replace(/href="\/store\/([^"]+)"/g, 'href="https://ultahost.com/$1"');
  // Fix cart.php links → ultahost.com/cart
  html = html.replace(/href="cart\.php[^"]*"/g, 'href="https://ultahost.com/cart"');
  html = html.replace(/href="\/cart\/domain\/renew"/g, 'href="https://ultahost.com/domains"');
  // Fix domainchecker.php
  html = html.replace(/href="domainchecker\.php[^"]*"/g, 'href="https://ultahost.com/domains"');
  // Fix index.php portal
  html = html.replace(/href="index\.php\?m=DNSManager3"/g, 'href="/dashboard/domains/dns"');
  html = html.replace(/href="index\.php[^"]*"/g, 'href="/dashboard"');
  // Fix ultahost-assets/index.php store links
  html = html.replace(/href="\/ultahost-assets\/index\.php[^"]*"/g, 'href="https://ultahost.com/store"');
  // Fix account/paymentmethods
  html = html.replace(/href="\/account\/paymentmethods"/g, 'href="/dashboard/account/paymentmethods"');
  // Fix masspay with extra params
  html = html.replace(/href="\/dashboard\/billing\/masspay&amp;all=true"/g, 'href="/dashboard/billing/masspay"');

  
  html = html.replace(/href="index\.php\?rp=\/store\/ssl-certificates"/g, 'href="/dashboard/security/ssl"');
  html = html.replace(/href="index\.php\?rp=\/store\/codeguard"/g, 'href="/dashboard/security/backup"');
  html = html.replace(/href="index\.php\?rp=\/store\/marketgoo"/g, 'href="/dashboard/security/seo"');
  html = html.replace(/href="index\.php\?rp=\/store\/sitelock"/g, 'href="/dashboard/security/malware"');
  html = html.replace(/href="index\.php\?rp=\/clientarea\/ssl-certificates\/manage"/g, 'href="/dashboard/security/manage-ssl"');

  
  html = html.replace(/href="cart\.php\?a=checkout"/g, 'href="/dashboard/cart/checkout"');
  html = html.replace(/href="cart\.php\?a=confproduct&i=\d+"/g, 'href="/dashboard/cart/configure"');
  html = html.replace(/href="index\.php\?m=DNSManager3"/g, 'href="/dashboard/tools/dns"');
  html = html.replace(/href="index\.php\?rp=\/announcements"/g, 'href="/dashboard/tools/resolution"');
  
  // Resolution Center Sidebar Item
  if (html.includes('Primary_Navbar-Affiliates') && !html.includes('Primary_Navbar-Resolution_Center')) {
    html = html.replace(
      /(<li menuitemname="Affiliates"[^>]*>[\s\S]*?<\/li>)/,
      '$1<li menuitemname="Resolution Center" class="" id="Primary_Navbar-Resolution_Center"><a href="/dashboard/tools/resolution"><i class="fas fa-exclamation-triangle"></i><span class="item-text">Resolution Center</span></a></li>'
    );
  }

  // Inject App Deploy link after Dashboard item in nav
  if (html.includes('Primary_Navbar-Dashboard') && !html.includes('Primary_Navbar-App_Deploy')) {
    html = html.replace(
      /(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/,
      '$1<li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy"><a href="/dashboard/app-deploy"><i class="fas fa-rocket"></i><span class="item-text">App Deploy</span></a></li>'
    );
  }
  return html;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'main';

  // Special case: 'nav' = sidebar only (everything BEFORE app-main div)
  if (name === 'nav') {
    const filePath = path.join(FRAGMENTS_DIR, 'nav.html');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'nav.html not found' }, { status: 404 });
    }
    let html = fs.readFileSync(filePath, 'utf8');
    html = fixLinks(html);
    // Split at <div class="app-main"> and take only the sidebar part
    const splitPoint = html.indexOf('<div class="app-main');
    const navOnly = splitPoint !== -1 ? html.substring(0, splitPoint) : html;
    return new NextResponse(navOnly, { headers: { 'Content-Type': 'text/html' } });
  }

  // Special case: 'header' = the top bar inside app-main (before main-content)
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

  // Return named fragment as full page: nav sidebar + this page's main content
  if (name === 'fullpage') {
    const pageName = searchParams.get('page') || 'main';
    const navPath = path.join(FRAGMENTS_DIR, 'nav.html');
    const pageFile = fragmentMap[pageName];
    if (!pageFile || !fs.existsSync(navPath)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const pageFilePath = path.join(FRAGMENTS_DIR, pageFile);
    if (!fs.existsSync(pageFilePath)) {
      return NextResponse.json({ error: 'Page file not found' }, { status: 404 });
    }
    let navHtml = fs.readFileSync(navPath, 'utf8');
    navHtml = fixLinks(navHtml);
    let pageHtml = fs.readFileSync(pageFilePath, 'utf8');
    pageHtml = fixLinks(pageHtml);
    // Split nav at app-main to get sidebar only
    const splitPoint = navHtml.indexOf('<div class="app-main');
    const sidebarOnly = splitPoint !== -1 ? navHtml.substring(0, splitPoint) : navHtml;
    // Return sidebar + full page fragment
    const combined = `<div class="lagom lagom-layout-left lagom-modern page-clientareahome page-user-logged">${sidebarOnly}<div class="app-main ">${pageHtml}</div></div>`;
    return new NextResponse(combined, { headers: { 'Content-Type': 'text/html' } });
  }


  if (!fileName) {
    return NextResponse.json({ error: 'Fragment not found' }, { status: 404 });
  }

  const filePath = path.join(FRAGMENTS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  let html = fs.readFileSync(filePath, 'utf8');
  html = fixLinks(html);

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
