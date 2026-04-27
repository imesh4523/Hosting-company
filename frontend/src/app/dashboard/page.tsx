'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Map of action params → Next.js routes
const ACTION_ROUTES: Record<string, string> = {
  details: '/dashboard/account/details',
  security: '/dashboard/account/security',
  emails: '/dashboard/account/emails',
  contacts: '/dashboard/account/contacts',
  masspay: '/dashboard/billing',
  addfunds: '/dashboard/billing',
  quotes: '/dashboard/billing',
};

function DashboardContent() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }

    // Handle action query params (e.g. /dashboard?action=details)
    const action = searchParams.get('action');
    if (action && ACTION_ROUTES[action]) {
      router.replace(ACTION_ROUTES[action]);
      return;
    }

    // Handle paste for HTML injection (dev tool)
    const handlePaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && text.includes('<html')) {
        console.log('Detected HTML paste, saving...');
        await fetch('/api/save-html', { method: 'POST', body: text });
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [searchParams]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#fdfdfd' }}>
      <iframe
        ref={iframeRef}
        src="/dashboard-static.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Customer Dashboard"
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
