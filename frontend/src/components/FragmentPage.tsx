'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from './LoadingScreen';

interface FragmentPageProps {
  fragmentName: string;
  slug?: string;
  subSlug?: string;
}

// Map paths that come raw from fragment HTML to their correct /dashboard/* equivalents
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

// Returns true if the href is an internal app link (should use router)
function isInternalLink(href: string): boolean {
  if (!href) return false;
  if (href === '#') return false;
  if (href.startsWith('http://localhost')) return true;
  if (href.startsWith('https://')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
  if (href.startsWith('/dashboard') || href.startsWith('/login') || href.startsWith('/register')) return true;
  if (href.startsWith('/account') || href.startsWith('/user')) return true;
  if (href.startsWith('/store/')) return true;  // Store sub-pages
  return false;
}

export default function FragmentPage({ fragmentName, slug, subSlug }: FragmentPageProps) {
  const router = useRouter();
  const [html, setHtml] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Load HTML fragment
  useEffect(() => {
    setLoaded(false);
    const query = new URLSearchParams({ name: 'fullpage', page: fragmentName, t: String(Date.now()) });
    if (slug) query.append('slug', slug);
    if (subSlug) query.append('subSlug', subSlug);
    
    // Pass any additional query parameters (like product and price for checkout)
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.forEach((val, key) => query.append(key, val));

    fetch(`/api/fragment?${query.toString()}`, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(content => {
        setHtml(content);
        setLoaded(true);
      })
      .catch((err) => {
        setHtml(`<div style="padding:40px;color:red;font-family:sans-serif">Failed to load content. (${err.message})</div>`);
        setLoaded(true);
      });
  }, [fragmentName, slug]);

  // Click interceptor — runs whenever html changes (so new DOM nodes are covered)
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');

    // 🔍 DEBUG — open Chrome DevTools Console to see this
    console.log('[CLICK]', {
      targetTag:   (e.target as HTMLElement).tagName,
      targetText:  (e.target as HTMLElement).innerText?.slice(0, 40),
      anchorText:  anchor.innerText?.slice(0, 40),
      href,
      isInternal:  isInternalLink(href || ''),
    });

    if (!href || href === '#' || href === '') return;

    // Let logout go through naturally
    if (href.includes('/api/auth/logout')) return;

    // Skip external links
    if (href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

    if (isInternalLink(href)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();  // prevent other capture listeners interfering

      // Strip hash
      let cleanHref = href.split('#')[0];
      if (!cleanHref) { cleanHref = '/dashboard'; }

      // Apply path remappings for /account/* and /user/*
      const remapped = PATH_REDIRECTS[cleanHref];
      const finalHref = remapped || cleanHref;

      if (finalHref && finalHref !== window.location.pathname) {
        // Fallback to native browser navigation to absolutely guarantee the page updates
        // This completely avoids any Next.js client caching or state synchronization bugs.
        window.location.href = finalHref;
      }
    }
  }, [router]);

  useEffect(() => {
    // Clean any trailing hash from current URL
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick, html]);

  // ── Sidebar collapse handler ──────────────────────────────────────────────
  // Must be done in React since script tags in innerHTML don't execute
  useEffect(() => {
    if (!html) return;

    const handleCollapseClick = (e: Event) => {
      const toggle = (e.target as HTMLElement).closest('[data-toggle="collapse"]') as HTMLElement | null;
      const sidebar = toggle?.closest('.hdcProSide');
      if (!toggle || !sidebar) return;

      e.preventDefault();
      e.stopPropagation();

      const targetSelector = toggle.getAttribute('data-target');
      if (!targetSelector) return;

      // Find target within the same sidebar to avoid ID conflicts
      const target = sidebar.querySelector(targetSelector) as HTMLElement | null;
      if (!target) {
          // Fallback to ID if not found within sidebar (for unusual cases)
          const globalTarget = document.querySelector(targetSelector) as HTMLElement | null;
          if (!globalTarget) return;
          globalTarget.classList.toggle('show');
          return;
      }

      const isShown = target.classList.contains('show') || target.classList.contains('in');

      // Close all open siblings first (accordion behaviour)
      sidebar.querySelectorAll('.collapse.show, .collapse.in').forEach(open => {
        open.classList.remove('show', 'in');
      });
      sidebar.querySelectorAll('[aria-expanded="true"]').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        t.classList.add('collapsed');
      });

      if (!isShown) {
        target.classList.add('show', 'in');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.remove('collapsed');
      }
    };

    document.addEventListener('click', handleCollapseClick, true);
    return () => document.removeEventListener('click', handleCollapseClick, true);
  }, [html]);

  return (
    <>
      {!loaded && <LoadingScreen />}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
