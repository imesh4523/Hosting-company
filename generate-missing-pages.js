const fs = require('fs');
const path = require('path');

const baseDir = './frontend/src/app/dashboard';
const publicDir = './frontend/public';

const pagesToCreate = [
    { route: 'billing', staticHtml: 'payment-methods-static.html' },
    { route: 'services', staticHtml: 'services-static.html' },
    { route: 'support', staticHtml: 'support-static.html' },
    { route: 'cart', staticHtml: 'cart-static.html' },
    { route: 'domains', staticHtml: 'domains-static.html' }
];

// Ensure fallback HTML exists
pagesToCreate.forEach(page => {
    const staticHtmlPath = path.join(publicDir, page.staticHtml);
    if (!fs.existsSync(staticHtmlPath)) {
        console.log(`Creating fallback static HTML for ${page.staticHtml}`);
        const template = fs.readFileSync(path.join(publicDir, 'dashboard-static.html'), 'utf8');
        fs.writeFileSync(staticHtmlPath, template, 'utf8');
    }
});

// Create Next.js pages
pagesToCreate.forEach(page => {
    const dirPath = path.join(baseDir, page.route);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const pageContent = `'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ${page.route.charAt(0).toUpperCase() + page.route.slice(1)}Page() {
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
        src="/${page.staticHtml}" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="${page.route} Dashboard"
      />
    </div>
  );
}
`;
    fs.writeFileSync(path.join(dirPath, 'page.tsx'), pageContent, 'utf8');
    console.log(`Created Next.js page for /dashboard/${page.route}`);
});

// Also create mapping for Next.js proxy if there was any mismatch
console.log('All missing pages generated to prevent 404s.');
