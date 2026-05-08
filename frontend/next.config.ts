import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/password/reset', destination: '/password-reset.html' },
      { source: '/password/:path*', destination: '/password-reset.html' },
      { source: '/modules/:path*', destination: 'https://bill.ultahost.com/modules/:path*' },
      { source: '/login', destination: '/login.html' },
      { source: '/register', destination: '/register.html' },
      { source: '/register.php', destination: '/register' },
      { source: '/vds-hosting', destination: '/vds-hosting.html' },
      { source: '/gaming-hosting', destination: '/gaming-hosting.html' },
      { source: '/bluestacks-android-vps', destination: '/bluestacks-android-vps.html' },
      { source: '/crm-hosting', destination: '/crm-hosting.html' },
      { source: '/social-network-hosting', destination: '/social-network-hosting.html' },
      { source: '/login.php', destination: '/login' },
      {
        source: '/xhr.php',
        destination: `${BACKEND_URL}/api/xhr.php`,
      },
      {
        source: '/templates/:path*',
        destination: 'https://bill.ultahost.com/templates/:path*',
      },
      {
        source: '/assets/:path*',
        destination: 'https://bill.ultahost.com/assets/:path*',
      },
      {
        source: '/dashboard/templates/:path*',
        destination: 'https://bill.ultahost.com/templates/:path*',
      },
      // Broken links from audit - fix all 10
      // 1. Logout route → backend
      { source: '/api/auth/logout', destination: `${BACKEND_URL}/api/auth/logout` },
      // Support PHP files
      // 5. index.php portal home → dashboard
      { source: '/index.php', destination: '/dashboard' },
      // 6. account/paymentmethods → dashboard route
      { source: '/account/paymentmethods', destination: '/dashboard/account/paymentmethods' },
      // 8. billing/masspay with extra query → still works
      { source: '/dashboard/billing/masspay', destination: '/dashboard/billing/masspay' },
      // Support PHP files
      { source: '/submitticket.php', destination: '/dashboard/tickets/new' },
      { source: '/supporttickets.php', destination: '/dashboard/tickets' },
      { source: '/affiliates.php', destination: '/dashboard/affiliates' },
      { source: '/knowledgebase.php', destination: '/dashboard/kb' },
      { source: '/announcements.php', destination: '/dashboard/announcements' },
      { source: '/serverstatus.php', destination: '/dashboard/serverstatus' },
      { source: '/downloads.php', destination: '/dashboard/downloads' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'addfunds' }], destination: '/dashboard/billing/addfunds' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'invoices' }], destination: '/dashboard/billing/invoices' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'quotes' }], destination: '/dashboard/billing/quotes' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'services' }], destination: '/dashboard/services' },
      { source: '/clientarea.php', has: [{ type: 'query', key: 'action', value: 'domains' }], destination: '/dashboard/domains' },
      { source: '/clientarea.php', destination: '/dashboard' },
      { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` },
      { source: '/dashboard/assets/:path*', destination: 'https://bill.ultahost.com/assets/:path*' },
    ];
  },
};

export default nextConfig;
