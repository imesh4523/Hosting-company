import fs from 'fs';
import path from 'path';

const fragApi = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\api\\fragment\\route.ts';
let content = fs.readFileSync(fragApi, 'utf8');

// Add new mappings to fragmentMap
const newMappings = `
  'ssl_certificates': 'ssl-certificates.html',
  'website_backup': 'website-backup.html',
  'seo_tools': 'seo-tools.html',
  'website_security': 'website-security.html',
  'manage_ssl': 'manage-ssl.html',`;

content = content.replace(/'nav': 'nav\.html',/, `'nav': 'nav.html',${newMappings}`);

// Add specific link mappings for the security items
const linkFixes = `
  html = html.replace(/href="index\\.php\\?rp=\\/store\\/ssl-certificates"/g, 'href="/dashboard/security/ssl"');
  html = html.replace(/href="index\\.php\\?rp=\\/store\\/codeguard"/g, 'href="/dashboard/security/backup"');
  html = html.replace(/href="index\\.php\\?rp=\\/store\\/marketgoo"/g, 'href="/dashboard/security/seo"');
  html = html.replace(/href="index\\.php\\?rp=\\/store\\/sitelock"/g, 'href="/dashboard/security/malware"');
  html = html.replace(/href="index\\.php\\?rp=\\/clientarea\\/ssl-certificates\\/manage"/g, 'href="/dashboard/security/manage-ssl"');
`;

content = content.replace(/\/\/ Inject App Deploy link/, `${linkFixes}\n  // Inject App Deploy link`);

fs.writeFileSync(fragApi, content);
console.log('API route updated with security pages.');
