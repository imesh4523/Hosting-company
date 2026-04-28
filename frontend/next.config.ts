import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/password/reset', destination: '/password-reset.html' },
      { source: '/password/:path*', destination: '/password-reset.html' },
      { source: '/modules/:path*', destination: 'https://bill.ultahost.com/modules/:path*' },
      { source: '/login', destination: '/login.html' },
      { source: '/register', destination: '/register.html' },
      { source: '/register.php', destination: '/register' },
      { source: '/login.php', destination: '/login' },
      {
        source: '/xhr.php',
        destination: 'http://localhost:5000/api/xhr.php',
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
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/dashboard/assets/:path*',
        destination: 'https://bill.ultahost.com/assets/:path*',
      }
    ];
  },
};

export default nextConfig;
