import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

const securityRoutes = [
    { path: 'security/ssl', fragment: 'ssl_certificates' },
    { path: 'security/backup', fragment: 'website_backup' },
    { path: 'security/seo', fragment: 'seo_tools' },
    { path: 'security/malware', fragment: 'website_security' },
    { path: 'security/manage-ssl', fragment: 'manage_ssl' }
];

function makePageContent(fragmentName) {
    return `'use client';
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [html, setHtml] = useState('<div style="padding:40px;text-align:center">Loading...</div>');
  
  useEffect(() => {
    fetch('/api/fragment?name=fullpage&page=${fragmentName}')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load content.</div>'));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
`;
}

securityRoutes.forEach(r => {
    const dir = path.join(baseDir, r.path);
    const pagePath = path.join(dir, 'page.tsx');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(pagePath, makePageContent(r.fragment));
    console.log(`✅ Created security route: /dashboard/${r.path}`);
});
