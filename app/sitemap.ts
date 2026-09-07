
import { SITE_ORIGIN } from '@/lib/site-origin';
import type { MetadataRoute } from 'next';
import { getPublicJobs } from '@/lib/site-repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_ORIGIN;
  let jobs: Awaited<ReturnType<typeof getPublicJobs>> = [];
  try { jobs = await getPublicJobs(); } catch { /* keep core routes available */ }
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/vacantes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/privacidad`, changeFrequency: 'monthly', priority: 0.3 },
    ...jobs.map((job) => ({ url: `${base}/vacantes/${job.slug}`, lastModified: new Date(job.updatedAt), changeFrequency: 'daily' as const, priority: 0.8 })),
  ];
}
