import fs from 'fs';
import path from 'path';

const fragApi = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\api\\fragment\\route.ts';
let content = fs.readFileSync(fragApi, 'utf8');

// Add new mappings for cart and tools
const newMappings = `
  'cart_configure': 'cart-configure.html',
  'cart_checkout': 'cart-checkout.html',
  'dns_manager': 'dns-manager.html',
  'resolution_center': 'resolution-center.html',`;

content = content.replace(/'manage_ssl': 'manage-ssl\.html',/, `'manage_ssl': 'manage-ssl.html',${newMappings}`);

// Add specific link mappings for cart and sidebars
const cartFixes = `
  html = html.replace(/href="cart\\.php\\?a=checkout"/g, 'href="/dashboard/cart/checkout"');
  html = html.replace(/href="cart\\.php\\?a=confproduct&i=\\d+"/g, 'href="/dashboard/cart/configure"');
  html = html.replace(/href="index\\.php\\?m=DNSManager3"/g, 'href="/dashboard/tools/dns"');
  html = html.replace(/href="index\\.php\\?rp=\\/announcements"/g, 'href="/dashboard/tools/resolution"');
  
  // Resolution Center Sidebar Item
  if (html.includes('Primary_Navbar-Affiliates') && !html.includes('Primary_Navbar-Resolution_Center')) {
    html = html.replace(
      /(<li menuitemname="Affiliates"[^>]*>[\\s\\S]*?<\\/li>)/,
      '$1<li menuitemname="Resolution Center" class="" id="Primary_Navbar-Resolution_Center"><a href="/dashboard/tools/resolution"><i class="fas fa-exclamation-triangle"></i><span class="item-text">Resolution Center</span></a></li>'
    );
  }
`;

content = content.replace(/\/\/ Inject App Deploy link/, `${cartFixes}\n  // Inject App Deploy link`);

fs.writeFileSync(fragApi, content);
console.log('API route updated with Cart and Tools fragments.');
