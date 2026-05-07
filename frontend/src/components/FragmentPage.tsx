'use client';
import React, { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './LoadingScreen';

interface FragmentPageProps {
  fragmentName: string;
  slug?: string;
  subSlug?: string;
}

// Persistence helper
function getCache(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return sessionStorage.getItem('frag:' + key); } catch { return null; }
}
function setCache(key: string, val: string): void {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem('frag:' + key, val); } catch {}
}

const PATH_REDIRECTS: Record<string, string> = {
  '/account/users':          '/dashboard/account/users',
  '/account/paymentmethods': '/dashboard/account/paymentmethods',
  '/account/contacts':       '/dashboard/account/contacts',
  '/account/security':       '/dashboard/account/security',
  '/account/details':        '/dashboard/account/details',
  '/account/emails':         '/dashboard/account/emails',
  '/user/profile':           '/dashboard/user/profile',
  '/user/password':          '/dashboard/user/password',
  '/user/security':          '/dashboard/account/security',
  '/user/accounts':          '/dashboard',
};

function isInternalLink(href: string): boolean {
  if (!href || href === '#') return false;
  if (href.startsWith('http://localhost')) return true;
  
  // Legacy domains are internal
  if (href.includes('youuhost.com') || href.includes('ultahost.com')) return true;
  
  // Relative paths are internal
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  
  // Common protocols are external
  if (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
  
  return true;
}

export default function FragmentPage({ fragmentName, slug, subSlug }: FragmentPageProps) {
  const cacheKey = `${fragmentName}:${slug || ''}:${subSlug || ''}`;

  const [html, setHtml] = useState(() => getCache(cacheKey) || '');
  const [loaded, setLoaded] = useState(() => !!getCache(cacheKey));
  const [mounted, setMounted] = useState(false);

  // ── THE SIMPLE SOLUTION: AGGRESSIVE BACK-BUTTON RELOAD ──────────────────────
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Direct hard replacement to bypass any Next.js hang.
      // This is the "Simple Solution" the user requested.
      window.location.replace(window.location.href);
    };
    
    // Catch-all for browser navigation
    window.addEventListener('popstate', handlePopState);
    
    // Catch-all for BFcache (instant back-forward loads that might be stuck)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const fetchFragment = async (attempt = 0) => {
      try {
        const query = new URLSearchParams({
          name: 'fullpage',
          page: fragmentName,
          t:    String(Date.now()),
        });
        if (slug)    query.append('slug', slug);
        if (subSlug) query.append('subSlug', subSlug);

        const currentParams = new URLSearchParams(window.location.search);
        currentParams.forEach((val, key) => query.append(key, val));

        const r = await fetch(`/api/fragment?${query.toString()}`, { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const content = await r.text();
        
        if (content) {
          setCache(cacheKey, content);
          setHtml(content);
          setLoaded(true);
        }
      } catch (e) {
        if (attempt < 2) {
          setTimeout(() => fetchFragment(attempt + 1), 500);
        } else {
          setLoaded(true);
        }
      }
    };

    fetchFragment();
  }, [cacheKey, fragmentName, slug, subSlug]);

  const handleClick = useCallback((e: MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#' || !isInternalLink(href)) return;
    if (href.includes('/api/auth/logout')) return;

    e.preventDefault();

    let targetPath = href;
    try {
      // Strip legacy domains to make it relative
      if (href.includes('youuhost.com') || href.includes('ultahost.com') || href.includes('localhost')) {
        const url = new URL(href.startsWith('http') ? href : window.location.origin + (href.startsWith('/') ? '' : '/') + href);
        targetPath = url.pathname + url.search + url.hash;
      }
    } catch (e) {
      console.error('Link Parse Error:', e);
    }

    const [pathPart, queryPart] = targetPath.split('?');
    const [cleanPath, hashPart] = pathPart.split('#');
    
    let redirectedPath = PATH_REDIRECTS[cleanPath] || cleanPath;
    
    // If it's a cart.php link, ensure it goes to our store
    if (cleanPath === '/cart.php') {
      redirectedPath = '/store/ultasecurity';
    }

    let finalHref = redirectedPath;
    if (queryPart) finalHref += '?' + queryPart;
    if (hashPart) finalHref += '#' + hashPart;

    if (finalHref && finalHref !== (window.location.pathname + window.location.search + window.location.hash)) {
      window.location.href = finalHref;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick]);

  useEffect(() => {
    if (!html) return;
    const handleCollapse = (e: Event) => {
      const toggle = (e.target as HTMLElement).closest('[data-toggle="collapse"]') as HTMLElement | null;
      const sidebar = toggle?.closest('.hdcProSide');
      if (!toggle || !sidebar) return;
      e.preventDefault();
      const targetSelector = toggle.getAttribute('data-target');
      if (!targetSelector) return;
      const target = sidebar.querySelector(targetSelector) as HTMLElement | null;
      if (!target) return;
      const isShown = target.classList.contains('show') || target.classList.contains('in');
      sidebar.querySelectorAll('.collapse.show, .collapse.in').forEach(el => el.classList.remove('show', 'in'));
      sidebar.querySelectorAll('[aria-expanded="true"]').forEach(el => {
        el.setAttribute('aria-expanded', 'false');
        el.classList.add('collapsed');
      });
      if (!isShown) {
        target.classList.add('show', 'in');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.remove('collapsed');
      }
    };
    document.addEventListener('click', handleCollapse, true);
    return () => document.removeEventListener('click', handleCollapse, true);
  }, [html]);

  return (
    <>
      <style>{`
        .loading-overlay, .loading-screen, #loading-spinner { display: none !important; }
      `}</style>
      {mounted && !loaded && !html && <LoadingScreen />}
      <div 
        dangerouslySetInnerHTML={{ __html: html }} 
        suppressHydrationWarning={true}
      />
    </>
  );
}
