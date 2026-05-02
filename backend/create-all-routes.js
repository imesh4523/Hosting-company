import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

// Every route that needs a page.tsx
const routes = [
    { path: 'billing/invoices', fragment: 'invoicesFragment' },
    { path: 'billing/quotes', fragment: 'quotesFragment' },
    { path: 'billing/addfunds', fragment: 'addfundsFragment' },
    { path: 'billing/masspay', fragment: 'masspayFragment' },
    { path: 'services', fragment: 'servicesFragment' },
    { path: 'domains', fragment: 'domainsFragment' },
    { path: 'account/details', fragment: 'securityFragment' },
    { path: 'account/contacts', fragment: 'securityFragment' },
    { path: 'account/emails', fragment: 'securityFragment' },
    { path: 'account/paymentmethods', fragment: 'securityFragment' },
    { path: 'affiliates', fragment: 'affiliatesFragment' },
    { path: 'kb', fragment: 'knowledgebaseFragment' },
    { path: 'announcements', fragment: 'announcementsFragment' },
    { path: 'serverstatus', fragment: 'network_statusFragment' },
    { path: 'downloads', fragment: 'downloadsFragment' },
    { path: 'tickets', fragment: 'ticketsFragment' },
    { path: 'tickets/new', fragment: 'ticketsFragment' },
    { path: 'domains/dns', fragment: 'domainsFragment' },
];

function makePageContent(fragment) {
    return `'use client';
import React, { useState, useEffect } from 'react';
import { ${fragment} } from '@/app/dashboard/fragments';

export default function Page() {
  const [content, setContent] = useState('');
  useEffect(() => {
    if (typeof ${fragment} !== 'undefined') {
      setContent(${fragment}.replace(/{userName}/g, 'User'));
    }
  }, []);
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
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
    console.log(`✅ /dashboard/${r.path}`);
});

console.log(`\nCreated/updated ${created} routes.`);
