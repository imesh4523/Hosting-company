import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

// Map of route path → fragment name used in API
const routes = [
    { path: 'billing/invoices', fragment: 'invoices' },
    { path: 'billing/quotes', fragment: 'quotes' },
    { path: 'billing/addfunds', fragment: 'addfunds' },
    { path: 'billing/masspay', fragment: 'masspay' },
    { path: 'services', fragment: 'services' },
    { path: 'domains', fragment: 'domains' },
    { path: 'affiliates', fragment: 'affiliates' },
    { path: 'announcements', fragment: 'announcements' },
    { path: 'serverstatus', fragment: 'serverstatus' },
    { path: 'tickets', fragment: 'tickets' },
    { path: 'tickets/new', fragment: 'tickets' },
    { path: 'downloads', fragment: 'downloads' },
    { path: 'kb', fragment: 'knowledgebase' },
    { path: 'account/details', fragment: 'security' },
    { path: 'account/contacts', fragment: 'security' },
    { path: 'account/emails', fragment: 'security' },
    { path: 'account/paymentmethods', fragment: 'security' },
    { path: 'domains/dns', fragment: 'domains' },
    { path: 'details', fragment: 'security' },
];

function makePageContent(fragmentName) {
    return `'use client';
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [html, setHtml] = useState('');
  
  useEffect(() => {
    // Fetch the full page: sidebar + this page's content combined
    fetch('/api/fragment?name=fullpage&page=${fragmentName}')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load content.</div>'));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
`;
}

let created = 0;
routes.forEach(r => {
    const dir = path.join(baseDir, r.path);
    const pagePath = path.join(dir, 'page.tsx');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(pagePath, makePageContent(r.fragment));
    created++;
    console.log(`✅ /dashboard/${r.path} → fragment: ${r.fragment}`);
});

// Update main dashboard page too
const mainPage = `'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [html, setHtml] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }

    fetch('/api/fragment?name=fullpage&page=main')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load dashboard.</div>'));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
`;
fs.writeFileSync(path.join(baseDir, 'page.tsx'), mainPage);
console.log(`✅ /dashboard (main)`);
console.log(`\nTotal: ${created + 1} routes updated. All use fullpage API.`);
