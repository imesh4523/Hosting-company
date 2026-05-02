import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

const routes = [
    { path: 'billing/addfunds', fragment: 'addfundsFragment' },
    { path: 'billing/masspay', fragment: 'masspayFragment' },
    { path: 'tickets', fragment: 'ticketsFragment' }
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
    setContent(${r.fragment}.replace(/{userName}/g, 'User'));
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}
`;
    // For nested routes like billing/addfunds, we need to go up more levels for fragments
    const depth = r.path.split('/').length;
    const prefix = '../'.repeat(depth);
    const updatedContent = content.replace('../../fragments', `${prefix}fragments`);

    fs.writeFileSync(path.join(dir, 'page.tsx'), updatedContent);
    console.log(`Created route: /dashboard/${r.path}`);
});
