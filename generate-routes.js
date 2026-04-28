const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/src/app/dashboard';

const routes = [
  { path: 'announcements', static: '/announcements-static.html' },
  { path: 'serverstatus', static: '/server-status-static.html' },
  { path: 'downloads', static: '/downloads-static.html' },
  { path: 'kb', static: '/support-kb-static.html' },
];

const template = (staticFile) => `'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe 
        src="${staticFile}" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Dashboard"
      />
    </div>
  );
}
`;

routes.forEach(route => {
  const dir = path.join(baseDir, route.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(route.static));
  console.log(`Created route dashboard/${route.path}`);
});
