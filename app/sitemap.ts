import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: 'https://www.ethrovsdraft.com',
    lastModified: new Date('2026-08-28'),
    changeFrequency: 'weekly',
    priority: 1,
  }];
}
