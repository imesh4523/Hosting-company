import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // ── Static HTML page rewrites ──────────────────────────────────────────
      { source: '/password/reset', destination: '/password-reset.html' },
      { source: '/password/:path*', destination: '/password-reset.html' },
      { source: '/login', destination: '/login.html' },
      { source: '/register', destination: '/register.html' },
      { source: '/register.php', destination: '/register' },
      { source: '/vds-hosting', destination: '/vds-hosting.html' },
      { source: '/gaming-hosting', destination: '/gaming-hosting.html' },
      { source: '/bluestacks-android-vps', destination: '/bluestacks-android-vps.html' },
      { source: '/crm-hosting', destination: '/crm-hosting.html' },
      { source: '/social-network-hosting', destination: '/social-network-hosting.html' },
      { source: '/login.php', destination: '/login' },

      // ── PHP relay to backend ───────────────────────────────────────────────
      { source: '/xhr.php', destination: 'http://localhost:5000/api/xhr.php' },

      // ── External asset proxies (bill.youuhost.com) ─────────────────────────
      { source: '/templates/:path*', destination: 'https://bill.youuhost.com/templates/:path*' },
      { source: '/assets/:path*', destination: 'https://bill.youuhost.com/assets/:path*' },
      { source: '/dashboard/templates/:path*', destination: 'https://bill.youuhost.com/templates/:path*' },
      { source: '/dashboard/assets/:path*', destination: 'https://bill.youuhost.com/assets/:path*' },
      { source: '/modules/:path*', destination: 'https://bill.youuhost.com/modules/:path*' },

      // ── Auth & logout ──────────────────────────────────────────────────────
      { source: '/api/auth/:path*', destination: 'http://localhost:5000/api/auth/:path*' },

      // ── PHP redirect rules → internal dashboard routes ─────────────────────
      { source: '/cart.php', destination: 'https://youuhost.com/cart' },
      { source: '/cart/:path*', destination: 'https://youuhost.com/cart' },
      { source: '/domainchecker.php', destination: 'https://youuhost.com/domains' },
      { source: '/index.php', destination: '/dashboard' },

      // ── /account/* → /dashboard/account/* (for any raw links that slip through) ──
      { source: '/account/paymentmethods', destination: '/dashboard/account/paymentmethods' },
      { source: '/account/contacts', destination: '/dashboard/account/contacts' },
      { source: '/account/users', destination: '/dashboard/account/users' },
      { source: '/account/security', destination: '/dashboard/account/security' },
      { source: '/account/emails', destination: '/dashboard/account/emails' },
      { source: '/account/details', destination: '/dashboard/account/details' },
      { source: '/account/:path*', destination: '/dashboard/account/:path*' },

      // ── /user/* → /dashboard/user/* ───────────────────────────────────────
      { source: '/user/profile', destination: '/dashboard/user/profile' },
      { source: '/user/password', destination: '/dashboard/user/password' },
      { source: '/user/security', destination: '/dashboard/account/security' },
      { source: '/user/accounts', destination: '/dashboard' },
      { source: '/user/:path*', destination: '/dashboard' },

      // ── Store / external PHP ───────────────────────────────────────────────
      { source: '/youuhost-assets/index.php', destination: 'https://youuhost.com/store' },

      // ── Support PHP files → internal routes ───────────────────────────────
      { source: '/submitticket.php', destination: '/dashboard/tickets/new' },
      { source: '/supporttickets.php', destination: '/dashboard/tickets' },
      { source: '/affiliates.php', destination: '/dashboard/affiliates' },
      { source: '/knowledgebase.php', destination: '/dashboard/kb' },
      { source: '/announcements.php', destination: '/dashboard/announcements' },
      { source: '/serverstatus.php', destination: '/dashboard/serverstatus' },
      { source: '/downloads.php', destination: '/dashboard/downloads' },

      // ── clientarea.php action rewrites ────────────────────────────────────
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'addfunds' }], destination: '/dashboard/billing/addfunds' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'invoices' }], destination: '/dashboard/billing/invoices' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'quotes' }], destination: '/dashboard/billing/quotes' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'masspay' }], destination: '/dashboard/billing/masspay' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'services' }], destination: '/dashboard/services' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'domains' }], destination: '/dashboard/domains' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'details' }], destination: '/dashboard/account/details' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'contacts' }], destination: '/dashboard/account/contacts' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'emails' }], destination: '/dashboard/account/emails' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'paymentmethods' }], destination: '/dashboard/account/paymentmethods' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'security' }], destination: '/dashboard/account/security' },
      { source: '/clientarea.php', destination: '/dashboard' },

      // ── /dashboard?action=... query-param style links (sidebar in dashboard-static.html) ──
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'details' }], destination: '/dashboard/account/details' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'contacts' }], destination: '/dashboard/account/contacts' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'emails' }], destination: '/dashboard/account/emails' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'security' }], destination: '/dashboard/account/security' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'paymentmethods' }], destination: '/dashboard/account/paymentmethods' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'addfunds' }], destination: '/dashboard/billing/addfunds' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'invoices' }], destination: '/dashboard/billing/invoices' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'quotes' }], destination: '/dashboard/billing/quotes' },
      { source: '/dashboard', has: [{ type: 'query', key: 'action', value: 'masspay' }], destination: '/dashboard/billing/masspay' },

      // ── Direct clean path rewrites for sidebar links ───────────────────────
      { source: '/domains', destination: '/dashboard/domains' },
      { source: '/services', destination: '/dashboard/services' },
      { source: '/billing', destination: '/dashboard/billing' },
      { source: '/billing/:path*', destination: '/dashboard/billing/:path*' },
      { source: '/support', destination: '/dashboard/support' },
      { source: '/tickets', destination: '/dashboard/tickets' },
      { source: '/announcements', destination: '/dashboard/announcements' },
      { source: '/serverstatus', destination: '/dashboard/serverstatus' },
      { source: '/knowledge-base', destination: '/dashboard/kb' },
      { source: '/knowledge-base/:path*', destination: '/dashboard/kb' },
      { source: '/cart', destination: '/dashboard/cart' },
      { source: '/cart/:path*', destination: '/dashboard/cart/:path*' },

      // ── Backend API proxy — IMPORTANT: must come AFTER /api/auth and /api/fragment ──
      // NOTE: /api/fragment, /api/user, /api/save-html are handled by Next.js internally.
      // Only proxy /api/do/* and other backend-specific routes.
      { source: '/api/do/:path*', destination: 'http://localhost:5000/api/do/:path*' },
      { source: '/api/servers/:path*', destination: 'http://localhost:5000/api/servers/:path*' },
      { source: '/api/admin/:path*', destination: 'http://localhost:5000/api/admin/:path*' },
      { source: '/api/deploy/:path*', destination: 'http://localhost:5000/api/deploy/:path*' },
    ];
  },
};

export default nextConfig;
