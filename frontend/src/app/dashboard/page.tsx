'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [html, setHtml] = useState('<div style="padding:40px;text-align:center">Loading dashboard...</div>');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }

    fetch('/api/fragment?name=fullpage&page=main')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load dashboard.</div>'));
  }, []);

  useEffect(() => {
    // Remove any trailing # from the URL without causing navigation
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }

    // Intercept all internal link clicks to use Next.js router (prevents # hash issues)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      // Skip external, mailto, tel, and bare # links
      if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href === '#') return;
      // Handle internal dashboard links
      if (href.startsWith('/dashboard') || href.startsWith('/login') || href.startsWith('/api')) {
        if (href.startsWith('/api/auth/logout')) return; // let it go naturally
        e.preventDefault();
        // Strip hash fragment before navigating
        const cleanHref = href.split('#')[0];
        if (cleanHref && cleanHref !== window.location.pathname) {
          window.location.href = cleanHref;
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [html, router]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
