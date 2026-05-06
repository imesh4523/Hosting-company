'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Module-level cache for the dashboard main fragment
let dashboardCache: string | null = null;

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [html, setHtml] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Serve from cache instantly (no spinner on back navigation)
    if (dashboardCache) {
      setHtml(dashboardCache);
      setLoaded(true);
      return;
    }

    fetch('/api/fragment?name=fullpage&page=main')
      .then(r => r.text())
      .then(content => {
        dashboardCache = content;
        setHtml(content);
        setLoaded(true);
      })
      .catch(() => {
        setHtml('<div style="padding:40px;color:red">Failed to load dashboard.</div>');
        setLoaded(true);
      });
  }, []);

  // Handle bfcache restore
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoaded(true);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href === '#') return;
      if (href.startsWith('/dashboard') || href.startsWith('/login') || href.startsWith('/api')) {
        if (href.startsWith('/api/auth/logout')) return;
        e.preventDefault();
        const cleanHref = href.split('#')[0];
        if (cleanHref && cleanHref !== window.location.pathname) {
          window.location.href = cleanHref;
        }
      }
    };

    const handlePopState = () => {
      // Force hard replacement to bypass the 15-second hang seen in video
      window.location.replace(window.location.href);
    };
    
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [html, router]);

  if (!mounted) return null;


  return (
    <>
      {!loaded && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', zIndex: 9999 }}>
          <div style={{ fontSize: 18, color: '#555' }}>Loading...</div>
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
