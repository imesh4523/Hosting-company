import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
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
