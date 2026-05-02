import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

const newRoutes = [
    { path: 'cart/configure', fragment: 'cart_configure' },
    { path: 'cart/checkout', fragment: 'cart_checkout' },
    { path: 'tools/dns', fragment: 'dns_manager' },
    { path: 'tools/resolution', fragment: 'resolution_center' }
];

function makePageContent(fragmentName) {
    return `'use client';
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [html, setHtml] = useState('<div style="padding:40px;text-align:center">Loading Order Details...</div>');
  
  useEffect(() => {
    fetch('/api/fragment?name=fullpage&page=${fragmentName}')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load order process.</div>'));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
`;
}

newRoutes.forEach(r => {
    const dir = path.join(baseDir, r.path);
    const pagePath = path.join(dir, 'page.tsx');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(pagePath, makePageContent(r.fragment));
    console.log(`✅ Created route: /dashboard/${r.path}`);
});
