
import { SITE_ORIGIN } from '@/lib/site-origin';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/portal', '/api/portal'] },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
