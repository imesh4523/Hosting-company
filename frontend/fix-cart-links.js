const fs = require('fs');
let content = fs.readFileSync('src/app/api/fragment/route.ts', 'utf8');

// Remove the bad ultahost.com/cart redirect
content = content.replace(/html = html\.replace\(\/href=\"cart\\\.php\[\^\"\]\*\"\/g,\s*'href=\"https:\/\/ultahost\.com\/cart\"'\);\n?/g, '');

// Add the new correct ones at the end of the Cart PHP rewrites block
const newBlock = `  html = html.replace(/href="\\/cart\\.php\\?a=checkout"/g,          'href="/dashboard/cart/checkout"');
  html = html.replace(/href="\\/cart\\.php\\?a=confproduct&amp;i=\\d+"/g, 'href="/dashboard/cart/configure"');
  html = html.replace(/href="cart\\.php\\?a=checkout"/g,            'href="/dashboard/cart/checkout"');
  html = html.replace(/href="cart\\.php\\?a=confproduct&amp;i=\\d+"/g,   'href="/dashboard/cart/configure"');
  html = html.replace(/href="\\/cart\\.php[^"]*"/g,                 'href="/dashboard/cart"');
  html = html.replace(/href="cart\\.php[^"]*"/g,                   'href="/dashboard/cart"');`;

content = content.replace(/html = html\.replace\(\/href=\"cart\\\.php\\\?a=confproduct&i=\\d\+\"\/g,\s*'href=\"\/dashboard\/cart\/configure\"'\);/, newBlock);

fs.writeFileSync('src/app/api/fragment/route.ts', content);
