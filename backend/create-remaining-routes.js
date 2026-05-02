import fs from 'fs';
import path from 'path';

const baseDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard';

const routes = [
    { path: 'affiliates', fragment: 'affiliatesFragment' },
    { path: 'kb', fragment: 'knowledgebaseFragment' },
    { path: 'announcements', fragment: 'announcementsFragment' },
    { path: 'serverstatus', fragment: 'network_statusFragment' },
    { path: 'downloads', fragment: 'downloadsFragment' },
    { path: 'details', fragment: 'securityFragment' }
];

routes.forEach(r => {
    const dir = path.join(baseDir, r.path);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const depth = r.path.split('/').length;
    const prefix = '../'.repeat(depth);
    
    const content = `'use client';
import React, { useState, useEffect } from 'react';
import { ${r.fragment} } from '${prefix}fragments';

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
    fs.writeFileSync(path.join(dir, 'page.tsx'), content);
    console.log(`Created route: /dashboard/${r.path}`);
});
