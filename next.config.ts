import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    const portalHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
      { key: 'Referrer-Policy', value: 'same-origin' },
    ];
    return ['/portal', '/portal/:path*', '/api/portal/auth/:path*'].map((source) => ({
      source,
      headers: [
        ...portalHeaders,
        { key: 'Cache-Control', value: 'private, no-store' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    }));
  },
};

export default nextConfig;
