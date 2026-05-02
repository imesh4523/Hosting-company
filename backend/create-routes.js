import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

const routes = [
    { path: 'billing/invoices', fragment: 'invoicesFragment' },
    { path: 'billing/quotes', fragment: 'quotesFragment' },
    { path: 'services', fragment: 'servicesFragment' },
    { path: 'domains', fragment: 'domainsFragment' }
];

routes.forEach(r => {
    const dir = path.join(baseDir, r.path);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const content = `'use client';
import React, { useState, useEffect } from 'react';
import { ${r.fragment} } from '../../fragments';

export default function Page() {
  const [content, setContent] = useState('');

  useEffect(() => {
    // The fragment is the full .app-main content. 
    // We already have DashboardLayout wrapping it, so we need to extract only the inner content if needed,
    // but the current Layout wraps children inside a div.
    // Let's just render the fragment.
    setContent(${r.fragment}.replace(/{userName}/g, 'User'));
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}
`;
    fs.writeFileSync(path.join(dir, 'page.tsx'), content);
    console.log(`Created route: /dashboard/${r.path}`);
});
