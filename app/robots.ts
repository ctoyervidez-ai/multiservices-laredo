import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/portal', '/api/portal'] },
    sitemap: 'https://www.ethrovsdraft.com/sitemap.xml',
  };
}
